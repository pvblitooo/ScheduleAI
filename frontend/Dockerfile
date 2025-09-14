# ---- Stage 1: Build ----
# Declara un argumento que puede ser pasado durante el build
ARG VITE_API_BASE_URL

# Usa una imagen de Node para construir la aplicación React
FROM node:20 AS build
WORKDIR /app

# Pasa el argumento del build como una variable de entorno para el proceso de build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copia los archivos de manifiesto e instala dependencias
COPY package*.json ./
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# El comando 'npm run build' ahora tendrá acceso a la variable
RUN npm run build

# ---- Stage 2: Serve ----
# Usa una imagen de Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copia los archivos construidos desde la etapa 'build'
COPY --from=build /app/dist /usr/share/nginx/html

# Copia nuestro archivo de configuración personalizado para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

# Comando para iniciar el servidor Nginx
CMD ["nginx", "-g", "daemon off;"]