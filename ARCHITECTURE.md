# 🏗️ Architecture - Système Admin & Modérateur

## 📁 Structure du Projet

```
zawj/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── moderator/          # 🆕 Module Modérateur
│       │   │   ├── moderator.model.ts
│       │   │   └── moderator.routes.ts
│       │   ├── admin/              # Module Admin
│       │   │   ├── admin.routes.ts
│       │   │   ├── admin.service.ts
│       │   │   └── admin.financial.routes.ts
│       │   ├── users/
│       │   │   ├── user.model.ts   # 🔄 Modifié (tuteurInfo ajouté)
│       │   │   └── user.routes.ts
│       │   ├── chat/
│       │   │   ├── chat.model.ts
│       │   │   └── chat.routes.ts
│       │   └── subscription/
│       │       ├── subscription.model.ts
│       │       └── subscription.routes.ts
│       └── middlewares/
│           └── auth.middleware.ts  # Gestion rôles admin/moderator
│
└── zawj/
    └── src/
        ├── app/
        │   ├── admin/
        │   │   ├── page.tsx                    # Dashboard admin principal
        │   │   ├── users/
        │   │   │   └── page.tsx               # 🔄 Amélioré (modals + icons)
        │   │   ├── moderators/
        │   │   │   └── page.tsx               # 🆕 Gestion modérateurs
        │   │   ├── messages/
        │   │   │   └── page.tsx               # Vue tous messages
        │   │   ├── financial/
        │   │   │   └── page.tsx               # Dashboard financier
        │   │   └── tuteurs/
        │   │       └── page.tsx               # Approbation tuteurs
        │   └── moderator/
        │       └── dashboard/
        │           └── page.tsx               # 🔄 Dashboard modérateur
        └── lib/
            └── api/
                ├── client.ts                  # Axios instance
                ├── admin.ts                   # 🔄 API admin (moderators + messages)
                └── moderator.ts               # 🆕 API modérateur
```

## 🔐 Système d'Authentification

### Flux d'Auth
```
User Login
    ↓
JWT Token Generated
    ↓
Token Stored (localStorage)
    ↓
Axios Interceptor adds token to headers
    ↓
Backend verifies & extracts role
    ↓
Route access granted based on role
```

### Rôles
```typescript
enum UserRole {
  SEEKER = 'seeker',      // Utilisateur standard
  MODERATOR = 'moderator', // Modérateur
  ADMIN = 'admin'         // Administrateur
}
```

### Middleware Protection
```typescript
// backend/src/middlewares/auth.middleware.ts
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export const requireModerator = (req, res, next) => {
  if (!['moderator', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Moderator access required' })
  }
  next()
}
```

## 🗄️ Schémas de Base de Données

### User Schema (Modifié)
```typescript
{
  _id: ObjectId
  firstName: string
  lastName: string
  email: string
  password: string (hashed)
  role: 'seeker' | 'moderator' | 'admin'
  gender: 'male' | 'female'
  age?: number
  city?: string
  isVerified: boolean
  isActive: boolean
  
  // 🆕 Nouveau champ pour tuteur payant
  tuteurInfo?: {
    tuteurId: ObjectId       // Référence au modérateur assigné
    isPaid: boolean          // A payé pour le service
    assignedByAdmin: ObjectId // Admin qui a fait l'assignation
    assignmentDate: Date
  }
  
  createdAt: Date
  lastLogin?: Date
}
```

### Moderator Schema (Nouveau)
```typescript
{
  _id: ObjectId
  userId: ObjectId → User  // Référence vers User avec role='moderator'
  isActive: boolean
  
  assignedUsers: ObjectId[] → User[]  // Utilisatrices assignées
  
  canAccessAllMessages: boolean  // Super-pouvoir admin
  
  permissions: {
    canApprovePaidTutor: boolean   // Approuver tuteurs payants
    canViewMessages: boolean        // Voir messages
    canBlockUsers: boolean          // Bloquer utilisateurs
  }
  
  statistics: {
    totalAssigned: number      // Nombre total assignées
    totalApprovals: number     // Approbations données
    totalRejections: number    // Rejets donnés
  }
  
  createdAt: Date
  updatedAt: Date
}
```

### Message Schema (Existant)
```typescript
{
  _id: ObjectId
  senderId: ObjectId → User
  receiverId: ObjectId → User
  message: string
  timestamp: Date
  read: boolean
  deleted: boolean
}
```

## 🔄 Flux de Données

### 1. Création de Modérateur
```
Admin UI (modal)
    ↓ (POST)
adminApi.createModerator({ userId, permissions })
    ↓
Backend: /api/moderators (POST)
    ↓
1. Vérifier userId existe
2. Mettre à jour user.role = 'moderator'
3. Créer document Moderator
4. Retourner moderator créé
    ↓
Frontend: React Query invalidate
    ↓
Liste rafraîchie automatiquement
```

### 2. Assignation d'Utilisatrice
```
Admin UI (modal assignation)
    ↓ (POST)
adminApi.assignUserToModerator(moderatorId, userId)
    ↓
Backend: /api/moderators/:id/assign (POST)
    ↓
1. Vérifier moderator existe
2. Ajouter userId à assignedUsers[]
3. Mettre à jour user.tuteurInfo
4. Incrémenter statistics.totalAssigned
5. Retourner moderator mis à jour
    ↓
Frontend: React Query invalidate
    ↓
Compteurs mis à jour
```

