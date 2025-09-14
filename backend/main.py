import os
import json
import google.generativeai as genai
from datetime import datetime, timedelta, timezone
from typing import Annotated, List, Any, Dict

from sqlalchemy import text
from sqlalchemy import cast
from sqlalchemy.dialects.postgresql import JSONB
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from jose import JWTError, jwt

from database import database, engine
from db_models import users, metadata, activities, schedules

# --- CONFIGURACIÓN ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
SECRET_KEY = "tu_clave_secreta_super_larga_y_aleatoria_aqui"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# --- MODELOS ---
class Token(BaseModel):
    """Modelo para el token de acceso JWT."""
    access_token: str
    token_type: str


class UserBase(BaseModel):
    """Modelo base para un usuario, contiene los campos comunes."""
    email: EmailStr


class UserCreate(UserBase):
    """Modelo para la creación de un nuevo usuario, añade la contraseña."""
    password: str


class User(UserBase):
    """Modelo para representar a un usuario que se devuelve desde la API."""
    id: int


class UserInDB(User):
    """Modelo completo del usuario como existe en la base de datos, incluyendo la contraseña hasheada."""
    hashed_password: str


# --- MODELOS DE ACTIVIDADES Y PREFERENCIAS ---

class ActivityBase(BaseModel):
    """Modelo base para una actividad, con los campos que el usuario define."""
    name: str
    duration: int
    priority: str
    # La categoría ahora es un campo obligatorio.
    category: str
    frequency: str | None = None


class ActivityCreate(ActivityBase):
    """Modelo para crear una nueva actividad. No añade campos nuevos, solo hereda."""
    pass


class Activity(ActivityBase):
    """Modelo completo de la actividad como se devuelve desde la API, incluyendo su ID y el del propietario."""
    id: int
    owner_id: int


class UserPreferences(BaseModel):
    """Modelo para las preferencias del usuario al generar un horario."""
    startHour: int = 8
    endHour: int = 22

class ScheduleAnalysisRequest(BaseModel):
    events: List[Dict[str, Any]]

# --- ¡NUEVOS SCHEMAS PARA LAS RUTINAS! ---
class ScheduleBase(BaseModel):
    name: str
    events: List[dict]

class ScheduleCreate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: int
    created_at: datetime
    owner_id: int

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
origins = ["*"]
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

@app.post("/activities/", response_model=Activity)
async def create_activity(activity: ActivityCreate, user: Annotated[User, Depends(get_current_user)]):
    query = activities.insert().values(**activity.dict(), owner_id=user.id)
    activity_id = await database.execute(query)
    return Activity(id=activity_id, **activity.dict(), owner_id=user.id)

@app.get("/activities/", response_model=List[Activity])
async def read_activities(user: Annotated[User, Depends(get_current_user)]):
    query = activities.select().where(activities.c.owner_id == user.id)
    return await database.fetch_all(query)

@app.put("/activities/{activity_id}", response_model=Activity)
async def update_activity(activity_id: int, activity: ActivityCreate, user: Annotated[User, Depends(get_current_user)]):
    query = activities.select().where(activities.c.id == activity_id, activities.c.owner_id == user.id)
    existing = await database.fetch_one(query)
    if existing is None:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    update_query = activities.update().where(activities.c.id == activity_id).values(**activity.dict())
    await database.execute(update_query)
    return Activity(id=activity_id, **activity.dict(), owner_id=user.id)

@app.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(activity_id: int, user: Annotated[User, Depends(get_current_user)]):
    query = activities.select().where(activities.c.id == activity_id, activities.c.owner_id == user.id)
    existing = await database.fetch_one(query)
    if existing is None:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    delete_query = activities.delete().where(activities.c.id == activity_id)
    await database.execute(delete_query)
    return

# --- ¡NUEVOS ENDPOINTS CRUD PARA RUTINAS! ---
@app.post("/schedules/", response_model=Schedule, status_code=status.HTTP_201_CREATED)
async def create_schedule(schedule_data: ScheduleCreate, user: Annotated[User, Depends(get_current_user)]):
    query = schedules.insert().values(
        name=schedule_data.name,
        events=json.dumps(schedule_data.events),
        owner_id=user.id
    )
    schedule_id = await database.execute(query)
    
    # Obtenemos el registro recién creado
    created_schedule_record = await database.fetch_one(schedules.select().where(schedules.c.id == schedule_id))
    
    # --- ¡CORRECCIÓN! Convertimos el registro a un diccionario y parseamos el JSON ---
    response_data = dict(created_schedule_record)
    response_data["events"] = json.loads(response_data["events"])
    
    return response_data

@app.get("/schedules/", response_model=List[Schedule])
async def get_schedules(user: Annotated[User, Depends(get_current_user)]):
    query = schedules.select().where(schedules.c.owner_id == user.id)
    db_schedules = await database.fetch_all(query)
    
    # --- ¡CORRECCIÓN! Iteramos y convertimos el campo 'events' de cada rutina ---
    response_schedules = []
    for record in db_schedules:
        schedule_dict = dict(record)
        schedule_dict["events"] = json.loads(schedule_dict["events"])
        response_schedules.append(schedule_dict)
        
    return response_schedules

