#!/bin/bash

# Script de verificação pré-deploy
# Execute este script antes de fazer deploy para garantir que tudo está configurado

echo "🔍 Verificando configuração do projeto..."

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# 1. Verificar se o código está commitado
echo -e "\n📦 Verificando Git..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Existem alterações não commitadas${NC}"
    echo "Execute: git add . && git commit -m 'Preparando deploy'"
else
    echo -e "${GREEN}✅ Git está limpo${NC}"
fi

# 2. Verificar arquivos de configuração
echo -e "\n📄 Verificando arquivos de configuração..."

if [ -f "apps/api/Dockerfile" ]; then
    echo -e "${GREEN}✅ Dockerfile encontrado${NC}"
else
    echo -e "${RED}❌ Dockerfile não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "apps/api/.env.example" ]; then
    echo -e "${GREEN}✅ .env.example encontrado${NC}"
else
    echo -e "${RED}❌ .env.example não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verificar dependências
echo -e "\n📚 Verificando dependências..."
cd apps/api
if npm list @prisma/client > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma Client instalado${NC}"
else
    echo -e "${RED}❌ Prisma Client não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ../..

# 4. Verificar build
echo -e "\n🏗️  Testando build do backend..."
cd apps/api
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build do backend OK${NC}"
else
    echo -e "${RED}❌ Erro no build do backend${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ../..

echo -e "\n🏗️  Testando build do frontend..."
cd apps/web
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build do frontend OK${NC}"
else
    echo -e "${RED}❌ Erro no build do frontend${NC}"
    ERRORS=$((ERRORS + 1))
fi
cd ../..

# 5. Resumo
echo -e "\n" 
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Tudo pronto para deploy!${NC}"
    echo "================================"
    echo ""
    echo "Próximos passos:"
    echo "1. Faça push do código: git push origin main"
    echo "2. Siga o guia de deploy em deployment_guide.md"
    exit 0
else
    echo -e "${RED}❌ Encontrados $ERRORS erros${NC}"
    echo "================================"
    echo "Corrija os erros acima antes de fazer deploy"
    exit 1
fi
