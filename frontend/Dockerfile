# ---- Stage 1: Build ----
# Construye la aplicación de React como siempre, pero ya no nos preocupamos por la variable de entorno aquí.
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Stage 2: Serve ----
# Usa Nginx para servir los archivos
FROM nginx:alpine

# Copia los archivos de la app construida
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configuración de Nginx para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# --- ¡LA SOLUCIÓN DEFINITIVA! ---
# 1. Crea un script de inicio ('entrypoint.sh') dentro del contenedor.
#    Este script se ejecutará cada vez que el contenedor arranque.
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'echo "window.API_BASE_URL = \\"${VITE_API_BASE_URL}\\"" > /usr/share/nginx/html/config.js' >> /entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 80

# 2. Usa este nuevo script como el comando de inicio del contenedor.
CMD ["/entrypoint.sh"]