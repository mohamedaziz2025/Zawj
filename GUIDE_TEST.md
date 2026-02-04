# 🧪 Guide de Test - Nouvelles Fonctionnalités

## 🚀 Démarrage Rapide

### 1. Lancer le Backend
```bash
cd backend
npm install
npm run dev
```
Le backend démarre sur `http://localhost:5000`

### 2. Lancer le Frontend
```bash
cd zawj
npm install
npm run dev
```
Le frontend démarre sur `http://localhost:3000`

## 👤 Comptes de Test

### Admin
- **URL:** `http://localhost:3000/admin`
- **Email:** admin@zawj.com
- **Password:** Admin123!

### Modérateur
- **URL:** `http://localhost:3000/moderator/dashboard`
- **Créé depuis:** Interface admin → Modérateurs → Créer

### Utilisateur Standard
- **URL:** `http://localhost:3000/login`
- **Inscription:** `http://localhost:3000/register`

## 🧪 Scénarios de Test

### ✅ Test 1: Création d'un Modérateur

1. **Connexion Admin**
   - Aller sur `http://localhost:3000/admin`
   - Se connecter avec compte admin

2. **Accéder à la page Modérateurs**
   - Cliquer sur "Modérateurs" dans le menu admin
   - Ou aller directement: `http://localhost:3000/admin/moderators`

3. **Créer un Modérateur**
   - Cliquer sur "Créer Modérateur" (bouton rose avec icône)
   - Sélectionner un utilisateur existant dans la liste
   - Cocher les permissions:
     - ✓ Approuver les tuteurs payants
     - ✓ Voir les messages
     - ✓ Bloquer des utilisateurs
   - Cliquer sur "Créer"

4. **Vérification**
   - Le modérateur apparaît dans la liste
   - Badge "Actif" affiché
   - Statistiques à 0

### ✅ Test 2: Assignation d'Utilisatrice

1. **Depuis la page Modérateurs**
   - Trouver le modérateur créé
   - Cliquer sur l'icône "Assigner utilisatrice" (👤)

2. **Dans le Modal**
   - Sélectionner une utilisatrice (role: seeker)
   - Cliquer sur "Assigner"

3. **Vérification**
   - Le compteur "Utilisatrices" s'incrémente
   - La carte du modérateur affiche le nouveau nombre

### ✅ Test 3: Gestion des Utilisateurs

1. **Accéder à la page Utilisateurs**
   - `http://localhost:3000/admin/users`

2. **Voir Détails (👁️)**
   - Cliquer sur l'icône œil
   - Modal avec toutes les informations s'affiche

3. **Modifier (✏️)**
   - Cliquer sur l'icône crayon
   - Modifier prénom, nom, email, rôle
   - Enregistrer

4. **Bloquer/Activer (🟡)**
   - Cliquer sur l'icône statut
   - Le statut bascule instantanément

5. **Supprimer (🗑️)**
   - Cliquer sur l'icône poubelle
   - Confirmer la suppression

### ✅ Test 4: Dashboard Modérateur

1. **Connexion Modérateur**
   - Se déconnecter de l'admin
   - Se connecter avec le compte du modérateur créé
   - Aller sur `http://localhost:3000/moderator/dashboard`

2. **Vérifier**
   - Profil affiché correctement
   - Liste des utilisatrices assignées
   - Statistiques personnelles
   - Permissions visibles

### ✅ Test 5: Messages Admin

1. **Accéder aux Messages**
   - `http://localhost:3000/admin/messages`

2. **Interface 3 Colonnes**
   - Gauche: Liste des conversations
   - Droite: Messages de la conversation sélectionnée
   - Compteurs de messages non lus

3. **Recherche**
   - Taper dans la barre de recherche
   - Les conversations se filtrent instantanément

### ✅ Test 6: Dashboard Financier

1. **Accéder aux Finances**
   - `http://localhost:3000/admin/financial`

2. **Vérifier**
   - Cartes MRR (Monthly Recurring Revenue)
   - Graphiques de tendance
   - Liste des abonnements
   - Filtres par statut et plan

## 🔍 Points de Vérification

