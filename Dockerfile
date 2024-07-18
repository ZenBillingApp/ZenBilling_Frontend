# Choisir une image de base
FROM node:18-alpine


# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package et installer les dépendances
COPY package*.json ./
RUN npm install --verbose

# Copier le reste du code source de l'application
COPY . .

ENV NEXT_PUBLIC_API_URL=http://212.132.111.107:8080

# Construire l'application
RUN npm run build

# Exposer le port (le port par défaut de Next.js est 3000)
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
