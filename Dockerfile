# Choisir une image de base
FROM node:18-alpine

# Définir des arguments de construction qui seront fournis à la construction
ARG NEXT_PUBLIC_API_URL
ARG JWT_SECRET

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package et installer les dépendances
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copier le reste du code source de l'application
COPY . .

# Définir les variables d'environnement à partir des arguments
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV JWT_SECRET=${JWT_SECRET}

# Construire l'application
RUN npm run build

# Exposer le port (le port par défaut de Next.js est 3000)
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
