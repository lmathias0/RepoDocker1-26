# 1. On part de l'image officielle Node.js (version 20, version 'alpine' très légère)
FROM node:20-alpine

# 2. On crée un dossier de travail à l'intérieur de la machine
WORKDIR /app

# 3. On copie tous tes fichiers (index.html, css, js) dans ce dossier /app
COPY . .

# 4. On installe globalement 'serve', un mini-serveur web fait en Node.js pour lire le HTML
RUN npm install -g serve

# 5. On indique que l'application va tourner sur le port 3000
EXPOSE 3000

# 6. La commande pour lancer le serveur web quand la machine démarre
# serve va lire le dossier actuel (".") et l'exposer sur le port 3000
# Cette ligne remplace le texte dans api.js, PUIS lance le serveur web
CMD ["sh", "-c", "sed -i \"s|API_URL_PLACEHOLDER|${API_URL}|g\" ./js/api.js && serve -s . -l 3000"]