### API Calls
```bash
# Vérifier les appels réseau dans DevTools
# Tous devraient pointer vers:
# - http://localhost:5000/api/* (en dev)
# - https://votre-domaine.com/api/* (en prod)
# 
# ❌ PAS de hardcoded localhost dans le code frontend
```

### Console Errors
```javascript
// Ouvrir DevTools → Console
// Aucune erreur ne devrait apparaître
// Vérifier:
// - Pas d'ERR_CONNECTION_REFUSED
// - Pas de 404 Not Found
// - Pas d'erreurs TypeScript
```

### TypeScript Compilation
```bash
cd zawj
npm run build

# Devrait compiler sans erreurs
# Si erreurs, vérifier les imports et types
```

## 🐛 Dépannage

### Erreur: Cannot find module '@tanstack/react-query'
```bash
cd zawj
npm install @tanstack/react-query
```

### Erreur: ERR_CONNECTION_REFUSED
**Cause:** Backend pas démarré ou mauvaise URL

**Solution:**
1. Vérifier que le backend tourne sur port 5000
2. Vérifier NEXT_PUBLIC_API_URL dans `.env.local`

### Erreur: 401 Unauthorized
**Cause:** Token expiré ou invalide

**Solution:**
1. Se déconnecter et reconnecter
2. Vérifier que le token est sauvegardé dans localStorage
3. Vérifier les headers Authorization dans DevTools

### Pas de modérateurs affichés
**Cause:** Collection vide dans MongoDB

**Solution:**
1. Créer un modérateur via l'interface admin
2. Vérifier la connexion MongoDB
3. Vérifier les logs backend

## 📱 Tests Responsive

### Mobile (375px)
```bash
# DevTools → Toggle Device Toolbar
# Tester iPhone SE
```
- [ ] Menu hamburger fonctionne
- [ ] Modals responsive
- [ ] Cartes s'empilent correctement
- [ ] Boutons accessibles

### Tablet (768px)
```bash
# Tester iPad
```
- [ ] Grille 2 colonnes
- [ ] Navigation latérale
- [ ] Tableaux scrollables

### Desktop (1920px)
```bash
# Full HD
```
- [ ] Grille 3-4 colonnes
- [ ] Espacement optimal
- [ ] Pas de débordement

## ✨ Fonctionnalités Bonus à Tester

### Animations
- [ ] Transitions des modals (fade in/out)
- [ ] Hover effects sur les boutons
- [ ] Loading spinners
- [ ] Toast notifications

### UX
- [ ] Confirmations avant suppression
- [ ] Messages d'erreur clairs
- [ ] Loading states pendant requêtes
- [ ] Feedbacks visuels (couleurs, icônes)

### Accessibilité
- [ ] Tabulation au clavier fonctionne
- [ ] Tooltips sur les icônes
- [ ] Contraste texte/fond suffisant
- [ ] Labels sur les inputs

## 📊 Métriques de Performance

### Lighthouse (Chrome DevTools)
```bash
# Audit → Performance
# Cibles:
# - Performance: > 80
# - Accessibility: > 90
# - Best Practices: > 90
# - SEO: > 80
```

### Bundle Size
```bash
cd zawj
npm run build

# Vérifier la taille des chunks
# Cible: < 500KB pour le main bundle
```

## 🎉 Checklist Finale

### Backend
- [x] Modèle Moderator créé
- [x] Routes API complètes
- [x] Authentification JWT
- [x] Permissions vérifiées

### Frontend
- [x] Page modérateurs fonctionnelle
- [x] Modals création/assignation
- [x] Actions en icônes
- [x] API client intégré
- [x] Pas d'erreurs TypeScript
- [x] Responsive design

### Tests
- [ ] Créer modérateur ✓
- [ ] Assigner utilisatrice ✓
- [ ] Voir détails utilisateur ✓
- [ ] Modifier utilisateur ✓
- [ ] Dashboard modérateur ✓
- [ ] Messages admin ✓
- [ ] Dashboard financier ✓

---

**Prêt pour la Production! 🚀**

Date: 4 Février 2026
