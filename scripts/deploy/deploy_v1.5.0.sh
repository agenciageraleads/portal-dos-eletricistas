#!/bin/bash
set -e

# Version
VERSION="1.5.0"

echo "🚀 Starting Deployment for v$VERSION..."

# 1. Build and Push WEB
echo "📦 Building WEB..."
docker buildx build \
  --platform linux/amd64 \
  -t lucasborgessb/portal_dos_eletricistas:web-$VERSION \
  -f apps/web/Dockerfile \
  . \
  --build-arg NEXT_PUBLIC_API_URL=https://beta-api.portaleletricos.com.br \
  --push

# 2. Build and Push API
echo "📦 Building API..."
docker buildx build \
  --platform linux/amd64 \
  -t lucasborgessb/portal_dos_eletricistas:api-$VERSION \
  -f apps/api/Dockerfile \
  . \
  --push

echo "✅ Build and Push Complete!"
echo "Now update the stack in Portainer/VPS."
