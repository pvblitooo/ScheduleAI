import os
import json
import google.generativeai as genai
from datetime import datetime, timedelta, timezone
from typing import Annotated, List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt

from database import database, engine
from db_models import users, metadata, activities

# --- CONFIGURACIÓN ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
SECRET_KEY = "tu_clave_secreta_super_larga_y_aleatoria_aqui"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# --- MODELOS ---
class Token(BaseModel): access_token: str; token_type: str
class UserBase(BaseModel): email: EmailStr
class UserCreate(UserBase): password: str
class User(UserBase): id: int
class UserInDB(User): hashed_password: str
class ActivityBase(BaseModel): name: str; duration: int; priority: str; frequency: str | None = None
class ActivityCreate(ActivityBase): pass
class Activity(ActivityBase): id: int; owner_id: int
class UserPreferences(BaseModel): startHour: int = 8; endHour: int = 22

# --- FUNCIONES AUTH ---
def verify_password(p, h): return pwd_context.verify(p, h)
def get_password_hash(p): return pwd_context.hash(p)
async def get_user_from_db(email: str):
    q = users.select().where(users.c.email == email)
    rec = await database.fetch_one(q)
    return UserInDB(**rec) if rec else None
def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    cred_exc = HTTPException(status.HTTP_401_UNAUTHORIZED, "Could not validate credentials", {"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None: raise cred_exc
    except JWTError: raise cred_exc
    user = await get_user_from_db(email=email)
    if user is None: raise cred_exc
    return user

# --- APP ---
app = FastAPI(title="API del Organizador de Horarios")
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup(): metadata.create_all(bind=engine); await database.connect()
@app.on_event("shutdown")
async def shutdown(): await database.disconnect()

# --- ENDPOINTS ---
@app.post("/token", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await get_user_from_db(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password): raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password")
    exp = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(data={"sub": user.email}, expires_delta=exp)
    return {"access_token": token, "token_type": "bearer"}

@app.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    if await get_user_from_db(user.email): raise HTTPException(status.HTTP_400_BAD_REQUEST, "El correo ya está registrado.")
    hp = get_password_hash(user.password)
    q = users.insert().values(email=user.email, hashed_password=hp)
    user_id = await database.execute(q)
    return User(id=user_id, email=user.email)

@app.get("/activities/", response_model=List[Activity])
async def read_activities(user: Annotated[User, Depends(get_current_user)]):
    q = activities.select().where(activities.c.owner_id == user.id)
    return await database.fetch_all(q)
# (Aquí irían los otros endpoints de actividades: create, update, delete)

# --- ENDPOINT DE IA PARA PLANTILLA SEMANAL ---
@app.post("/generate-schedule")
async def generate_schedule(preferences: UserPreferences, user: Annotated[User, Depends(get_current_user)]):
    user_activities = await read_activities(user)
    if not user_activities: return []

    # --- ¡NUEVO PROMPT ENFOCADO EN PLANTILLA! ---
    prompt_text = (
        f"Eres un experto en productividad. Tu objetivo es crear la **plantilla de horario semanal ideal y repetible** para un usuario, de Lunes a Domingo. "
        f"El horario de cada día debe ir desde las {preferences.startHour}:00 hasta las {preferences.endHour}:00. "
        "Asigna las siguientes actividades a los días y horas más lógicos para maximizar la productividad y el bienestar. "
        "Para las fechas, usa una semana genérica que empiece en Lunes, por ejemplo, del '2024-01-01' (Lunes) al '2024-01-07' (Domingo).\n\n"
        "Actividades del usuario:\n"
    )
    for act in user_activities:
        prompt_text += f"- Tarea: {act.name}, Duración: {act.duration} minutos, Prioridad: {act.priority}\n"
    
    prompt_text += (
        "\nDevuelve SÓLO un array de objetos JSON. Cada objeto debe tener 'title', 'start' y 'end'. "
        "Las fechas deben estar en formato 'YYYY-MM-DDTHH:MM:SS' y corresponder a la semana genérica del 2024-01-01 al 2024-01-07. No añadas texto adicional."
    )
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = await model.generate_content_async(prompt_text)
        
        response_text = response.text.strip()
        if response_text.startswith('```json'): response_text = response_text[7:]
        if response_text.endswith('```'): response_text = response_text[:-3]
        response_text = response_text.strip()

        if not response_text: raise ValueError("Respuesta vacía.")
        return json.loads(response_text)
    except Exception as e:
        print(f"Error generando horario: {e}")
        raise HTTPException(status_code=500, detail="Error procesando la respuesta de la IA.")
