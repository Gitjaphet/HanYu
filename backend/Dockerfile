FROM python:3.11-slim

WORKDIR /app

# Installation des dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code source
COPY . .

# Variables d'environnement pour le développement
ENV FLASK_APP=app.py
ENV FLASK_DEBUG=1
ENV FLASK_RUN_HOST=0.0.0.0

EXPOSE 5000

# Lancement du serveur de développement Flask
CMD ["flask", "run"]
