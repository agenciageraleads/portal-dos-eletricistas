#!/bin/bash

echo "🔍 Iniciando Análise da VPS para Deploy do Portal dos Eletricistas..."
echo "==================================================================="

# 1. Verificar Recursos
echo "📊 Mémoria Livre:"
free -h
echo "------------------------------"

# 2. Verificar Portas em Uso
echo "🔌 Portas em Uso (TCP):"
netstat -tulpn | grep LISTEN
echo "------------------------------"

# 3. Verificar Containers Rodando
echo "🐳 Containers Docker Ativos:"
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
echo "------------------------------"

# 4. Verificar Redes Docker
echo "🕸️ Redes Docker Existentes:"
docker network ls
echo "------------------------------"

# 5. Check Postgres Connection (se possível)
echo "🐘 Testando conexão com Postgres local (se 'postgres' command existir):"
if command -v psql &> /dev/null; then
    pg_isready -h localhost -p 5432 || echo "⚠️ Postgres não detectado na porta 5432 padrão"
else
    echo "ℹ️ Cliente psql não instalado, pular verificação direta."
fi
echo "------------------------------"

echo "✅ Análise concluída!"
echo "👉 Verifique se as portas 3000 (Web) e 3333 (API) estão livres."
echo "👉 Identifique o nome da rede Docker do seu Traefik/Postgres existente."
