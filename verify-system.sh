#!/bin/bash

# Script de Vérification Rapide - Système de Tuteurs
# Usage: chmod +x verify-system.sh && ./verify-system.sh

echo "🔍 Vérification du Système de Tuteurs - Nissfi"
echo "================================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Fonction de vérification
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        ((ERRORS++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "📁 Vérification des Fichiers Backend..."
echo "----------------------------------------"

# Backend Files
test -f "backend/src/modules/admin/tuteur.model.ts"
check "Modèle Tuteur existe"

test -f "backend/src/modules/admin/tuteur.routes.ts"
check "Routes Tuteur existent"

grep -q "tuteurRoutes" backend/src/app.ts
check "Routes Tuteur intégrées dans app.ts"

grep -q "Tuteur" backend/src/modules/admin/index.ts
check "Tuteur exporté dans admin/index.ts"

echo ""
echo "📁 Vérification des Fichiers Frontend..."
echo "----------------------------------------"

# Frontend Files
test -f "zawj/src/app/register/page.tsx"
check "Page d'inscription existe"

test -f "zawj/src/app/admin/tuteurs/page.tsx"
check "Page admin tuteurs existe"

test -f "zawj/src/app/settings/tuteurs/page.tsx"
check "Page gestion tuteurs utilisateur existe"

test -f "zawj/src/lib/api/tuteur.ts"
check "API client tuteur existe"

echo ""
echo "🎨 Vérification des Couleurs..."
echo "--------------------------------"

# Check for green colors in register page
if grep -q "green-" zawj/src/app/register/page.tsx 2>/dev/null; then
    warn "Couleurs vertes trouvées dans page d'inscription"
else
    check "Pas de couleurs vertes dans page d'inscription"
fi

# Check for red colors in register page
if grep -q "red-6" zawj/src/app/register/page.tsx 2>/dev/null; then
    check "Couleurs rouges présentes dans page d'inscription"
else
    warn "Couleurs rouges manquantes dans page d'inscription"
fi

# Check for text-black in register page
if grep -q "text-black" zawj/src/app/register/page.tsx 2>/dev/null; then
    check "Labels en noir dans page d'inscription"
else
    warn "Labels en noir manquants dans page d'inscription"
fi

echo ""
echo "📝 Vérification du Contenu..."
echo "-----------------------------"

# Check tuteurChoice in register
if grep -q "tuteurChoice" zawj/src/app/register/page.tsx 2>/dev/null; then
    check "Champ tuteurChoice présent"
else
    warn "Champ tuteurChoice manquant"
fi

# Check for "Choix du Tuteur" section
if grep -q "Choix du Tuteur" zawj/src/app/register/page.tsx 2>/dev/null; then
    check "Section 'Choix du Tuteur' présente"
else
    warn "Section 'Choix du Tuteur' manquante"
fi

# Check for paid option
if grep -q "Service de tuteur payant" zawj/src/app/register/page.tsx 2>/dev/null; then
    check "Option tuteur payant présente"
else
    warn "Option tuteur payant manquante"
fi

# Check for info option
if grep -q "Fournir les informations" zawj/src/app/register/page.tsx 2>/dev/null; then
    check "Option information tuteur présente"
else
    warn "Option information tuteur manquante"
fi

echo ""
echo "🔗 Vérification des Routes API..."
echo "----------------------------------"

# Check API routes in backend
if grep -q "assign-moderator" backend/src/modules/admin/tuteur.routes.ts 2>/dev/null; then
    check "Route assign-moderator présente"
else
    warn "Route assign-moderator manquante"
fi

if grep -q "/approve" backend/src/modules/admin/tuteur.routes.ts 2>/dev/null; then
    check "Route approve présente"
else
    warn "Route approve manquante"
fi

if grep -q "/reject" backend/src/modules/admin/tuteur.routes.ts 2>/dev/null; then
    check "Route reject présente"
else
    warn "Route reject manquante"
fi

echo ""
echo "📚 Vérification de la Documentation..."
echo "---------------------------------------"

test -f "IMPLEMENTATION_TUTEURS_RESUME.md"
check "Documentation technique présente"

test -f "DEPLOIEMENT_GUIDE.md"
check "Guide de déploiement présent"

test -f "MODIFICATIONS_FINALES.md"
check "Résumé final présent"

echo ""
echo "📦 Vérification des Dépendances..."
echo "-----------------------------------"

# Check if package.json exists
test -f "backend/package.json"
check "Backend package.json existe"

test -f "zawj/package.json"
check "Frontend package.json existe"

# Check for axios in frontend (required for tuteur API)
if grep -q "axios" zawj/package.json 2>/dev/null; then
    check "Axios installé (frontend)"
else
    warn "Axios manquant (frontend)"
fi

echo ""
echo "================================================"
echo "📊 RÉSUMÉ DE LA VÉRIFICATION"
echo "================================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ TOUT EST PARFAIT!${NC}"
    echo "Le système de tuteurs est prêt à être déployé."
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  ${WARNINGS} AVERTISSEMENT(S)${NC}"
    echo "Le système fonctionne mais certains éléments méritent attention."
else
    echo -e "${RED}❌ ${ERRORS} ERREUR(S) TROUVÉE(S)${NC}"
    echo -e "${YELLOW}⚠️  ${WARNINGS} AVERTISSEMENT(S)${NC}"
    echo "Veuillez corriger les erreurs avant le déploiement."
fi

echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Corriger les erreurs/avertissements si nécessaire"
echo "2. Tester manuellement les fonctionnalités"
echo "3. Lancer les tests automatisés"
echo "4. Déployer en environnement staging"
echo "5. Tests utilisateurs beta"
echo "6. Déploiement production"
echo ""

exit $ERRORS
