#!/bin/bash

# Script de Verificação do Ambiente Local
# Verifica se todos os serviços estão rodando corretamente

set -e

echo "🔍 Verificando Ambiente Local do Portal dos Eletricistas..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# 1. Verificar se PostgreSQL está rodando
echo "1️⃣  Verificando PostgreSQL..."
if docker ps | grep -q portal_db; then
    echo -e "${GREEN}✅ PostgreSQL está rodando${NC}"
else
    echo -e "${RED}❌ PostgreSQL NÃO está rodando${NC}"
    echo -e "${YELLOW}   Execute: docker-compose up -d${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Verificar se o backend está respondendo
echo "2️⃣  Verificando Backend (API)..."
if curl -s -f http://localhost:3333/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está respondendo em http://localhost:3333${NC}"
    
    # Mostrar detalhes do health check
    HEALTH_STATUS=$(curl -s http://localhost:3333/health | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo -e "${GREEN}   Status: HEALTHY${NC}"
    else
        echo -e "${YELLOW}   Status: $HEALTH_STATUS${NC}"
    fi
else
    echo -e "${RED}❌ Backend NÃO está respondendo${NC}"
    echo -e "${YELLOW}   Execute: cd apps/api && npm run dev${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Verificar se o frontend está respondendo
echo "3️⃣  Verificando Frontend (Web)..."
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend está respondendo em http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend NÃO está respondendo${NC}"
    echo -e "${YELLOW}   Execute: cd apps/web && npm run dev${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Verificar variáveis de ambiente do backend
echo "4️⃣  Verificando variáveis de ambiente (Backend)..."
if [ -f "apps/api/.env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    
    # Verificar variáveis críticas
    if grep -q "DATABASE_URL" apps/api/.env && \
       grep -q "JWT_SECRET" apps/api/.env && \
       grep -q "FRONTEND_URL" apps/api/.env; then
        echo -e "${GREEN}   Variáveis críticas presentes${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Algumas variáveis podem estar faltando${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo .env NÃO encontrado${NC}"
    echo -e "${YELLOW}   Copie o .env.example: cp apps/api/.env.example apps/api/.env${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Verificar variáveis de ambiente do frontend
echo "5️⃣  Verificando variáveis de ambiente (Frontend)..."
if [ -f "apps/web/.env.local" ]; then
    echo -e "${GREEN}✅ Arquivo .env.local encontrado${NC}"
    
    if grep -q "NEXT_PUBLIC_API_URL" apps/web/.env.local; then
        API_URL=$(grep "NEXT_PUBLIC_API_URL" apps/web/.env.local | cut -d'=' -f2)
        echo -e "${GREEN}   API URL: $API_URL${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo .env.local NÃO encontrado${NC}"
    echo -e "${YELLOW}   Copie o .env.local.example: cp apps/web/.env.local.example apps/web/.env.local${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Resumo final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TUDO OK! Ambiente local está funcionando perfeitamente!${NC}"
    echo ""
    echo "📋 Próximos passos:"
    echo "   • Acesse o frontend: http://localhost:3000"
    echo "   • Acesse a API: http://localhost:3333"
    echo "   • Health check: http://localhost:3333/health"
    exit 0
else
    echo -e "${RED}❌ Encontrados $ERRORS problema(s)${NC}"
    echo -e "${YELLOW}   Corrija os problemas acima antes de continuar${NC}"
    exit 1
fi
