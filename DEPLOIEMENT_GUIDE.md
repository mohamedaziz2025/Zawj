# Guide de Déploiement - Système de Tuteurs

## Prérequis ✅

- Node.js v18+
- MongoDB
- Token Stripe configuré
- Variables d'environnement configurées

## Étapes de Déploiement

### 1. Backend

```bash
cd backend
npm install
npm run build
npm start
```

**Vérifications Backend:**
- ✅ Le modèle `Tuteur` est chargé
- ✅ Les routes `/api/admin/tuteurs` sont accessibles
- ✅ Les routes `/api/tuteurs` sont accessibles

### 2. Frontend

```bash
cd zawj
npm install
npm run build
npm start
```

**Vérifications Frontend:**
- ✅ Page `/register` affiche le choix de tuteur pour les femmes
- ✅ Page `/admin/tuteurs` accessible pour les admins
- ✅ Page `/settings/tuteurs` accessible pour les femmes
- ✅ Couleurs rouges visibles partout (pas de vert)

### 3. Tests à Effectuer

#### Test 1: Inscription Femme avec Tuteur Familial
1. Aller sur `/register`
2. Remplir Step 1 et 2
3. Step 3: Sélectionner genre "Femme"
4. Voir la section "Choix du Tuteur"
5. Sélectionner "Fournir les informations de mon tuteur"
6. Remplir le formulaire
7. Soumettre l'inscription
8. Vérifier que la demande apparaît dans `/admin/tuteurs` avec status "pending"

#### Test 2: Inscription Femme avec Tuteur Payant
1. Aller sur `/register`
2. Remplir Step 1 et 2
3. Step 3: Sélectionner "Service de tuteur payant"
4. Voir le message d'information
5. Soumettre l'inscription
6. Vérifier qu'aucune demande n'est créée automatiquement

#### Test 3: Admin - Approuver un Tuteur
1. Se connecter comme admin
2. Aller sur `/admin/tuteurs`
3. Voir la liste des tuteurs pending
4. Cliquer sur "Approuver"
5. Vérifier que le status passe à "approved"

#### Test 4: Admin - Créer un Tuteur Manuellement
1. Aller sur `/admin/tuteurs`
2. Cliquer sur "Créer un Tuteur"
3. Remplir le formulaire
4. Soumettre
5. Vérifier que le tuteur est créé avec status "approved"

#### Test 5: Admin - Assigner un Modérateur comme Tuteur
1. Créer un modérateur si nécessaire
2. Aller sur `/admin/tuteurs`
3. Cliquer sur "Assigner un Modérateur"
4. Sélectionner une femme
5. Sélectionner un modérateur
6. Soumettre
7. Vérifier que le tuteur est créé avec relationship "platform-moderator"
8. Vérifier que le badge "Tuteur de Société" s'affiche

#### Test 6: Femme - Gérer ses Tuteurs
1. Se connecter comme femme
2. Aller sur `/settings/tuteurs`
3. Voir la liste des tuteurs
4. Cliquer sur "Ajouter un Tuteur"
5. Remplir et soumettre
6. Vérifier que la demande apparaît avec status "pending"

#### Test 7: Couleurs
1. Parcourir le site
2. Vérifier qu'il n'y a AUCUNE couleur verte
3. Vérifier que les éléments de succès sont en ROUGE
4. Vérifier que les labels de `/register` sont en NOIR

### 4. Vérification de la Base de Données

```javascript
// Dans MongoDB
use zawj

// Vérifier la collection tuteurs
db.tuteurs.find().pretty()

// Vérifier les index
db.tuteurs.getIndexes()

// Compter les tuteurs par status
db.tuteurs.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

### 5. Variables d'Environnement Requises

**Backend (.env):**
```
MONGODB_URI=mongodb://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

### 6. Migrations Nécessaires

Si vous avez des utilisateurs existants, exécutez ce script pour initialiser les champs:

```javascript
// Migration: Ajouter tuteurChoice pour les femmes existantes
db.users.updateMany(
  { gender: 'female', tuteurChoice: { $exists: false } },
  { $set: { tuteurChoice: '' } }
)

// Vérification
db.users.find({ gender: 'female' }).forEach(user => {
  print(`${user.firstName} ${user.lastName}: tuteurChoice=${user.tuteurChoice}`)
})
```

### 7. Permissions et Rôles

**Admin:**
- ✅ Peut voir tous les tuteurs
- ✅ Peut approuver/rejeter des tuteurs
- ✅ Peut créer des tuteurs manuellement
- ✅ Peut assigner des modérateurs comme tuteurs
- ✅ Peut modifier/supprimer des tuteurs

