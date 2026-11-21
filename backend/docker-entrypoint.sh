#!/bin/sh
# Démarrage du conteneur API : base à jour, contenu à jour, puis le serveur.
set -e

echo "→ Migrations de la base (alembic upgrade head)"
alembic upgrade head

echo "→ Contenu des leçons (import idempotent de lessons.json)"
python -m app.seed.load_lessons

echo "→ Démarrage de l'API"
exec "$@"
