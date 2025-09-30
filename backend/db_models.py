from sqlalchemy import Table, Column, Integer, String, MetaData, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("email", String, unique=True, index=True),
    Column("hashed_password", String, nullable=False),
    
    # Aquí añadiremos más campos del perfil en el futuro
)

# --- NUEVA TABLA ---
activities = Table(
    "activities",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String, nullable=False),
    Column("duration", Integer, nullable=False), # Duración en minutos
    Column("priority", String, nullable=False),  # ej: "alta", "media", "baja"
    Column("frequency", String),                 # ej: "única", "diaria"
    Column("category", String(50), nullable=False),  # <-- ¡NUEVA COLUMNA!
    Column("owner_id", Integer, ForeignKey("users.id"), nullable=False),
)

schedules = Table(
    "schedules",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String(100), nullable=False, default="Mi Rutina"),
    Column("events", JSONB, nullable=False),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    Column("owner_id", Integer, ForeignKey("users.id"), nullable=False),
)