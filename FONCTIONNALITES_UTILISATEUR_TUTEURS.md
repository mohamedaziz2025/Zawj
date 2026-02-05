# Fonctionnalités de Gestion des Tuteurs pour les Utilisatrices

## Vue d'ensemble

Le système de gestion des tuteurs (Wali) permet aux femmes musulmanes de respecter les principes islamiques en matière de mariage, en désignant un tuteur (père, frère, oncle, imam, etc.) qui supervisera leur processus de recherche de conjoint.

## Accès aux Fonctionnalités

### Pour les Utilisatrices (Femmes)

#### 1. Navigation vers la Gestion des Tuteurs

Les femmes peuvent accéder à la gestion de leurs tuteurs via :
- **Menu Paramètres** → **Onglet "Tuteurs"**
- URL directe : `/settings/tuteurs`

L'onglet "Tuteurs" apparaît uniquement pour les utilisatrices de genre féminin, entre les onglets "Sécurité" et "Compte".

#### 2. Fonctionnalités Disponibles

##### A. Visualisation des Tuteurs
- Liste complète de tous les tuteurs associés au compte
- Affichage du statut de chaque tuteur :
  - 🟡 **En attente** (`pending`) : Le tuteur n'a pas encore été approuvé
  - 🟢 **Approuvé** (`approved`) : Le tuteur a été validé et est actif
  - 🔴 **Rejeté** (`rejected`) : Le tuteur a été refusé avec une raison
- Informations affichées pour chaque tuteur :
  - Nom complet
  - Email
  - Téléphone
  - Relation (père, frère, oncle, grand-père, imam, membre de confiance, modérateur)
  - Type (famille, payant, assigné par la plateforme)
  - Accès au tableau de bord
  - Notifications activées

##### B. Ajout d'un Nouveau Tuteur

Bouton **"+ Ajouter un Tuteur"** permet de créer une demande pour un nouveau tuteur :

**Formulaire d'ajout :**
- **Nom complet** (obligatoire)
- **Email** (obligatoire)
- **Téléphone** (optionnel)
- **Relation** (obligatoire) :
  - Père
  - Frère
  - Oncle
  - Grand-père
  - Imam
  - Membre de confiance de la communauté
- **Type de tuteur** (obligatoire) :
  - `family` : Membre de la famille
  - `paid` : Service payant
- **Options** :
  - ☐ Accès au tableau de bord
  - ☑ Notifications pour nouveaux messages (activé par défaut)

**Processus :**
1. L'utilisatrice remplit le formulaire
2. La demande est créée avec le statut "En attente"
3. Un administrateur doit approuver ou rejeter la demande
4. L'utilisatrice reçoit une notification du résultat

##### C. Tuteurs Assignés par la Plateforme

Lorsqu'un administrateur assigne un modérateur comme "Tuteur de Société" :
- Apparaît automatiquement dans la liste
- Badge spécial **"Tuteur de Société"** en rouge
- Informations du modérateur affichées
- Status automatiquement "Approuvé"

##### D. Messages d'Information

**Si aucun tuteur n'est enregistré :**
```
⚠️ Aucun tuteur enregistré
Conformément aux principes islamiques du mariage, nous vous recommandons vivement d'ajouter un tuteur (wali) 
qui supervisera votre démarche de recherche de conjoint. Cela peut être votre père, frère, oncle, ou tout 
autre homme musulman de confiance.
```

**Bouton d'action :** "Ajouter mon premier tuteur"

## Backend - Endpoints API

### Endpoints Utilisateur

#### 1. Récupérer Mes Tuteurs
```http
GET /api/tuteurs/my-tuteurs
Authorization: Bearer {token}
```

