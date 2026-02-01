#!/bin/bash

# ==================================
# Script de déploiement Docker Cloud
# ==================================

set -e

echo "🚀 Démarrage du déploiement ZAWJ..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier que docker-compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Vérifier que le fichier .env existe
if [ ! -f .env ]; then
    echo "❌ Fichier .env non trouvé. Copiez .env.production.example vers .env et configurez-le."
    exit 1
fi

# Charger les variables d'environnement
source .env

echo "📦 Arrêt des conteneurs existants..."
docker-compose down

echo "🧹 Nettoyage des anciennes images..."
docker system prune -f

echo "🏗️  Construction des images Docker..."
docker-compose build --no-cache

echo "🚢 Démarrage des services..."
docker-compose up -d

echo "⏳ Attente du démarrage des services..."
sleep 30

echo "🏥 Vérification de la santé des services..."

# Vérifier MongoDB
if docker-compose ps mongodb | grep -q "Up"; then
    echo "✅ MongoDB est en cours d'exécution"
else
    echo "❌ MongoDB n'a pas démarré correctement"
    docker-compose logs mongodb
    exit 1
fi

# Vérifier Backend
if docker-compose ps backend | grep -q "Up"; then
    echo "✅ Backend est en cours d'exécution"
else
    echo "❌ Backend n'a pas démarré correctement"
    docker-compose logs backend
    exit 1
fi

# Vérifier Frontend
if docker-compose ps frontend | grep -q "Up"; then
    echo "✅ Frontend est en cours d'exécution"
else
    echo "❌ Frontend n'a pas démarré correctement"
    docker-compose logs frontend
    exit 1
fi

# Vérifier Nginx
if docker-compose ps nginx | grep -q "Up"; then
    echo "✅ Nginx est en cours d'exécution"
else
    echo "❌ Nginx n'a pas démarré correctement"
    docker-compose logs nginx
    exit 1
fi

echo ""
echo "🎉 Déploiement réussi!"
echo ""
echo "📊 Services disponibles:"
echo "   - Frontend: http://localhost (redirige vers https)"
echo "   - Backend API: http://localhost/api"
echo "   - WebSocket: ws://localhost/socket.io"
echo ""
echo "📝 Commandes utiles:"
echo "   - Voir les logs: docker-compose logs -f [service]"
echo "   - Arrêter: docker-compose down"
echo "   - Redémarrer: docker-compose restart [service]"
echo "   - État: docker-compose ps"
echo ""
