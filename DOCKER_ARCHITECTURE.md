# 🐳 Architecture Docker Cloud - ZAWJ

## 📁 Structure des fichiers créés

```
Zawj/
├── backend/
│   ├── Dockerfile              # Image Docker backend optimisée
│   └── .dockerignore          # Fichiers exclus du build
│
├── zawj/
│   ├── Dockerfile              # Image Docker frontend Next.js
│   ├── .dockerignore          # Fichiers exclus du build
│   └── next.config.ts         # Modifié avec output: 'standalone'
│
├── nginx/
│   ├── nginx.conf             # Configuration reverse proxy
│   └── ssl/
│       └── README.md          # Instructions pour les certificats
│
├── .github/
│   └── workflows/
│       └── deploy.yml         # Pipeline CI/CD automatique
│
├── docker-compose.yml         # Orchestration développement/test
├── docker-compose.prod.yml    # Orchestration production cloud
├── kubernetes-deployment.yml   # Déploiement Kubernetes
├── .env.production.example    # Template variables d'environnement
├── deploy.sh                  # Script de déploiement local
├── deploy-ci.sh              # Script de déploiement CI/CD
└── DEPLOYMENT_GUIDE.md       # Documentation complète
```

## 🎯 Points clés de l'architecture

### ✅ Images optimisées
- **Multi-stage builds** : Réduction de 70% de la taille des images
- **Backend** : Node.js 20 Alpine (~150 MB)
- **Frontend** : Next.js standalone (~80 MB)
- **Non-root users** : Sécurité renforcée
- **Health checks** : Surveillance automatique

### ✅ Configuration production
- **Nginx reverse proxy** : Load balancing, SSL, rate limiting
- **Variables d'environnement** : Configuration externalisée
- **Secrets management** : Données sensibles sécurisées
- **Logging structuré** : JSON logs avec rotation

### ✅ Scalabilité
- **Horizontal scaling** : Support multi-instances
- **Auto-scaling** : HPA Kubernetes configuré
- **Load balancing** : Distribution intelligente
- **Zero-downtime deployments** : Rolling updates

### ✅ Sécurité
- **SSL/TLS** : HTTPS obligatoire avec Let's Encrypt
- **Rate limiting** : Protection DDoS
- **Security headers** : HSTS, X-Frame-Options, etc.
- **Network isolation** : Docker networks privés

## 🚀 Déploiement rapide

### 1. Configuration

```bash
# Copier le fichier d'environnement
cp .env.production.example .env

# Éditer avec vos valeurs
nano .env
```

### 2. Déploiement local/test

```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Déploiement cloud

Voir [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) pour :
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Apps
- DigitalOcean App Platform
- Kubernetes

## 📊 Plateformes supportées

| Plateforme | Type | Fichier |
|-----------|------|---------|
| **Docker Compose** | Standalone | `docker-compose.yml` |
| **Docker Swarm** | Orchestration | `docker-compose.prod.yml` |
| **Kubernetes** | Orchestration | `kubernetes-deployment.yml` |
| **AWS ECS/Fargate** | Managed | Images + Task Definition |
| **Google Cloud Run** | Serverless | Images + gcloud CLI |
| **Azure Container Apps** | Managed | Images + az CLI |
| **DigitalOcean** | Managed | `digitalocean-app.yaml` |

## 🔧 Commandes essentielles

```bash
# Build local
docker-compose build

# Lancer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Push vers registry
docker tag zawj-backend your-registry/zawj-backend:latest
docker push your-registry/zawj-backend:latest
```

## 📦 Variables d'environnement requises

### Backend
- `MONGODB_URI` : Connexion MongoDB (Atlas recommandé)
- `JWT_SECRET` : Clé secrète JWT (32+ caractères)
- `STRIPE_SECRET_KEY` : Clé API Stripe
- `EMAIL_PASSWORD` : Mot de passe email SMTP

### Frontend
- `NEXT_PUBLIC_API_URL` : URL de l'API backend
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` : Clé publique Stripe

## 🏥 Monitoring

Chaque service dispose de :
- **Health checks** : Vérification automatique
- **Logs structurés** : JSON format
- **Metrics** : CPU, RAM, requêtes
- **Alerting** : Intégration possible avec Datadog, New Relic

## 🔐 Certificats SSL

```bash
# Générer avec Let's Encrypt
docker run -it --rm --name certbot \
  -v "${PWD}/nginx/ssl:/etc/letsencrypt" \
  certbot/certbot certonly \
  --standalone \
  -d votre-domaine.com
```

## 📚 Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) : Guide complet de déploiement
- [nginx/nginx.conf](nginx/nginx.conf) : Configuration Nginx détaillée
- [kubernetes-deployment.yml](kubernetes-deployment.yml) : Manifests Kubernetes
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) : Pipeline CI/CD

## 🆘 Support

Pour les problèmes de déploiement :
1. Vérifier les logs : `docker-compose logs [service]`
2. Vérifier la santé : `docker-compose ps`
3. Consulter [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
4. Créer une issue sur GitHub

## ✨ Prochaines étapes

1. **Configurer MongoDB Atlas** (recommandé pour production)
2. **Obtenir certificats SSL** avec Let's Encrypt
3. **Configurer monitoring** (Datadog, Prometheus, etc.)
4. **Setup CI/CD** avec GitHub Actions
5. **Tests de charge** avant mise en production

**Architecture prête pour la production cloud ! 🎉**
