#!/bin/bash

# ==================================
# Script CI/CD pour GitHub Actions
# ==================================

set -e

echo "🚀 Déploiement automatique ZAWJ..."

# Variables
REGISTRY=${DOCKER_REGISTRY:-"ghcr.io"}
IMAGE_TAG=${GITHUB_SHA:-"latest"}
NAMESPACE="zawj-production"

# 1. Build des images
echo "📦 Build des images Docker..."
docker build -t ${REGISTRY}/zawj-backend:${IMAGE_TAG} ./backend
docker build -t ${REGISTRY}/zawj-frontend:${IMAGE_TAG} ./zawj

# 2. Tag latest
echo "🏷️  Tag des images..."
docker tag ${REGISTRY}/zawj-backend:${IMAGE_TAG} ${REGISTRY}/zawj-backend:latest
docker tag ${REGISTRY}/zawj-frontend:${IMAGE_TAG} ${REGISTRY}/zawj-frontend:latest

# 3. Push vers le registry
echo "⬆️  Push des images..."
docker push ${REGISTRY}/zawj-backend:${IMAGE_TAG}
docker push ${REGISTRY}/zawj-backend:latest
docker push ${REGISTRY}/zawj-frontend:${IMAGE_TAG}
docker push ${REGISTRY}/zawj-frontend:latest

# 4. Déploiement Kubernetes (si applicable)
if [ "$DEPLOY_TO_K8S" = "true" ]; then
    echo "☸️  Déploiement sur Kubernetes..."
    kubectl set image deployment/zawj-backend backend=${REGISTRY}/zawj-backend:${IMAGE_TAG} -n ${NAMESPACE}
    kubectl set image deployment/zawj-frontend frontend=${REGISTRY}/zawj-frontend:${IMAGE_TAG} -n ${NAMESPACE}
    kubectl rollout status deployment/zawj-backend -n ${NAMESPACE}
    kubectl rollout status deployment/zawj-frontend -n ${NAMESPACE}
fi

# 5. Déploiement Docker Compose (si applicable)
if [ "$DEPLOY_WITH_COMPOSE" = "true" ]; then
    echo "🐳 Déploiement avec Docker Compose..."
    export IMAGE_TAG=${IMAGE_TAG}
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d
fi

echo "✅ Déploiement terminé avec succès!"
