#!/usr/bin/env bash
# ============================================================
# deploy-vps.sh — Portal dos Eletricistas
#
# Build nativo na VPS, deploy no Swarm e limpeza automática
# de imagens antigas.
#
# Uso:
#   ./scripts/deploy-vps.sh [TAG]
#
#   TAG opcional: nome curto para a imagem (ex.: "v1.7.0")
#   Se omitido, usa o hash curto do commit atual.
#
# Mantém as 2 imagens mais recentes, remove o resto.
# ============================================================

set -euo pipefail

# ── Configuração ─────────────────────────────────────────────
VPS_HOST="187.77.37.213"
VPS_USER="root"
VPS_BUILD_DIR="/opt/portal-eletricistas-build"
SERVICE_STACK="portaleletricos"
SERVICE_WEB="${SERVICE_STACK}_web"
SERVICE_API="${SERVICE_STACK}_api"
IMAGE_WEB="portal-eletricistas-web"
IMAGE_API="portal-eletricistas-api"
KEEP_IMAGES=2   # número de imagens a manter

# Carregar senha da VPS de variável de ambiente
if [[ -z "${PORTAL_ELETRICOS_VPS_PASSWORD:-}" ]]; then
  echo "❌ Erro: PORTAL_ELETRICOS_VPS_PASSWORD não definida"
  echo "   Defina em ~/.env.local ou exporte: export PORTAL_ELETRICOS_VPS_PASSWORD='...'"
  exit 1
fi

SSH_CMD="sshpass -p '${PORTAL_ELETRICOS_VPS_PASSWORD}' ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST}"
RSYNC_CMD="sshpass -p '${PORTAL_ELETRICOS_VPS_PASSWORD}' rsync -az --delete \
  --exclude='.git' \
  --exclude='.claude' \
  --exclude='.agent' \
  --exclude='.secrets' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='*.log' \
  --exclude='scripts/deploy-vps.sh'"

# ── Tag da imagem ─────────────────────────────────────────────
if [[ "${1:-}" != "" ]]; then
  TAG="${1}"
else
  GIT_SHORT=$(git -C "$(dirname "$0")/.." rev-parse --short HEAD 2>/dev/null || echo "local")
  TAG="${GIT_SHORT}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Portal dos Eletricistas — Deploy VPS                ║"
echo "╟──────────────────────────────────────────────────────╢"
echo "║  Tag:      ${TAG}"
echo "║  Web:      ${SERVICE_WEB}"
echo "║  API:      ${SERVICE_API}"
echo "║  VPS:      ${VPS_USER}@${VPS_HOST}"
echo "║  Build:    ${VPS_BUILD_DIR}"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Rsync ──────────────────────────────────────────────────
echo "▶ [1/7] Sincronizando código com a VPS..."
eval "${RSYNC_CMD}" \
  "$(dirname "$0")/../" \
  "${VPS_USER}@${VPS_HOST}:${VPS_BUILD_DIR}/" \
  -e "'sshpass -p ${PORTAL_ELETRICOS_VPS_PASSWORD} ssh -o StrictHostKeyChecking=no'"
echo "   ✓ Rsync concluído"

# ── 2. Build Web na VPS ───────────────────────────────────────
echo ""
echo "▶ [2/7] Construindo imagem Web (${IMAGE_WEB}:${TAG})..."
eval "${SSH_CMD}" "cd ${VPS_BUILD_DIR} && docker build -t '${IMAGE_WEB}:${TAG}' -f apps/web/Dockerfile . 2>&1 | tail -5"
echo "   ✓ Imagem Web construída"

# ── 3. Build API na VPS ───────────────────────────────────────
echo ""
echo "▶ [3/7] Construindo imagem API (${IMAGE_API}:${TAG})..."
eval "${SSH_CMD}" "cd ${VPS_BUILD_DIR} && docker build -t '${IMAGE_API}:${TAG}' -f apps/api/Dockerfile . 2>&1 | tail -5"
echo "   ✓ Imagem API construída"

