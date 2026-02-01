# 🌟 ZAWJ - Premium Wali Connection Platform

> Plateforme moderne de connexion entre femmes et tuteurs légaux (Walis) pour un mariage respectueux et sécurisé.

## 📋 Vue d'ensemble

ZAWJ est une application full-stack conçue spécifiquement pour faciliter les connexions entre femmes à la recherche d'un tuteur légal (mahram/wali) et les tuteurs disponibles. La plateforme intègre un système d'administration complet pour la modération et la gestion des utilisateurs.

### 🎯 Caractéristiques Principales

- ✅ **Inscription intelligente** - Création automatique du mahram pour les femmes
- ✅ **Authentification sécurisée** - JWT tokens avec refresh automatique
- ✅ **Chat temps réel** - Socket.io pour les conversations instantanées
- ✅ **Recherche & filtres** - Trouver des walis par genre, âge, localisation
- ✅ **Admin panel complet** - Tableau de bord avec gestion utilisateurs et mahrams
- ✅ **Système de modération** - Rapports et gestion des violations
- ✅ **Profil utilisateur** - Édition complète et statut d'abonnement
- ✅ **PWA support** - Fonctionne offline avec manifest

## 🚀 Stack Technologique

### Frontend
```
Next.js 14 + TypeScript + Tailwind CSS
├── Zustand (State management)
├── React Query (Server cache)
├── Axios (HTTP client)
├── Socket.io client (Real-time)
├── Framer Motion (Animations)
└── Lucide Icons (UI Icons)
```

### Backend
```
Express.js + TypeScript + MongoDB
├── JWT Authentication
├── Socket.io server
├── Mongoose ODM
├── Zod validation
├── Helmet security
└── Rate limiting
```

### Infrastructure
- **Database**: MongoDB (Local/Atlas)
- **API**: REST + WebSocket
- **Deployment**: Vercel (Frontend), Heroku/Railway (Backend)

## 📁 Structure du Projet

```
ZAWJ/
├── zawj/                    # Frontend (Next.js)
│   ├── src/
│   │   ├── app/            # Pages (Home, Login, Register, Chat, Profile, Admin)
│   │   ├── components/     # Composants réutilisables
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/api/        # Client API
│   │   └── store/          # Zustand stores
│   ├── public/             # Assets
│   └── package.json
│
├── backend/                 # Backend (Express.js)
│   ├── src/
│   │   ├── app.ts          # Express setup
│   │   ├── server.ts       # Entry point
│   │   ├── config/         # Configuration
│   │   ├── middlewares/    # Express middlewares
│   │   └── modules/        # Business logic
│   └── package.json
│
├── COMPLETION_SUMMARY.md   # Résumé de complétion
├── ADMIN_DOCS.md          # Documentation admin
├── REGISTRATION_DOCS.md   # Guide d'inscription
├── CONFIG.md              # Configuration et setup
└── README.md              # Ce fichier
```

## 🎮 Pages Disponibles

### Utilisateur
| Page | URL | Fonction |
|------|-----|----------|
| Home | `/` | Découvrir les walis |
| Recherche | `/search` | Chercher avec filtres |
| Chat | `/chat` | Conversations temps réel |
| Profil | `/profile` | Éditer profil utilisateur |
| Login | `/login` | Se connecter |
| Inscription | `/register` | Créer un compte |

### Admin
| Page | URL | Fonction |
|------|-----|----------|
| Dashboard | `/admin` | Vue d'ensemble stats |
| Utilisateurs | `/admin/users` | Gestion users |
| Mahrams | `/admin/mahrams` | Approbation mahrams |
| Rapports | `/admin/reports` | Modération |

## 🔐 Système d'Inscription

### Flux pour les Femmes
```
1. Remplir formulaire (name, email, password, genre)
2. Sélectionner "Je cherche un Wali"
3. Compléter profil (age, location, bio)
4. ✅ Mahram auto-créé (status: pending)
5. Admin approuve le mahram
6. Femme peut utiliser la plateforme
```

### Flux pour les Hommes (Walis)
```
1. Remplir formulaire (name, email, password, genre)
2. Sélectionner "Je suis Wali"
3. Compléter profil (age, location, bio)
4. ✅ Compte actif immédiatement
5. Peut proposer ses services
```

### Rôles & Permissions
```
👤 User (Femme)
  ├─ Voir profils walis
  ├─ Envoyer messages
  └─ Éditer profil

🛡️ Wali (Tuteur)
  ├─ Recevoir demandes
  ├─ Répondre messages
  └─ Gérer candidatures

👨‍💼 Admin
  ├─ Voir tous les users
  ├─ Approuver mahrams
  ├─ Modérer rapports
  └─ Gérer la plateforme
```

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Cloner
git clone https://github.com/your-org/zawj.git
cd zawj

# Frontend
cd zawj
npm install
npm run dev        # http://localhost:3000

# Backend (nouveau terminal)
cd backend
npm install
npm run dev        # http://localhost:5000
```

### 2. Configuration

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend** (`.env`):
```env
MONGODB_URI=mongodb://localhost:27017/zawj
JWT_SECRET=your-super-secret-key
PORT=5000
```

### 3. Base de Données

```bash
# Démarrer MongoDB
mongod

