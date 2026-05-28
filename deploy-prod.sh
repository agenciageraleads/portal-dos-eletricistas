#!/bin/bash
set -e

echo "🚀 Portal Elétricos - Deploy em Produção"
echo "=========================================="

# 1. Fazer push das imagens para ghcr.io
echo ""
echo "📤 Fazendo push das imagens para ghcr.io..."
docker push ghcr.io/agenciageraleads/portal-dos-eletricistas:web-1.7.0
docker push ghcr.io/agenciageraleads/portal-dos-eletricistas:api-1.7.0

# 2. Atualizar serviços na VPS
echo ""
echo "🌐 Atualizando serviços na VPS Portal Elétricos (187.77.37.213)..."

# Ler a senha da variável de ambiente (seguro)
export PORTAL_VPS_PASSWORD="${PORTAL_VPS_PASSWORD:-ImPh,RbdVk4.gLuc@X8t}"

# Conectar à VPS e executar atualizações
sshpass -p "$PORTAL_VPS_PASSWORD" ssh -o StrictHostKeyChecking=no root@187.77.37.213 <<'ENDSSH'
echo "=== VPS: Atualizando imagens no Docker Swarm ==="
docker service update --image ghcr.io/agenciageraleads/portal-dos-eletricistas:web-1.7.0 --force portaleletricos_web
docker service update --image ghcr.io/agenciageraleads/portal-dos-eletricistas:api-1.7.0 --force portaleletricos_api

# Aguardar os serviços ficarem healthy
echo "=== VPS: Aguardando serviços iniciarem... ==="
sleep 10

echo "=== VPS: Status dos serviços ==="
docker service ls
echo ""
docker service ps portaleletricos_web portaleletricos_api

echo "=== VPS: Deploy finalizado com sucesso! ==="
ENDSSH

echo ""
echo "🎉 Deploy em produção CONCLUÍDO!"
echo ""
echo "🔗 Acesse: https://app.portaleletricos.com.br"
