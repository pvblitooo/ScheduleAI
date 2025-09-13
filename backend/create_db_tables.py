from database import engine, metadata
from models import users  # Asegúrate de importar todos tus modelos aquí en el futuro

def main():
    print("Creando tablas en la base de datos...")
    try:
        metadata.create_all(bind=engine)
        print("¡Tablas creadas exitosamente!")
    except Exception as e:
        print(f"Error al crear las tablas: {e}")

if __name__ == "__main__":
    main()