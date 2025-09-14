import os
from sqlalchemy import create_engine
from databases import Database
from dotenv import load_dotenv

# --- ¡LA MAGIA ESTÁ AQUÍ! ---
# 1. Carga las variables de un archivo .env si existe.
load_dotenv()

# 2. Lee la variable de entorno 'DATABASE_URL'.
#    Si no la encuentra (porque estás en local y no la has configurado),
#    usa un valor por defecto para tu Docker Compose local.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:supersecret@db:5432/schedule_app_db")

# 3. Comprueba si la URL es de Render y la ajusta para SQLAlchemy.
#    SQLAlchemy a veces prefiere 'postgresql://' en lugar de 'postgres://'.
if "onrender.com" in DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# El resto del código funciona igual
database = Database(DATABASE_URL)
engine = create_engine(
    DATABASE_URL.replace("+asyncpg", "") # create_engine no entiende '+asyncpg'
)

# No es necesario importar metadata aquí si no se usa.