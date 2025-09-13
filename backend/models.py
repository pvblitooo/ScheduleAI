from sqlalchemy import Table, Column, Integer, String, MetaData
from database import metadata

# Definición de la tabla 'users'
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(50)),
    Column("email", String(100), unique=True),
    # Más adelante añadiremos aquí el resto de campos del perfil
)