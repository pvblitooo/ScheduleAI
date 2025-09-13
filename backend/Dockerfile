# Usamos una imagen oficial de Python como base
FROM python:3.11-slim

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero el archivo de requerimientos
COPY requirements.txt .

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código de nuestra aplicación
COPY . .

# Este comando se ejecutará cuando el contenedor inicie (lo definiremos en docker-compose)
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]