### 3. Dashboard Modérateur
```
Moderator Login
    ↓
Navigate to /moderator/dashboard
    ↓ (GET)
moderatorApi.getProfile()
    ↓
Backend: /api/moderators/me (GET)
    ↓
1. Extract userId from JWT
2. Find moderator by userId
3. Populate assignedUsers
4. Return profile
    ↓
Frontend: Affiche dashboard
```

## 🌐 API Endpoints

### Admin Routes
```http
# Stats
GET    /api/admin/stats

# Users
GET    /api/admin/users
PUT    /api/admin/users/:id/block
DELETE /api/admin/users/:id

# Moderators
GET    /api/moderators
POST   /api/moderators
PUT    /api/moderators/:id
DELETE /api/moderators/:id
POST   /api/moderators/:id/assign
DELETE /api/moderators/:id/assign/:userId

# Messages
GET    /api/admin/conversations
GET    /api/admin/conversations/:id/messages
DELETE /api/admin/messages/:id

# Financial
GET    /api/admin/financial/dashboard
GET    /api/admin/financial/subscriptions
POST   /api/admin/financial/refund/:id

# Tuteurs
GET    /api/admin/tuteurs
PUT    /api/admin/tuteurs/:id/approve
PUT    /api/admin/tuteurs/:id/reject
```

### Moderator Routes
```http
# Profile
GET    /api/moderators/me

# Messages (only assigned users)
GET    /api/moderators/messages

# Actions
PUT    /api/moderators/approve-tuteur/:id
PUT    /api/moderators/block-user/:id
```

## 🎨 Design System

### Composants Réutilisables

#### StatCard
```tsx
<StatCard
  title="Titre"
  value={123}
  icon={Icon}
  gradient="from-blue-500 to-cyan-500"
  trend="+12%"
  trendPositive={true}
/>
```

#### Modal
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Titre"
>
  {/* Contenu */}
</Modal>
```

#### ActionButton
```tsx
<ActionButton
  icon={Edit}
  onClick={handleEdit}
  variant="blue"
  tooltip="Modifier"
/>
```

### Palette de Couleurs
```scss
// Primaire
$pink-primary: #e91e63;
$purple-primary: #9c27b0;

// Gradients
$gradient-primary: linear-gradient(to right, #e91e63, #9c27b0);
$gradient-success: linear-gradient(to right, #10b981, #059669);
$gradient-danger: linear-gradient(to right, #ef4444, #dc2626);

// États
$active: #10b981;
$inactive: #6b7280;
$warning: #f59e0b;
$error: #ef4444;
```

## 🔒 Sécurité

### Protection des Routes
```typescript
// Frontend (zawj/src/app/admin/*/page.tsx)
if (!isAuthenticated || user?.role !== 'admin') {
  return <AccessDenied />
}

// Backend (auth.middleware.ts)
router.use('/admin', requireAdmin)
router.use('/moderator', requireModerator)
```

### Validation des Données
```typescript
// Backend
import { body, validationResult } from 'express-validator'

router.post('/moderators',
  requireAdmin,
  body('userId').isMongoId(),
  body('permissions').isObject(),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    // ...
  }
)
```

### Sanitization
```typescript
// Nettoyer les entrées utilisateur
const sanitizedMessage = DOMPurify.sanitize(message)
```

## 📊 Gestion d'État (React Query)

### Cache Strategy
```typescript
// Cache modérateurs pendant 5 minutes
useQuery({
  queryKey: ['moderators'],
  queryFn: adminApi.getModerators,
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000
})
```

### Invalidation
```typescript
// Après mutation, invalider le cache
const createMutation = useMutation({
  mutationFn: adminApi.createModerator,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['moderators'] })
  }
})
```

### Optimistic Updates
```typescript
const updateMutation = useMutation({
  mutationFn: adminApi.updateModerator,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['moderators'] })
    const previousData = queryClient.getQueryData(['moderators'])
    
    // Mise à jour optimiste
    queryClient.setQueryData(['moderators'], (old) => ({
      ...old,
      data: old.data.map(m => m._id === newData.id ? { ...m, ...newData } : m)
    }))
    
    return { previousData }
  },
  onError: (err, newData, context) => {
    // Rollback en cas d'erreur
    queryClient.setQueryData(['moderators'], context.previousData)
  }
})
```

## 🧪 Tests

### Tests Backend
```javascript
// backend/tests/moderator.test.js
describe('Moderator Routes', () => {
  it('should create moderator', async () => {
    const res = await request(app)
      .post('/api/moderators')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: testUserId,
        permissions: { canApprovePaidTutor: true }
      })
    
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('_id')
  })
})
```

### Tests Frontend
```typescript
// zawj/tests/moderators.test.tsx
describe('Moderators Page', () => {
  it('should render moderator list', () => {
    render(<ModeratorsPage />)
    expect(screen.getByText('Gestion des Modérateurs')).toBeInTheDocument()
  })
  
  it('should open create modal', () => {
    render(<ModeratorsPage />)
    fireEvent.click(screen.getByText('Créer Modérateur'))
    expect(screen.getByText('Sélectionner Utilisateur')).toBeInTheDocument()
  })
})
```

## 🚀 Déploiement

### Variables d'Environnement

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zawj
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.zawj.com
NEXT_PUBLIC_WS_URL=wss://api.zawj.com
```

### Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd zawj
npm run build
npm start
```

### Docker
```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]

# zawj/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

**Architecture Version:** 2.0  
**Date:** 4 Février 2026  
**Auteur:** Équipe Développement ZAWJ
