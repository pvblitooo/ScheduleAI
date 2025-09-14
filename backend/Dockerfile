# Usa una imagen oficial de Python
FROM python:3.11-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia el archivo de requerimientos
COPY requirements.txt .

# Instala las dependencias, incluyendo Gunicorn
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copia todo el código de la aplicación
COPY . .

# Expone el puerto en el que correrá Gunicorn
EXPOSE 8000

# Comando para correr la app con Gunicorn
# bind: Escucha en todas las interfaces de red en el puerto 8000.
# workers: Número de procesos para manejar peticiones. 4 es un buen punto de partida.
# k uvicorn.workers.UvicornWorker: Le dice a Gunicorn que use Uvicorn para manejar los procesos.
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]