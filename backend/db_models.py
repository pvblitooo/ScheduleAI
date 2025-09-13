from sqlalchemy import Table, Column, Integer, String, MetaData, ForeignKey

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
    # Clave foránea que enlaza cada actividad con un usuario
    Column("owner_id", Integer, ForeignKey("users.id"), nullable=False),
)