FROM node:20-alpine
WORKDIR /app
# On copie d'abord le package.json
COPY package.json .
# On demande à Docker d'installer Express et Cors
RUN npm install
# On copie le reste (le server.js)
COPY . .
EXPOSE 8080
# La commande pour lancer le serveur
CMD ["npm", "start"]