**Femme:**
- ✅ Peut voir ses propres tuteurs
- ✅ Peut demander de nouveaux tuteurs
- ✅ Peut voir le status de ses demandes

**Modérateur-Tuteur:**
- ✅ Voit les femmes qui lui sont assignées
- ✅ A accès au dashboard des femmes (si hasAccessToDashboard=true)
- ✅ Reçoit des notifications (si notifyOnNewMessage=true)
- ✅ Badge "Tuteur de Société" visible

### 8. Endpoints API

**Admin:**
- `GET /api/admin/tuteurs` - Liste tous les tuteurs
- `GET /api/admin/tuteurs?status=pending` - Filtrer par statut
- `PATCH /api/admin/tuteurs/:id/approve` - Approuver
- `PATCH /api/admin/tuteurs/:id/reject` - Rejeter
- `POST /api/admin/tuteurs` - Créer manuellement
- `POST /api/admin/tuteurs/assign-moderator` - Assigner modérateur
- `PATCH /api/admin/tuteurs/:id` - Modifier
- `DELETE /api/admin/tuteurs/:id` - Supprimer

**Utilisateur:**
- `GET /api/tuteurs/my-tuteurs` - Mes tuteurs (femmes seulement)
- `POST /api/tuteurs/request` - Demander un tuteur (femmes seulement)

### 9. Sécurité

**Validations Backend:**
- ✅ Vérifier que l'utilisateur est une femme avant de créer un tuteur
- ✅ Seuls les admins peuvent approuver/rejeter
- ✅ Les femmes ne peuvent voir que leurs propres tuteurs
- ✅ Les modérateurs ne peuvent pas s'auto-assigner

**Middleware:**
- ✅ `authMiddleware` - Vérifie le token JWT
- ✅ `adminOnlyMiddleware` - Vérifie le rôle admin

### 10. Logs et Monitoring

**À surveiller:**
- Nombre de demandes de tuteurs par jour
- Taux d'approbation vs rejet
- Nombre de modérateurs assignés comme tuteurs
- Erreurs d'authentification
- Tentatives d'accès non autorisé

**Logs importants:**
```javascript
// Backend - Ajouter des logs
console.log(`Tuteur ${tuteur._id} approved by admin ${adminId}`)
console.log(`Moderator ${moderatorId} assigned as tuteur for user ${userId}`)
console.log(`Tuteur request from user ${userId}`)
```

### 11. Troubleshooting

**Problème: Les demandes de tuteurs n'apparaissent pas**
- Vérifier que le backend est démarré
- Vérifier la connexion MongoDB
- Vérifier les logs backend
- Vérifier le token JWT

**Problème: Impossible d'approuver un tuteur**
- Vérifier que l'utilisateur est admin
- Vérifier les permissions
- Vérifier que le tuteur existe et est en status "pending"

**Problème: Couleurs vertes encore visibles**
- Vider le cache du navigateur
- Rebuild le frontend: `npm run build`
- Vérifier que tous les fichiers sont à jour

**Problème: Badge "Tuteur de Société" ne s'affiche pas**
- Vérifier que relationship === 'platform-moderator'
- Vérifier que moderatorId existe
- Vérifier le code du composant

### 12. Checklist Final

- [ ] Backend déployé et fonctionnel
- [ ] Frontend déployé et fonctionnel
- [ ] Base de données configurée avec indexes
- [ ] Variables d'environnement configurées
- [ ] Test d'inscription avec tuteur familial ✓
- [ ] Test d'inscription avec tuteur payant ✓
- [ ] Test d'approbation admin ✓
- [ ] Test de création manuelle ✓
- [ ] Test d'assignation de modérateur ✓
- [ ] Test de la page /settings/tuteurs ✓
- [ ] Vérification des couleurs (rouge, noir) ✓
- [ ] Monitoring en place
- [ ] Documentation à jour

### 13. Support et Maintenance

**Contact:**
- Pour les bugs: Créer une issue sur GitHub
- Pour les questions: Email support@nissfi.com
- Pour les urgences: Slack #dev-team

**Maintenance régulière:**
- Vérifier les logs quotidiennement
- Nettoyer les demandes rejetées anciennes (>90 jours)
- Surveiller les performances de la DB
- Mettre à jour les dépendances mensuellement

---

**Déploiement terminé! 🎉**

Date: 5 Février 2026
Version: 2.0.0
