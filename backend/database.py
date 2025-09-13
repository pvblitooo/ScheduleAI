from databases import Database
from sqlalchemy import create_engine
from db_models import metadata # Importamos los metadatos

DATABASE_URL = "postgresql+asyncpg://admin:supersecret@db:5432/schedule_app_db"

database = Database(DATABASE_URL)

engine = create_engine(
    DATABASE_URL.replace("+asyncpg", "")
)

# La siguiente línea es crucial para que el script de creación funcione
# metadata.create_all(bind=engine)
# ¡La dejamos comentada aquí para no ejecutarla por accidente!
# La ejecutaremos a través de un script separado si es necesario.