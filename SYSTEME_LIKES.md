# Système de Likes - ZAWJ

## 📊 Résumé de la vérification

### ✅ Backend - API Likes complète trouvée

**Fichiers identifiés :**
- `backend/src/modules/likes/like.model.ts` - Modèle Like avec Mongoose
- `backend/src/modules/likes/like.routes.ts` - Routes API pour les likes
- `backend/src/modules/users/user.model.ts` - Compteur dailyLikes intégré

### 🎯 Fonctionnalités principales

#### 1. **Modèle Like** (`like.model.ts`)
```typescript
{
  from: ObjectId          // Utilisateur qui envoie le like
  to: ObjectId            // Utilisateur qui reçoit le like
  type: 'like' | 'super-like'
  message?: string        // Message optionnel avec super-like
  status: 'pending' | 'accepted' | 'rejected'
  mutualMatch: boolean    // True si les deux s'aiment (match!)
}
```

#### 2. **Limites pour utilisateurs gratuits**

**Règle implémentée :** 3 likes par jour pour les utilisateurs gratuits

**Code backend** (`like.routes.ts`, ligne 32-60) :
```typescript
// Vérification du plan Premium
const isPremium = subscription?.plan !== 'free' && subscription?.status === 'active'

if (!isPremium) {
  // Reset du compteur si 24h écoulées
  const now = new Date()
  const lastReset = sender.dailyLikes?.lastReset || new Date(0)
  const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60)
  
  if (hoursSinceReset >= 24) {
    sender.dailyLikes = { count: 0, lastReset: now }
  }
  
  // Vérification limite atteinte
  if (sender.dailyLikes && sender.dailyLikes.count >= 3) {
    return res.status(403).json({ 
      message: 'Daily like limit reached (3/day). Upgrade to Premium for unlimited likes.',
      upgradeRequired: true 
    })
  }
}
```

**Champ dans User Model** (`user.model.ts`, ligne 76-79) :
```typescript
dailyLikes?: {
  count: number      // Nombre de likes envoyés aujourd'hui
  lastReset: Date    // Date du dernier reset (toutes les 24h)
}
```

#### 3. **Détection de Mutual Match**

Quand deux utilisateurs se likent mutuellement, le système :
- ✅ Met `mutualMatch: true` sur les deux Likes
- ✅ Envoie une notification au Wali si l'utilisateur est une femme
- ✅ Permet l'ouverture d'un chat (avec supervision Wali pour les femmes)

**Code** (`like.routes.ts`, ligne 78-97) :
```typescript
// Vérifier si l'autre utilisateur nous a déjà liké
const reverseLike = await Like.findOne({ from: to, to: from })
if (reverseLike) {
  like.mutualMatch = true
  reverseLike.mutualMatch = true
  await reverseLike.save()

  // Notification Wali si la cible est une femme
  if (targetUser.gender === 'female' && targetUser.waliInfo?.email) {
    sendWaliNewMatchNotification(...)
  }
}
```

---

## 🎨 Frontend - Nouveautés ajoutées

### 1. **Client API Likes** (`zawj/src/lib/api/likes.ts`) - **NOUVEAU**

Fonctions créées :
- `sendLike(data)` - Envoyer un like/super-like
- `getSentLikes()` - Récupérer les likes envoyés
- `getReceivedLikes()` - Récupérer les likes reçus
- `getMatches()` - Récupérer les matchs mutuels
- `getStats()` - Statistiques (likes restants, matchs, etc.)
- `removeLike(id)` - Retirer un like

### 2. **Démo interactive améliorée** (`zawj/src/app/demo/page.tsx`)

**Nouvelles fonctionnalités ajoutées à l'étape 2 :**

#### 🔢 **Compteur de likes**
- Affichage du nombre de likes restants : "X / 3"
- Barre de progression visuelle
- Mode Premium : "Illimité" avec icône couronne

