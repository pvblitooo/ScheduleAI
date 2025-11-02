from sqlalchemy import Table, Column, Integer, String, MetaData, ForeignKey, JSON, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB, ARRAY

metadata = MetaData()

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("first_name", String(50), nullable=False),
    Column("last_name", String(50), nullable=False),
    Column("email", String, unique=True, index=True),
    Column("hashed_password", String, nullable=False),
    
    # Aquí añadiremos más campos del perfil en el futuro
)

persistent_tokens = Table(
    "persistent_tokens",
    metadata,
    Column("id", Integer, primary_key=True),
    # Guardará el HASH del token, no el token en sí
    Column("token_hash", String(255), unique=True, index=True, nullable=False), 
    Column("user_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("expires_at", DateTime, nullable=False),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
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
    Column("is_recurrent", Boolean, default=False, nullable=False),
    Column("recurrent_days", JSONB, nullable=True), # Guarda la lista de días, ej: [1, 3, 5]
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
    Column("is_active", Boolean, default=False, nullable=False),
) 