# ---- Stage 1: Build ----
# Esta fase construye la aplicación de React. No cambia.
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Stage 2: Serve ----
# Esta fase sirve los archivos con Nginx.
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# --- ¡LA SOLUCIÓN CORREGIDA Y FINAL! ---
# Crea un script de inicio ('entrypoint.sh') de una forma más robusta
# que evita problemas con las comillas y caracteres especiales.
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'cat <<EOF > /usr/share/nginx/html/config.js' >> /entrypoint.sh && \
    echo 'window.API_BASE_URL = "${VITE_API_BASE_URL}";' >> /entrypoint.sh && \
    echo 'EOF' >> /entrypoint.sh && \
    echo 'nginx -g "daemon off;"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 80

# Usa el nuevo script como el comando de inicio del contenedor.
CMD ["/entrypoint.sh"]