@app.put("/schedules/{schedule_id}", response_model=Schedule)
async def update_schedule(schedule_id: int, schedule_data: ScheduleCreate, user: Annotated[User, Depends(get_current_user)]):
    """Actualiza una rutina existente (nombre o eventos)."""
    # Primero, verifica que la rutina exista
    find_query = schedules.select().where(schedules.c.id == schedule_id, schedules.c.owner_id == user.id)
    existing_schedule = await database.fetch_one(find_query)
    if not existing_schedule:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")

    # --- ESTA ES LA CORRECCIÓN DEFINITIVA ---
    # Construimos la consulta de actualización usando el builder de SQLAlchemy
    update_query = (
        schedules.update()
        .where(schedules.c.id == schedule_id)
        .values(
            name=schedule_data.name,
            # Usamos cast() para decirle explícitamente a PostgreSQL:
            # "Este string que te paso, trátalo como un dato de tipo JSONB"
            events=cast(json.dumps(schedule_data.events), JSONB)
        )
    )
    
    # Ejecutamos la consulta construida
    await database.execute(update_query)
    # -----------------------------------------

    # Devolvemos la rutina actualizada para confirmar que se guardó
    updated_schedule_record = await database.fetch_one(schedules.select().where(schedules.c.id == schedule_id))
    response_data = dict(updated_schedule_record)
    response_data["events"] = json.loads(response_data["events"])
    
    return response_data


@app.delete("/schedules/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(schedule_id: int, user: Annotated[User, Depends(get_current_user)]):
    # (Este endpoint no devuelve datos, así que no necesita cambios)
    query = schedules.delete().where(schedules.c.id == schedule_id, schedules.c.owner_id == user.id)
    result = await database.execute(query)
    if result == 0:
        raise HTTPException(status_code=404, detail="Rutina no encontrada.")
    return

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
        # --- ¡CAMBIO CLAVE! ---
        # Ahora le pasamos la categoría a la IA para que la conozca
        prompt_text += f"- Tarea: {act.name}, Duración: {act.duration} minutos, Prioridad: {act.priority}, Categoría: {act.category}\n"
    
    prompt_text += (
        "\nDevuelve SÓLO un array de objetos JSON. Cada objeto debe tener 'title', 'start', 'end' y, MUY IMPORTANTE, 'category'. "
        "La 'category' debe ser una de las que se te proporcionaron (ej: 'estudio', 'ejercicio', 'trabajo', etc.). "
        "Las fechas deben estar en formato 'YYYY-MM-DDTHH:MM:SS' y corresponder a la semana genérica del 2024-01-01 al 2024-01-07. No añadas texto adicional."
    )
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
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

@app.post("/analyze-schedule", response_model=List[str])
async def analyze_schedule_endpoint(request: ScheduleAnalysisRequest, user: Annotated[User, Depends(get_current_user)]):
    """
    Analiza el horario actual usando la IA de Gemini para dar sugerencias de mejora.
    """
    try:
        # --- ¡CAMBIO CLAVE! ---
        # Añadimos el nombre del día a cada evento para que la IA tenga más contexto.
        days_of_week = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
        events_with_day_name = []
        for event in request.events:
            try:
                # Extraemos el día de la semana (0=Lunes, 6=Domingo) de la fecha de inicio
                event_date = datetime.fromisoformat(event['start'])
                day_index = event_date.weekday()
                # Añadimos el nombre del día al objeto del evento
                events_with_day_name.append({**event, "day_of_week": days_of_week[day_index]})
            except (ValueError, KeyError):
                # Si un evento no tiene fecha, lo ignoramos para el análisis
                continue
        
        schedule_json_str = json.dumps(events_with_day_name, indent=2, ensure_ascii=False)

        prompt_text = f"""
        Eres un coach de productividad y bienestar llamado 'ScheduleAI'.
        Analiza el horario semanal del usuario y genera 3 sugerencias prácticas.

        Horario del usuario:
        {schedule_json_str}

        Reglas de respuesta:
        - Basa tus sugerencias en los datos. Refiérete a los días por su nombre (ej. "el Lunes", "el Miércoles").
        - No menciones fechas como "1 de enero".
        - Devuelve un objeto JSON con la clave "suggestions" que contenga una lista de strings.

        Ejemplo de respuesta deseada:
        {{
            "suggestions": [
                "Noté que el Martes tienes 3 horas de estudio seguidas. Un breve descanso en medio podría potenciar tu concentración.",
                "¡Genial que incluyas 'Ejercicio'! Para crear un hábito, podrías intentar que sea siempre a la misma hora los Lunes y Jueves.",
                "Tus bloques de 'Ocio' del fin de semana son perfectos para recargar energía. ¡Disfrútalos!"
            ]
        }}
        """

        # --- ¡LLAMADA CORRECTA Y FINAL A LA API DE GOOGLE GEMINI! ---
        model = genai.GenerativeModel('gemini-2.5-flash-lite') # <-- ¡EL MODELO CORRECTO!
        response = await model.generate_content_async(prompt_text)
        
        response_text = response.text.strip()
        
        if response_text.startswith('```json'):
            response_text = response_text[7:-3].strip()

        if not response_text:
            raise ValueError("La respuesta de la IA está vacía.")
            
        response_data = json.loads(response_text)

        if isinstance(response_data, dict) and 'suggestions' in response_data:
            return response_data['suggestions']
        else:
            raise HTTPException(status_code=500, detail="La respuesta de la IA no tuvo el formato esperado.")

    except Exception as e:
        print(f"Error durante el análisis de la IA: {e}")
        raise HTTPException(status_code=500, detail="No se pudieron generar las sugerencias.")
