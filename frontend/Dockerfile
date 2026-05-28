FROM node:18-alpine

WORKDIR /app

# Optimisation du cache pour les dépendances
COPY package.json package-lock.json* ./
RUN npm install

# Copie du reste du code
COPY . .

EXPOSE 3000

# Lancement en mode développement
CMD ["npm", "run", "dev"]
