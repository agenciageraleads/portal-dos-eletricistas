#!/bin/bash

# Script de diagnóstico e correção do PostgreSQL em staging
# Autor: Portal dos Eletricistas
# Data: 2026-01-30

set -e

echo "=========================================="
echo "🔍 DIAGNÓSTICO DO POSTGRESQL STAGING"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se o stack existe
echo "1️⃣ Verificando stack portal-staging..."
if docker stack ls | grep -q "portal-staging"; then
    echo -e "${GREEN}✅ Stack encontrado${NC}"
else
    echo -e "${RED}❌ Stack não encontrado${NC}"
    exit 1
fi

# 2. Ver status dos serviços
echo ""
echo "2️⃣ Status dos serviços:"
docker stack ps portal-staging --format "table {{.Name}}\t{{.CurrentState}}\t{{.Error}}" | head -20

# 3. Ver logs do PostgreSQL (últimas 50 linhas)
echo ""
echo "3️⃣ Logs do PostgreSQL (últimas 50 linhas):"
echo "=========================================="
docker service logs portal-staging_db-staging --tail 50 2>&1 || echo -e "${YELLOW}⚠️  Não foi possível obter logs${NC}"

# 4. Verificar uso de disco
echo ""
echo "4️⃣ Uso de disco:"
df -h | grep -E "Filesystem|/var/lib/docker"

# 5. Verificar volumes
echo ""
echo "5️⃣ Volumes do Docker:"
docker volume ls | grep portal

echo ""
echo "=========================================="
echo "🔧 OPÇÕES DE CORREÇÃO"
echo "=========================================="
echo ""
echo "Escolha uma opção:"
echo "1) Reiniciar apenas o serviço db-staging"
echo "2) Remover e recriar o volume (PERDA DE DADOS!)"
echo "3) Fazer backup do volume antes de recriar"
echo "4) Verificar logs detalhados da API"
echo "5) Sair"
echo ""
read -p "Digite o número da opção: " option

case $option in
    1)
        echo ""
        echo "🔄 Reiniciando serviço db-staging..."
        docker service update --force portal-staging_db-staging
        echo -e "${GREEN}✅ Serviço reiniciado. Aguarde 30 segundos...${NC}"
        sleep 30
        docker service ps portal-staging_db-staging --no-trunc
        ;;
    2)
        echo ""
        echo -e "${RED}⚠️  ATENÇÃO: Isso irá APAGAR TODOS OS DADOS!${NC}"
        read -p "Tem certeza? Digite 'SIM' para confirmar: " confirm
        if [ "$confirm" = "SIM" ]; then
            echo "🗑️  Removendo stack..."
            docker stack rm portal-staging
            echo "Aguardando remoção completa..."
            sleep 20
            
            echo "🗑️  Removendo volume..."
            docker volume rm portal-staging_db_staging_data || true
            
            echo -e "${GREEN}✅ Volume removido. Agora faça o deploy novamente.${NC}"
        else
            echo "Operação cancelada."
        fi
        ;;
    3)
        echo ""
        echo "💾 Fazendo backup do volume..."
        BACKUP_DIR="/tmp/portal-staging-backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Criar container temporário para backup
        docker run --rm \
            -v portal-staging_db_staging_data:/data \
            -v "$BACKUP_DIR":/backup \
            alpine tar czf /backup/db_data.tar.gz -C /data .
        
        echo -e "${GREEN}✅ Backup salvo em: $BACKUP_DIR/db_data.tar.gz${NC}"
        echo ""
        echo "Agora você pode:"
        echo "1) Remover o volume: docker volume rm portal-staging_db_staging_data"
        echo "2) Recriar o stack"
        echo "3) Restaurar o backup se necessário"
        ;;
    4)
        echo ""
        echo "📋 Logs detalhados da API:"
        echo "=========================================="
        docker service logs portal-staging_api-staging --tail 100 2>&1 || echo -e "${YELLOW}⚠️  Serviço API não encontrado${NC}"
        ;;
    5)
        echo "Saindo..."
        exit 0
        ;;
    *)
        echo -e "${RED}Opção inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "✅ SCRIPT FINALIZADO"
echo "=========================================="