#### 💳 **Toggle Premium/Gratuit**
- Bouton pour basculer entre mode gratuit et premium
- Permet de tester les deux expériences
- Visuel différent : gradient jaune-rose pour Premium

#### 🚫 **Modal limite atteinte**
- Popup élégante quand l'utilisateur atteint 3 likes
- Message : "Limite quotidienne atteinte"
- Liste des avantages Premium :
  - ✅ Likes illimités par jour
  - ✅ Voir qui vous a liké
  - ✅ Badge vérifié
  - ✅ Filtres avancés
- Boutons : "Plus tard" ou "Passer Premium"

#### 👍 **Interface Swipe modernisée**
- Card de profil unique au centre (style Tinder)
- Boutons "Passer" (X rouge) et "Liker" (❤️ violet-rose)
- Indicateur de progression (dots : gris → vert pour profils vus)
- Compteur "Profil X sur 3"
- Like désactivé si limite atteinte (en mode gratuit)

#### ✨ **Design amélioré**
- Effet blur et backdrop sur photos (pudeur)
- Badge de match % animé avec icône Sparkles
- Animations au hover sur les boutons
- Effets de lumière purple/rose

---

## 🔄 Flux complet d'utilisation

### Utilisateur GRATUIT (3 likes/jour)

1. **Profil 1** → Like ✅ (2 likes restants)
2. **Profil 2** → Passer ⏭️
3. **Profil 3** → Like ✅ (1 like restant)
4. **Profil 4** → Like ✅ (0 like restant)
5. **Profil 5** → ❌ **MODAL LIMITE ATTEINTE**
   - Option : Passer Premium ou attendre 24h

### Utilisateur PREMIUM (illimité)

1. **Profils illimités** → Aucune restriction
2. Compteur affiche : "♔ Illimité"
3. Barre de progression : toujours pleine (gradient jaune-rose)

---

## 📊 Routes API backend disponibles

| Route | Méthode | Description | Limite |
|-------|---------|-------------|--------|
| `/api/likes/send` | POST | Envoyer un like | 3/jour (gratuit) |
| `/api/likes/sent` | GET | Likes envoyés | - |
| `/api/likes/received` | GET | Likes reçus | - |
| `/api/likes/matches` | GET | Matchs mutuels | - |
| `/api/likes/stats` | GET | Statistiques | - |
| `/api/likes/:id` | DELETE | Retirer un like | - |

---

## 🎯 Améliorations suggérées (futures)

1. **Animation de match** : Effet "It's a match!" avec confettis quand mutual like
2. **Historique likes** : Page dédiée pour voir tous les likes envoyés/reçus
3. **Super-like** : Système de super-like premium avec message personnalisé
4. **Notification push** : Alertes en temps réel quand quelqu'un vous like
5. **Filtre "Qui m'a liké"** : Feature premium pour voir qui vous a liké
6. **Boost profil** : Option payante pour être mis en avant pendant 30 min

---

## 🔒 Sécurité & Conformité islamique

✅ **Photos floutées** : Respect de la pudeur (Lock icon)
✅ **Wali notifié** : Sur chaque match si utilisateur est une femme
✅ **Limite gratuite** : Évite le spam et favorise la réflexion
✅ **Pas de like anonyme** : Transparence totale
✅ **Index unique** : Impossible de liker 2 fois la même personne

---

## 📝 Résumé technique

- ✅ Backend : API complète fonctionnelle avec limites
- ✅ Frontend : Client API créé (`likes.ts`)
- ✅ Demo : Interface swipe intégrée avec compteur
- ✅ Limite gratuite : 3 likes/jour (reset automatique 24h)
- ✅ Premium : Likes illimités (toggle dans démo)
- ✅ Modal : Affichage élégant quand limite atteinte
- ✅ Design : Moderne, animations fluides, purple/pink theme
- ✅ Conformité : Système Wali intégré aux matchs

**Lignes de code ajoutées :** ~350 lignes
**Fichiers créés :** 1 (likes.ts)
**Fichiers modifiés :** 1 (demo/page.tsx)