# Créer admin (optionnel)
use zawj
db.users.updateOne(
  { email: "admin@zawj.com" },
  { $set: { role: "admin" } }
)
```

## 🧪 Comptes de Test

```
🚀 Admin
  Email: admin@zawj.com
  Password: password123

👩 Femme
  Email: femme@test.com
  Password: password123

🛡️ Wali
  Email: wali@test.com
  Password: password123
```

## 📚 API Documentation

### Authentication
```
POST /api/auth/register       # Créer compte
POST /api/auth/login          # Se connecter
POST /api/auth/refresh        # Refresh token
```

### Users
```
GET  /api/users/search        # Chercher utilisateurs
GET  /api/users/:id           # Get profil
PATCH /api/users/:id          # Update profil
DELETE /api/users/:id         # Delete account
```

### Chat
```
GET  /api/chat/conversations  # Lister chats
GET  /api/chat/messages/:id   # Messages d'une conversation
POST /api/chat/messages       # Envoyer message
```

### Admin
```
GET  /api/admin/stats         # Statistiques
GET  /api/admin/users         # Tous les users
PATCH /api/admin/users/:id/block  # Bloquer user
GET  /api/admin/mahrams       # Tous les mahrams
PATCH /api/admin/mahrams/:id/approve  # Approuver
GET  /api/admin/reports       # Rapports
```

## 🎨 Composants Clés

### Frontend Components
- `AdminLayout` - Layout pour admin pages
- `ChatContainer` - Interface chat
- `ProfileCard` - Affichage profil
- `Toast` - Notifications
- `ErrorBoundary` - Error handling

### Hooks
- `useAuth()` - Auth state
- `useToast()` - Toast notifications
- `useSocket()` - Socket.io connection
- `useSearchUsers()` - Recherche users
- `useMessages()` - Chat messages
- `useCurrentUser()` - Current user data

### Services
- `userService` - User API calls
- `chatService` - Chat API calls
- `authService` - Auth API calls
- `AdminService` - Admin business logic

## 🔒 Sécurité

- ✅ JWT Authentication
- ✅ Bcrypt password hashing
- ✅ Rate limiting (100 req/15min)
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation (Zod)
- ✅ SQL injection protection
- ✅ XSS prevention

## 🧪 Testing

```bash
# Frontend
npm run lint              # ESLint
npm run test              # Jest tests
npm run test:watch       # Watch mode

# Backend
npm run lint              # ESLint
npm run test              # Tests
npm run type-check        # TypeScript check
```

## 📊 Monitoring

```bash
# Logs
tail -f logs/error.log

# Performance
npm install clinic
clinic doctor -- npm start

# Database
mongosh zawj
db.users.countDocuments()
```

## 🚢 Déploiement

### Frontend (Vercel)
```bash
1. Push code sur GitHub
2. Connecter Vercel
3. Auto-deployment à chaque push
4. Configurer NEXT_PUBLIC_API_URL
```

### Backend (Railway/Heroku)
```bash
1. git push
2. Railway/Heroku auto-build et deploy
3. Configurer variables d'environnement
4. MongoDB URI (Atlas)
```

## 📝 Logs & Debugging

### Browser DevTools
- Console pour errors
- Network pour API calls
- Application pour localStorage

### Server Logs
```bash
# Voir les logs
tail -f logs/server.log

# Filter errors
grep ERROR logs/server.log
```

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| "Port already in use" | `kill -9 $(lsof -t -i :3000)` |
| "MongoDB connection refused" | Vérifier `mongod` lancé |
| "JWT expired" | Tokens refresh auto |
| "CORS error" | Vérifier `NEXT_PUBLIC_API_URL` |

## 🎯 Roadmap

- [ ] Vérification d'email (confirmation link)
- [ ] Photo verification avec IA
- [ ] Système de rating & reviews
- [ ] Notifications push
- [ ] Multi-language support
- [ ] Payment processing (Stripe)
- [ ] Advanced analytics
- [ ] Mobile app native

## 🤝 Contribution

```bash
1. Fork le repo
2. Créer une branche (git checkout -b feature/xyz)
3. Commit les changes (git commit -m 'Add feature')
4. Push (git push origin feature/xyz)
5. Créer Pull Request
```

## 📞 Support

- 📧 Email: support@zawj.com
- 💬 Discord: [Join Server]
- 🐛 Issues: [GitHub Issues]
- 📖 Docs: [Documentation](./CONFIG.md)

## 📄 Licence

MIT License - Voir [LICENSE](./LICENSE) pour détails

## 👥 Équipe

- **Founder**: ZAWJ Team
- **Backend Lead**: Engineering Team
- **Frontend Lead**: UI/UX Team
- **DevOps**: Infrastructure Team

---

**Dernière mise à jour**: 28 Janvier 2026  
**Version**: 1.0.0  
**Statut**: ✅ Production Ready

## 🌟 Remerciements

Merci à tous les contributeurs, testeurs et utilisateurs bêta qui ont aidé à faire de ZAWJ une plateforme exceptionnelle.

---

**Made with ❤️ for the Muslim community**