# ── 4. Atualizar Web Service ──────────────────────────────────
echo ""
echo "▶ [4/7] Atualizando Web service..."
eval "${SSH_CMD}" "docker service update --image '${IMAGE_WEB}:${TAG}' ${SERVICE_WEB}"
echo "   ✓ Web service atualizado"

# ── 5. Atualizar API Service ──────────────────────────────────
echo ""
echo "▶ [5/7] Atualizando API service..."
eval "${SSH_CMD}" "docker service update --image '${IMAGE_API}:${TAG}' ${SERVICE_API}"
echo "   ✓ API service atualizado"

# ── 6. Verificação rápida ─────────────────────────────────────
echo ""
echo "▶ [6/7] Verificando estado dos serviços..."
sleep 5
echo ""
echo "   Web:"
eval "${SSH_CMD}" "docker service ps ${SERVICE_WEB} --format '    {{.Name}}\t{{.CurrentState}}' | head -1"
echo ""
echo "   API:"
eval "${SSH_CMD}" "docker service ps ${SERVICE_API} --format '    {{.Name}}\t{{.CurrentState}}' | head -1"

# ── 7. Limpeza de imagens antigas ─────────────────────────────
echo ""
echo "▶ [7/7] Limpando imagens antigas..."

# Cleanup Web
echo ""
echo "   Limpando ${IMAGE_WEB}:"
CLEANUP_WEB=$(cat <<'HEREDOC'
KEEP=KEEP_PLACEHOLDER
docker images IMAGE_WEB_PLACEHOLDER --format '{{.Tag}}\t{{.CreatedAt}}' \
  | sort -k2 -r \
  | awk '{print $1}' \
  | tail -n +$((KEEP + 1)) \
  | while read -r tag; do
      full="IMAGE_WEB_PLACEHOLDER:${tag}"
      docker rmi "${full}" 2>/dev/null && echo "      🗑  Removida: ${full}" || echo "      ↷ Não removida (em uso?): ${full}"
    done
HEREDOC
)
CLEANUP_WEB="${CLEANUP_WEB//KEEP_PLACEHOLDER/$KEEP_IMAGES}"
CLEANUP_WEB="${CLEANUP_WEB//IMAGE_WEB_PLACEHOLDER/$IMAGE_WEB}"
eval "${SSH_CMD}" "$CLEANUP_WEB"

# Cleanup API
echo ""
echo "   Limpando ${IMAGE_API}:"
CLEANUP_API=$(cat <<'HEREDOC'
KEEP=KEEP_PLACEHOLDER
docker images IMAGE_API_PLACEHOLDER --format '{{.Tag}}\t{{.CreatedAt}}' \
  | sort -k2 -r \
  | awk '{print $1}' \
  | tail -n +$((KEEP + 1)) \
  | while read -r tag; do
      full="IMAGE_API_PLACEHOLDER:${tag}"
      docker rmi "${full}" 2>/dev/null && echo "      🗑  Removida: ${full}" || echo "      ↷ Não removida (em uso?): ${full}"
    done
HEREDOC
)
CLEANUP_API="${CLEANUP_API//KEEP_PLACEHOLDER/$KEEP_IMAGES}"
CLEANUP_API="${CLEANUP_API//IMAGE_API_PLACEHOLDER/$IMAGE_API}"
eval "${SSH_CMD}" "$CLEANUP_API"

echo ""

# ── Resumo ────────────────────────────────────────────────────
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  Deploy concluído!                               ║"
echo "║  Tag em execução: ${TAG}"
echo "║  URL Frontend: https://app.portaleletricos.com.br"
echo "║  URL API: https://api.portaleletricos.com.br/health"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

echo "Imagens Web na VPS:"
eval "${SSH_CMD}" "docker images ${IMAGE_WEB} --format '  {{.Tag}}\t{{.Size}}\t{{.CreatedAt}}' | sort -k3 -r"
echo ""

echo "Imagens API na VPS:"
eval "${SSH_CMD}" "docker images ${IMAGE_API} --format '  {{.Tag}}\t{{.Size}}\t{{.CreatedAt}}' | sort -k3 -r"
echo ""
