#!/bin/bash

# Configuration
PROD_CONTAINER=$(docker ps --filter "name=api_db.1" --format "{{.Names}}" | head -n 1) # Assumes standard Docker Swarm/Compose naming
STAGING_CONTAINER=$(docker ps --filter "name=db-staging" --format "{{.Names}}" | head -n 1)

PROD_DB=${POSTGRES_DB}
PROD_USER=${POSTGRES_USER}
PROD_PASS=${POSTGRES_PASSWORD}

STAGING_DB=${STAGING_DB_NAME}
STAGING_USER=${STAGING_DB_USER}
STAGING_PASS=${STAGING_DB_PASSWORD}

echo "🚀 Iniciando sincronização: $PROD_DB -> $STAGING_DB"

# 1. Export PRos Production DB
echo "📥 Extraindo dump de Produção..."
docker exec $PROD_CONTAINER pg_dump -U $PROD_USER $PROD_DB > prod_dump.sql

# 2. Restore to Staging
echo "📤 Restaurando no Staging..."
cat prod_dump.sql | docker exec -i $STAGING_CONTAINER psql -U $STAGING_USER -d $STAGING_DB

# 3. Run Migrations on Staging (via API container)
echo "🔄 Rodando migrações no Staging..."
API_STAGING=$(docker ps --filter "name=api-staging" --format "{{.Names}}" | head -n 1)
docker exec $API_STAGING npx prisma migrate deploy

echo "✅ Sincronização concluída!"
rm prod_dump.sql
