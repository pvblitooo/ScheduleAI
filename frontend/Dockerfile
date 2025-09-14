# ---- Stage 1: Build ----
# Usa una imagen de Node para construir la aplicación React
FROM node:20 AS build

WORKDIR /app

# Copia los archivos de manifiesto y package-lock
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Construye la aplicación para producción
RUN npm run build

# ---- Stage 2: Serve ----
# Usa una imagen de Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copia los archivos construidos desde la etapa 'build' a la carpeta web de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# El comando por defecto de Nginx se encargará de iniciar el servidor
CMD ["nginx", "-g", "daemon off;"]