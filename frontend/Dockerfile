# ---- Stage 1: Build ----
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:alpine

# Copia los archivos de la app construida
COPY --from=build /app/dist /usr/share/nginx/html

# ¡NUEVA LÍNEA! Copia nuestro archivo de configuración personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]