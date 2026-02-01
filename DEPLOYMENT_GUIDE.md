# 🚀 Guide de Déploiement Cloud - ZAWJ

Ce guide vous accompagne pour déployer l'application ZAWJ sur différentes plateformes cloud.

## 📋 Table des matières

1. [Architecture Docker](#architecture-docker)
2. [Prérequis](#prérequis)
3. [Configuration](#configuration)
4. [Déploiement Local](#déploiement-local)
5. [Déploiement Cloud](#déploiement-cloud)
   - [AWS (ECS/Fargate)](#aws-ecsfargate)
   - [Google Cloud Platform (Cloud Run)](#google-cloud-platform)
   - [Azure (Container Apps)](#azure-container-apps)
   - [DigitalOcean](#digitalocean)
6. [Gestion des certificats SSL](#gestion-des-certificats-ssl)
7. [Monitoring et Logs](#monitoring-et-logs)
8. [Maintenance](#maintenance)

---

## 🏗️ Architecture Docker

L'application est composée de 4 conteneurs principaux :

```
┌─────────────────────────────────────────────────────────┐
│                         Nginx                           │
│              (Reverse Proxy + SSL)                      │
│                     Port 80/443                         │
└────────────┬──────────────────────────┬─────────────────┘
             │                          │
             ▼                          ▼
   ┌─────────────────┐        ┌──────────────────┐
   │    Frontend     │        │     Backend      │
   │   (Next.js)     │        │  (Node.js/TS)    │
   │   Port 3000     │        │    Port 5000     │
   └─────────────────┘        └────────┬─────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │    MongoDB      │
                              │   Port 27017    │
                              └─────────────────┘
```

### Fonctionnalités

- **Multi-stage builds** : Images optimisées et légères
- **Health checks** : Surveillance automatique de la santé des services
- **Non-root users** : Sécurité renforcée
- **Standalone Next.js** : Build optimisé pour la production
- **Rate limiting** : Protection contre les abus
- **SSL/TLS** : Chiffrement HTTPS

---

## 🔧 Prérequis

### Localement

- Docker Engine 24.0+
- Docker Compose 2.0+
- 4 GB RAM minimum
- 10 GB espace disque

### Cloud

- Compte cloud (AWS/GCP/Azure/DigitalOcean)
- CLI installé (aws-cli, gcloud, az-cli, doctl)
- Nom de domaine configuré
- Variables d'environnement configurées

---

## ⚙️ Configuration

### 1. Copier le fichier d'environnement

```bash
cp .env.production.example .env
```

### 2. Configurer les variables d'environnement

Éditez le fichier `.env` et modifiez les valeurs suivantes :

```env
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=VOTRE_MOT_DE_PASSE_SECURISE

# JWT
JWT_SECRET=VOTRE_SECRET_JWT_32_CARACTERES_MINIMUM

# Stripe
STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_STRIPE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-app

# URLs (remplacez par votre domaine)
FRONTEND_URL=https://votre-domaine.com
ALLOWED_ORIGINS=https://votre-domaine.com

# Frontend
NEXT_PUBLIC_API_URL=https://votre-domaine.com/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_VOTRE_CLE_PUBLIQUE
```

### 3. Configurer Nginx

Modifiez `nginx/nginx.conf` et remplacez :

```nginx
server_name your-domain.com www.your-domain.com;
```

par votre nom de domaine réel.

---

## 🏠 Déploiement Local

### Déploiement rapide

```bash
# Donner les droits d'exécution au script
chmod +x deploy.sh

# Lancer le déploiement
./deploy.sh
```

### Déploiement manuel

```bash
# Build des images
docker-compose build

# Lancer les services
docker-compose up -d

# Vérifier l'état
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### Commandes utiles

```bash
# Arrêter tous les services
docker-compose down

# Redémarrer un service
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs -f backend

# Accéder au shell d'un conteneur
docker-compose exec backend sh

# Rebuild sans cache
docker-compose build --no-cache

# Nettoyer les volumes
docker-compose down -v
```

---

## ☁️ Déploiement Cloud

### AWS (ECS/Fargate)

#### 1. Préparer les images

```bash
# Se connecter à ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin VOTRE_COMPTE.dkr.ecr.eu-west-1.amazonaws.com

# Créer les repositories
aws ecr create-repository --repository-name zawj-frontend
aws ecr create-repository --repository-name zawj-backend

# Build et push des images
docker build -t zawj-frontend ./zawj
docker tag zawj-frontend:latest VOTRE_COMPTE.dkr.ecr.eu-west-1.amazonaws.com/zawj-frontend:latest
docker push VOTRE_COMPTE.dkr.ecr.eu-west-1.amazonaws.com/zawj-frontend:latest

docker build -t zawj-backend ./backend
docker tag zawj-backend:latest VOTRE_COMPTE.dkr.ecr.eu-west-1.amazonaws.com/zawj-backend:latest
docker push VOTRE_COMPTE.dkr.ecr.eu-west-1.amazonaws.com/zawj-backend:latest
```

#### 2. Créer un cluster ECS

```bash
aws ecs create-cluster --cluster-name zawj-cluster
```

#### 3. Créer une task definition

Créez `aws-task-definition.json` :

```json
{
  "family": "zawj-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "VOTRE_COMPTE.dkr.ecr.eu-west-1.amazonaws.com/zawj-frontend:latest",
      "portMappings": [{"containerPort": 3000}],
      "environment": [
        {"name": "NEXT_PUBLIC_API_URL", "value": "https://api.votre-domaine.com"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/zawj",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "frontend"
        }
      }
    },
    {
      "name": "backend",
      "image": "VOTRE_COMPTE.dkr.ecr.eu-west-1.amazonaws.com/zawj-backend:latest",
      "portMappings": [{"containerPort": 5000}],
      "environment": [
        {"name": "MONGODB_URI", "value": "mongodb://..."}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/zawj",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "backend"
        }
      }
    }
  ]
}
```

#### 4. Déployer

```bash
aws ecs register-task-definition --cli-input-json file://aws-task-definition.json

aws ecs create-service \
  --cluster zawj-cluster \
  --service-name zawj-service \
  --task-definition zawj-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

#### 5. Configurer l'Application Load Balancer

```bash
# Créer un ALB
aws elbv2 create-load-balancer \
  --name zawj-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# Créer un target group
aws elbv2 create-target-group \
  --name zawj-tg \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxx \
  --target-type ip
```

---

### Google Cloud Platform (Cloud Run)

#### 1. Préparer le projet

```bash
gcloud config set project VOTRE_PROJECT_ID
gcloud auth configure-docker
```

#### 2. Build et push des images

```bash
# Frontend
docker build -t gcr.io/VOTRE_PROJECT_ID/zawj-frontend ./zawj
docker push gcr.io/VOTRE_PROJECT_ID/zawj-frontend

# Backend
docker build -t gcr.io/VOTRE_PROJECT_ID/zawj-backend ./backend
docker push gcr.io/VOTRE_PROJECT_ID/zawj-backend
```

#### 3. Déployer sur Cloud Run

```bash
# Déployer le backend
gcloud run deploy zawj-backend \
  --image gcr.io/VOTRE_PROJECT_ID/zawj-backend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="mongodb+srv://...",JWT_SECRET="..." \
  --memory 1Gi \
  --cpu 1

# Déployer le frontend
gcloud run deploy zawj-frontend \
  --image gcr.io/VOTRE_PROJECT_ID/zawj-frontend \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL="https://zawj-backend-xxx.run.app" \
  --memory 512Mi \
  --cpu 1
```

#### 4. Configurer le domaine personnalisé

```bash
gcloud run domain-mappings create \
  --service zawj-frontend \
  --domain votre-domaine.com \
  --region europe-west1
```

---

### Azure (Container Apps)

#### 1. Créer un groupe de ressources

```bash
az group create --name zawj-rg --location westeurope
```

#### 2. Créer un Container Registry

```bash
az acr create --resource-group zawj-rg --name zawjregistry --sku Basic
az acr login --name zawjregistry
```

#### 3. Build et push des images

```bash
# Tag et push
docker tag zawj-frontend zawjregistry.azurecr.io/zawj-frontend:latest
docker push zawjregistry.azurecr.io/zawj-frontend:latest

docker tag zawj-backend zawjregistry.azurecr.io/zawj-backend:latest
docker push zawjregistry.azurecr.io/zawj-backend:latest
```

#### 4. Créer un Container Apps Environment

```bash
az containerapp env create \
  --name zawj-env \
  --resource-group zawj-rg \
  --location westeurope
```

#### 5. Déployer les applications

```bash
# Backend
az containerapp create \
  --name zawj-backend \
  --resource-group zawj-rg \
  --environment zawj-env \
  --image zawjregistry.azurecr.io/zawj-backend:latest \
  --target-port 5000 \
  --ingress external \
  --env-vars MONGODB_URI=secretref:mongodb-uri JWT_SECRET=secretref:jwt-secret

# Frontend
az containerapp create \
  --name zawj-frontend \
  --resource-group zawj-rg \
  --environment zawj-env \
  --image zawjregistry.azurecr.io/zawj-frontend:latest \
  --target-port 3000 \
  --ingress external \
  --env-vars NEXT_PUBLIC_API_URL=https://zawj-backend.xxx.azurecontainerapps.io
```

---

### DigitalOcean

#### 1. Installer doctl

```bash
snap install doctl
doctl auth init
```

#### 2. Créer un Container Registry

```bash
doctl registry create zawj-registry
doctl registry login
```

#### 3. Push des images

```bash
docker tag zawj-frontend registry.digitalocean.com/zawj-registry/frontend:latest
docker push registry.digitalocean.com/zawj-registry/frontend:latest

docker tag zawj-backend registry.digitalocean.com/zawj-registry/backend:latest
docker push registry.digitalocean.com/zawj-registry/backend:latest
```

#### 4. Créer une App

Créez `digitalocean-app.yaml` :

```yaml
name: zawj-app
region: fra
services:
  - name: backend
    image:
      registry_type: DOCR
      repository: zawj-registry/backend
      tag: latest
    instance_count: 2
    instance_size_slug: basic-xs
    http_port: 5000
    envs:
      - key: MONGODB_URI
        value: ${MONGODB_URI}
      - key: JWT_SECRET
        value: ${JWT_SECRET}
    health_check:
      http_path: /health
      
  - name: frontend
    image:
      registry_type: DOCR
      repository: zawj-registry/frontend
      tag: latest
    instance_count: 2
    instance_size_slug: basic-xs
    http_port: 3000
    envs:
      - key: NEXT_PUBLIC_API_URL
        value: ${backend.PUBLIC_URL}/api
    routes:
      - path: /
```

#### 5. Déployer

```bash
doctl apps create --spec digitalocean-app.yaml
```

---

## 🔒 Gestion des certificats SSL

### Let's Encrypt avec Certbot

#### 1. Installer Certbot

```bash
docker run -it --rm --name certbot \
  -v "${PWD}/nginx/ssl:/etc/letsencrypt" \
  -v "${PWD}/nginx/certbot:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email votre-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d votre-domaine.com \
  -d www.votre-domaine.com
```

#### 2. Renouvellement automatique

Créez un cronjob :

```bash
0 0 1 * * docker run --rm -v "${PWD}/nginx/ssl:/etc/letsencrypt" -v "${PWD}/nginx/certbot:/var/www/certbot" certbot/certbot renew && docker-compose restart nginx
```

---

## 📊 Monitoring et Logs

### Voir les logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend

# Dernières 100 lignes
docker-compose logs --tail=100 backend
```

### Monitoring des ressources

```bash
# Stats en temps réel
docker stats

# Avec docker-compose
docker-compose top
```

### Intégration avec services externes

- **Datadog** : Ajoutez l'agent Datadog au docker-compose
- **New Relic** : Ajoutez les variables d'environnement NEW_RELIC_*
- **Sentry** : Configurez SENTRY_DSN dans le backend
- **CloudWatch** (AWS) : Utilisez awslogs dans les task definitions

---

## 🔧 Maintenance

### Mise à jour de l'application

```bash
# Pull les dernières modifications
git pull origin main

# Rebuild et redéployer
docker-compose build
docker-compose up -d

# Vérifier les nouveaux containers
docker-compose ps
```

### Sauvegarde de MongoDB

```bash
# Backup
docker-compose exec mongodb mongodump \
  --username admin \
  --password votre_password \
  --authenticationDatabase admin \
  --out /data/backup

# Copier le backup hors du conteneur
docker cp zawj-mongodb:/data/backup ./mongodb-backup-$(date +%Y%m%d)

# Restauration
docker-compose exec mongodb mongorestore \
  --username admin \
  --password votre_password \
  --authenticationDatabase admin \
  /data/backup
```

### Nettoyage

```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune -a

# Supprimer les volumes non utilisés
docker volume prune

# Tout nettoyer
docker system prune -a --volumes
```

---

## 🆘 Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier la connexion MongoDB
docker-compose exec backend sh
ping mongodb
```

### Le frontend ne se connecte pas au backend

Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers la bonne URL du backend.

### Erreurs de certificat SSL

Assurez-vous que les certificats sont dans `nginx/ssl/` et que les chemins dans `nginx.conf` sont corrects.

### Erreur de connexion MongoDB

Vérifiez que `MONGODB_URI` contient les bons identifiants et que MongoDB est accessible.

---

## 📚 Ressources supplémentaires

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

## 📞 Support

Pour toute question ou problème, créez une issue sur le repository GitHub.

**Bon déploiement ! 🚀**
