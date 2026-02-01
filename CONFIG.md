# Configuration ZAWJ

## Variables d'Environnement

### Frontend (`zawj/.env.local`)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# PWA
NEXT_PUBLIC_APP_NAME=ZAWJ
NEXT_PUBLIC_APP_DESCRIPTION=Premium Wali Connection Platform

# Analytics (optional)
NEXT_PUBLIC_GA_ID=UA-XXXXX-1
```

### Backend (`backend/.env`)
```env
# Server
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb://localhost:27017/zawj
DB_NAME=zawj

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Stripe (Subscription)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3 (Photo Upload - optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=zawj-photos
AWS_S3_REGION=eu-west-1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # requests per window

# Security
BCRYPT_ROUNDS=10
PASSWORD_MIN_LENGTH=8
```

## Setup Local

### 1. Installation

```bash
# Frontend
cd zawj
npm install
npm run dev        # http://localhost:3000

# Backend
cd ../backend
npm install
npm run dev        # http://localhost:5000
```

### 2. Base de Données

```bash
# Démarrer MongoDB localement
mongod --dbpath ./data

# Ou utiliser MongoDB Atlas (cloud)
# Remplacer MONGODB_URI dans .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/zawj
```

### 3. Créer Compte Admin

```bash
# Option 1: MongoDB CLI
use zawj
db.users.updateOne(
  { email: "admin@zawj.com" },
  { $set: { role: "admin" } }
)

# Option 2: Via API (après création du compte)
# Inscrire → Puis modifier le rôle en DB
```

## Structure Dossiers

```
zawj/
├── src/
│   ├── app/                 # Pages Next.js
│   │   ├── page.tsx         # Home
│   │   ├── login/
│   │   ├── register/
│   │   ├── search/
│   │   ├── chat/
│   │   ├── profile/
│   │   └── admin/
│   ├── components/          # Composants réutilisables
│   ├── hooks/              # Custom hooks
│   ├── lib/
│   │   └── api/            # Client API (axios)
│   └── store/              # Zustand stores
├── public/                 # Assets statiques
└── package.json

backend/
├── src/
│   ├── app.ts              # Express setup
│   ├── server.ts           # Entry point
│   ├── config/             # Configuration
│   ├── middlewares/        # Express middlewares
│   └── modules/
│       ├── auth/           # Authentification
│       ├── users/          # Gestion utilisateurs
│       ├── chat/           # Chat temps réel
│       ├── subscription/   # Abonnements
│       └── admin/          # Admin panel
└── package.json
```

## Commandes Usuelles

### Frontend
```bash
cd zawj

# Développement
npm run dev                 # Dev server
npm run build              # Production build
npm run start              # Start production

# Linting
npm run lint               # ESLint
npm run type-check         # TypeScript check

# Testing
npm run test               # Jest tests
npm run test:watch        # Mode watch
```

### Backend
```bash
cd backend

# Développement
npm run dev                # Dev server avec nodemon
npm run build              # TypeScript compilation
npm run start              # Start production

# Linting
npm run lint               # ESLint

# Database
npm run db:seed            # Seed data
npm run db:migrate         # Run migrations
```

## Ports

- **Frontend**: 3000 (Next.js dev server)
- **Backend**: 5000 (Express + Socket.io)
- **MongoDB**: 27017 (Local) or Atlas (Cloud)

## Dépannage

### "Cannot find module '@/...'"
```bash
# Vérifier tsconfig.json
# Doit contenir: "paths": { "@/*": ["./src/*"] }
```

### "MongoDB connection refused"
```bash
# Vérifier que mongod est lancé
mongod --version  # Vérifier installation
mongod            # Lancer le serveur
```

### "Port 3000 already in use"
```bash
# Trouver process
lsof -i :3000

# Tuer le process
kill -9 <PID>

# Ou utiliser un port différent
PORT=3001 npm run dev
```

### "JWT token expired"
```bash
# Vérifier la date du serveur
date

# Tokens refresh automatiquement via interceptor Axios
# Vérifier localStorage: auth_token
```

## Déploiement

### Frontend (Vercel)
```bash
# Connecter le repo GitHub
# Vercel auto-déploie sur chaque push

# Ou manuel
npm run build
npm run start
```

### Backend (Heroku/Railway)
```bash
# Préparer Procfile
echo "web: npm start" > Procfile

# Déployer
git push heroku main
```

## Monitoring & Logs

### Frontend
```
Browser DevTools → Console → Network → Application
Vérifier:
- localStorage (auth_token)
- Network requests
- Toast notifications
```

### Backend
```bash
# Logs
tail -f logs/error.log
tail -f logs/access.log

# Monitor
npm install -g pm2
pm2 start npm --name "zawj-backend" -- start
pm2 monitor
```

## Performance

### Frontend
```bash
# Lighthouse audit
npm run build
npm run start

# Vérifier:
- Lighthouse score
- Core Web Vitals
- Bundle size
```

### Backend
```bash
# Profiling
npm install clinic
clinic doctor -- npm start

# Monitoring
npm install datadog-browser-rum
```

## Sécurité

### HTTPS
- Toujours utiliser HTTPS en production
- Certificat SSL gratuit: Let's Encrypt

### Secrets
- Jamais commiter .env
- Utiliser environment variables du serveur
- Rotate JWT secrets régulièrement

### Headers
- Helmet.js pour headers sécurité
- CORS strictement configuré
- Rate limiting activé

## Support & Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.io](https://socket.io/)

---

**Créé le**: 28 Janvier 2026
**Version**: 1.0
**Statut**: Production Ready
