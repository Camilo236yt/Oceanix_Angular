# Etapa 1: Build de la aplicación
FROM node:24-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm ci --legacy-peer-deps

# Copia el resto del código fuente
COPY . .

# Construye la aplicación para producción
RUN npm run build

# Etapa 2: Servidor web con nginx
FROM nginx:alpine

# Copia la configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copia los archivos construidos desde la etapa de build
COPY --from=builder /app/dist/Oceanix_F/browser /usr/share/nginx/html

# Expone el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
