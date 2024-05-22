# Choisir une image de base
FROM node:latest

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code source de l'application
COPY . .

ENV NEXT_PUBLIC_API_URL=http://212.132.111.107:8080
ENV NEXT_PUBLIC_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE3MTYzMzYzNzYsImV4cCI6MTcxNjMzOTk3Nn0.fu1dMA5xds2SIRDybzdwNwJQGwtpevxpMG3TMeptmi0

# Construire l'application
RUN npm run build

# Exposer le port (le port par défaut de Next.js est 3000)
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