**Réponse :**
```json
{
  "success": true,
  "tuteurs": [
    {
      "_id": "...",
      "name": "Ahmed Ben Ali",
      "email": "ahmed@example.com",
      "phone": "+33612345678",
      "relationship": "father",
      "status": "approved",
      "type": "family",
      "isPaid": false,
      "assignedByAdmin": false,
      "hasAccessToDashboard": true,
      "notifyOnNewMessage": true,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### 2. Demander un Nouveau Tuteur
```http
POST /api/tuteurs/request
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Mohammed Ben Ali",
  "email": "mohammed@example.com",
  "phone": "+33698765432",
  "relationship": "brother",
  "type": "family",
  "hasAccessToDashboard": false,
  "notifyOnNewMessage": true
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Demande de tuteur créée avec succès. En attente d'approbation.",
  "tuteur": {
    "_id": "...",
    "name": "Mohammed Ben Ali",
    "status": "pending",
    ...
  }
}
```

## Workflow Complet

### Scénario 1 : Inscription d'une Nouvelle Utilisatrice

1. **Page d'inscription** (`/register`)
   - Étape 3 pour les femmes : Choix du tuteur
   - 2 options :
     - ⚪ "Je veux un tuteur payant de votre service" → `tuteurChoice: 'paid'`
     - ⚪ "Je fournis les informations de mon tuteur" → `tuteurChoice: 'info'`
   
2. **Si "Je fournis les informations"** :
   - Formulaire affiché avec champs :
     - Nom complet du tuteur
     - Email du tuteur
     - Relation avec le tuteur
   - À la soumission :
     - Compte utilisatrice créé
     - Tuteur créé automatiquement avec `status: 'pending'`
     - Email de notification envoyé à l'admin

3. **Si "Je veux un tuteur payant"** :
   - Message affiché : "Vous serez contacté par notre équipe..."
   - Compte créé sans tuteur
   - Admin peut assigner un modérateur comme tuteur

### Scénario 2 : Utilisatrice Existante Ajoute un Tuteur

1. Navigation : **Paramètres** → **Tuteurs**
2. Clic sur **"+ Ajouter un Tuteur"**
3. Remplissage du formulaire
4. Validation → Statut "En attente"
5. Notification admin → Approbation/Rejet
6. Notification utilisatrice du résultat

### Scénario 3 : Admin Assigne un Modérateur

1. Admin accède à `/admin/tuteurs`
2. Clic sur **"Assigner un Modérateur"**
3. Sélection de la femme
4. Sélection du modérateur
5. Configuration des options
6. Validation
7. Tuteur créé avec :
   - `type: 'platform-assigned'`
   - `assignedByAdmin: true`
   - `status: 'approved'`
   - `moderatorId: {id_du_moderateur}`

## Modèle de Données

### Tuteur Model (`backend/src/modules/admin/tuteur.model.ts`)

```typescript
interface ITuteur {
  userId: ObjectId              // Référence à l'utilisatrice
  name: string                  // Nom du tuteur
  email: string                 // Email du tuteur
  phone?: string                // Téléphone (optionnel)
  relationship: string          // Relation avec l'utilisatrice
  status: 'pending' | 'approved' | 'rejected'
  type: 'family' | 'paid' | 'platform-assigned'
  isPaid: boolean               // Si service payant
  assignedByAdmin: boolean      // Si assigné par admin
  moderatorId?: ObjectId        // Si tuteur = modérateur
  hasAccessToDashboard: boolean // Accès au tableau de bord
  notifyOnNewMessage: boolean   // Recevoir notifications
  verifiedBy?: ObjectId         // Admin qui a vérifié
  verifiedAt?: Date             // Date de vérification
  rejectionReason?: string      // Raison du rejet
  documents?: Array             // Documents justificatifs
  createdAt: Date
  updatedAt: Date
}
```

## Interface Utilisateur

### Design
- **Schéma de couleurs** : Rouge (#dc2626, red-600/700) au lieu de vert
- **Badges de statut** :
  - En attente : Fond jaune, texte foncé
  - Approuvé : Fond rouge clair, texte rouge foncé
  - Rejeté : Fond gris, texte gris foncé
- **Cartes tuteur** : Fond blanc semi-transparent (glass effect)
- **Boutons d'action** : Dégradé rouge (from-red-600 to-red-700)

### Responsive
- Mobile-first design
- Grille adaptative pour les cartes tuteur
- Modal plein écran sur mobile pour le formulaire

## Sécurité

### Validations Backend
- Authentification JWT requise
- Vérification du genre (femme uniquement)
- Validation email format
- Validation des champs obligatoires
- Protection contre les injections

### Validations Frontend
- Validation en temps réel des champs
- Messages d'erreur clairs
- Désactivation des boutons pendant les requêtes
- Gestion des erreurs réseau

## Notifications

### Notifications Utilisatrice
- Tuteur approuvé
- Tuteur rejeté (avec raison)
- Modérateur assigné comme tuteur
- Nouveau message pour le tuteur

### Notifications Admin
- Nouvelle demande de tuteur
- Tuteur ajouté pendant inscription

## Prochaines Améliorations

1. **Dashboard Tuteur**
   - Interface dédiée pour les tuteurs
   - Vue des profils consultés
   - Historique des conversations
   - Notifications des matchs

2. **Vérification d'Identité**
   - Upload de documents
   - Vérification par l'admin
   - Badge "Vérifié" sur le profil

3. **Communication Tuteur-Plateforme**
   - Messagerie dédiée
   - Rapports mensuels
   - Demandes d'intervention

4. **Statistiques**
   - Nombre de matchs supervisés
   - Taux d'approbation
   - Temps de réponse moyen

---

## Résumé des Fichiers Modifiés/Créés

### Backend
- ✅ `backend/src/modules/admin/tuteur.model.ts` - Modèle Mongoose
- ✅ `backend/src/modules/admin/tuteur.routes.ts` - Routes API
- ✅ `backend/src/modules/auth/auth.routes.ts` - Ajout logique tuteur à l'inscription
- ✅ `backend/src/modules/auth/auth.schema.ts` - Validation tuteurChoice
- ✅ `backend/src/app.ts` - Intégration routes tuteur

### Frontend
- ✅ `zawj/src/app/settings/page.tsx` - Ajout onglet Tuteurs (femmes uniquement)
- ✅ `zawj/src/app/settings/tuteurs/page.tsx` - Page gestion tuteurs utilisatrice
- ✅ `zawj/src/app/register/page.tsx` - Choix tuteur à l'inscription
- ✅ `zawj/src/lib/api/tuteur.ts` - Client API tuteurs
- ✅ `zawj/src/app/admin/tuteurs/page.tsx` - Interface admin tuteurs

### Documentation
- ✅ `FONCTIONNALITES_UTILISATEUR_TUTEURS.md` - Ce document

---

**Date de dernière mise à jour** : 2024
**Version** : 1.0
**Statut** : ✅ Fonctionnel et déployé
