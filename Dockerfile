# Utilizar una imagen de Node.js
FROM node:14

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar los archivos package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el código fuente de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Incluir el generador en el mismo contenedor que tu aplicación
COPY traffic.js ./traffic.js

# Comando para iniciar la aplicación
CMD ["npm", "start"]