#!/bin/bash

# Script para sincronizar eletricistas do Sankhya com fotos do WhatsApp

API_URL="${API_URL:-http://localhost:3333}"
LIMIT="${1:-50}"
PHOTOS="${2:-true}"

echo "🚀 Sincronizando top $LIMIT eletricistas..."
echo "📸 Download de fotos: $PHOTOS"
echo ""

curl -X POST "$API_URL/admin/sync/electricians?limit=$LIMIT&photos=$PHOTOS" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "✅ Sincronização concluída!"
