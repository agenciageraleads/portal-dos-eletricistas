# Portal dos Eletricistas - Processo de Deploy (v1.7.0+)

## 🎯 Objetivo

Documentar o fluxo de deploy do Portal dos Eletricistas para produção, usando build nativo na VPS (sem GitHub Actions).

**Data**: 28 de maio de 2026  
**Versão**: v1.7.0  
**Deploy Duration**: ~10-20 minutos  
**Método**: VPS nativo (rsync + build local)

---

## 📋 Checklist Pré-Deploy

- [ ] Código commitado e pushed para `main`
- [ ] Todas as alterações testadas localmente
- [ ] Senhas/secrets removidas do código (use `/opt/portal-eletricistas/.env`)
- [ ] Migrações do banco preparadas (se houver schema changes)
- [ ] VPS Portal Elétricos acessível (187.77.37.213)
- [ ] `PORTAL_ELETRICOS_VPS_PASSWORD` carregada em `~/.env.local`

---

## 🚀 Fluxo de Deploy (Manual via scripts/deploy-vps.sh)

### Pré-requisitos

1. **Configurar variáveis de ambiente locais**:
```bash
# Copiar template (se não existir)
cp ~/.env.local.example ~/.env.local

# Editar e preencher PORTAL_ELETRICOS_VPS_PASSWORD
nano ~/.env.local

# Carregar variáveis
source ~/.env.local
```

2. **Testar conexão SSH**:
```bash
sshpass -p "$PORTAL_ELETRICOS_VPS_PASSWORD" ssh -o StrictHostKeyChecking=no root@187.77.37.213 "hostname && uptime"
```

---

## 📌 Passo 1: Code Push → Main Branch

```bash
cd /Users/Lucas-Lenovo/Documents/Documentos/Portal\ dos\ Eletricistas
git add .
git commit -m "description of changes"
git push origin main
```

---

## 📌 Passo 2: Build & Deploy na VPS (⏱️ ~10-20 minutos)

Executar o script de deploy que:
1. Sincroniza código com VPS via rsync
2. Constrói imagens Docker nativas na VPS
3. Atualiza os serviços Docker Swarm
4. Limpa imagens antigas

```bash
# Com tag personalizada (recomendado)
./scripts/deploy-vps.sh v1.7.0

# Ou com commit hash automático
./scripts/deploy-vps.sh
```

**Output esperado**:
```
╔══════════════════════════════════════════════════════╗
║  Portal dos Eletricistas — Deploy VPS                ║
╟──────────────────────────────────────────────────────╢
║  Tag:      v1.7.0
║  Web:      portaleletricos_web
║  API:      portaleletricos_api
║  VPS:      root@187.77.37.213
╚══════════════════════════════════════════════════════╝

▶ [1/7] Sincronizando código com a VPS...
   ✓ Rsync concluído

▶ [2/7] Construindo imagem Web...
   ✓ Imagem Web construída

▶ [3/7] Construindo imagem API...
   ✓ Imagem API construída

▶ [4/7] Atualizando Web service...
   ✓ Web service atualizado

▶ [5/7] Atualizando API service...
   ✓ API service atualizado

▶ [6/7] Verificando estado dos serviços...
   Web: portaleletricos_web.1.xyz... Running 1 minute ago
   API: portaleletricos_api.1.abc... Running 1 minute ago

▶ [7/7] Limpando imagens antigas...
   ✓ Cleanup concluído

✅  Deploy concluído!
```

---

## 🔐 Configuração de Variáveis de Ambiente na VPS

Antes do primeiro deploy, configure `/opt/portal-eletricistas/.env` na VPS:

```bash
ssh root@187.77.37.213

mkdir -p /opt/portal-eletricistas

cat > /opt/portal-eletricistas/.env << 'EOF'
# ====== API Configuration ======
NODE_ENV=production
PORT=3000
JWT_SECRET=<gerar-com-openssl-rand-base64-32>
DATABASE_URL=postgres://portal:portal_senha_forte@db:5432/portal_eletricistas?schema=public

# ====== S3 / MinIO ======
S3_ENDPOINT=https://s3.gera-leads.com
S3_ACCESS_KEY=<sua-chave>
S3_SECRET_KEY=<seu-segredo>
S3_BUCKET=portal-produtos
S3_REGION=us-east-1

# ====== Sankhya Integration ======
SANKHYA_CLIENT_ID=<seu-client-id>
SANKHYA_CLIENT_SECRET=<seu-secret>
SANKHYA_X_TOKEN=<seu-token>

# ====== Email Configuration ======
EMAIL_USER=<seu-email>
EMAIL_PASSWORD=<sua-senha-app>

# ====== Evolution API (WhatsApp) ======
EVOLUTION_API_URL=http://5.161.247.240:3000
EVOLUTION_API_KEY=<sua-api-key>
EVOLUTION_INSTANCE_NAME=default

# ====== OpenAI ======
OPENAI_API_KEY=<sua-chave>
EOF

chmod 600 /opt/portal-eletricistas/.env
```

Gerar secrets de forma segura:
```bash
openssl rand -base64 32  # JWT_SECRET
```

---

## 📊 O que foi alterado em v1.7.0

### Frontend (web)
- ✅ Design azul restaurado (#2563eb)
- ✅ Barra inferior com 5 abas (Orçamentos, Serviços, HOME, Ferramentas, Perfil)
- ✅ Feed social "instagramado"
- ✅ Check-in QR code para eventos
- ✅ Votação/comentários com proteção anônima

### Backend (api)
- ✅ Novos módulos: Posts, Reviews, Events, Checkin
- ✅ Migrações desabilitadas no bootstrap (aplicadas via baseline)
- ✅ Endpoints para enviar mensagens, curtidas, comentários
- ✅ Suporte a upload de fotos de obras

### Banco de Dados
- ✅ 20 migrações aplicadas via baseline
- ✅ Tabelas: posts, comments, likes, reviews, events, event_responses

---

## ✅ Pós-Deploy: Validação

### Health Checks Imediatos

```bash
# Frontend
curl -I https://app.portaleletricos.com.br
# Esperado: HTTP/1.1 200 OK

# API
curl https://api.portaleletricos.com.br/health
# Esperado: {"status":"ok"}

# Docker Status
ssh root@187.77.37.213 "docker service ls | grep portaleletricos"
# Esperado: web 1/1 running, api 1/1 running
```

### Logs da VPS

```bash
ssh root@187.77.37.213

# Logs Web
docker service logs portaleletricos_web --tail 50

# Logs API
docker service logs portaleletricos_api --tail 50

# Buscar erros
docker service logs portaleletricos_api --tail 200 | grep -i error
```

### Verificação Manual

- [ ] Acessar https://app.portaleletricos.com.br no browser
- [ ] Verificar cores azul (#2563eb)
- [ ] Testar navegação das 5 abas
- [ ] Verificar carregamento do feed social
- [ ] Testar check-in QR code
- [ ] Validar HTTPS (cadeado 🔒)

---

## 🛠️ Troubleshooting

### Problema: Script falha com "PORTAL_ELETRICOS_VPS_PASSWORD não definida"

**Solução**:
```bash
# Verificar se está definida
echo $PORTAL_ELETRICOS_VPS_PASSWORD

# Carregar de ~/.env.local
source ~/.env.local

# Ou exportar manualmente
export PORTAL_ELETRICOS_VPS_PASSWORD="sua-senha-aqui"
```

### Problema: Rsync demora muito ou falha

**Solução**: Verificar conectividade SSH
```bash
ssh -o ConnectTimeout=10 root@187.77.37.213 "echo OK"
```

### Problema: Build falha na VPS

**Solução**: SSH para a VPS e verificar espaço em disco
```bash
ssh root@187.77.37.213
df -h
docker system df
```

Se espaço insuficiente:
```bash
docker system prune -a --volumes  # ⚠️  Remove TUDO
docker volume ls
docker volume rm <volume-id>
```

### Problema: API não inicia (Prisma error)

**Solução**: Verificar banco de dados
```bash
ssh root@187.77.37.213

# Conectar ao banco
DB_CID=$(docker ps -q --filter name=portaleletricos_db)
docker exec "$DB_CID" psql -U portal -d portal_eletricistas \
  -c "SELECT COUNT(*) FROM _prisma_migrations;"
```

Se o schema está corrompido, aplicar baseline:
```bash
# Limpar e reiniciar migrações (⚠️  DESTRUTIVO)
docker exec "$DB_CID" psql -U portal -d portal_eletricistas <<'SQL'
DROP TABLE IF EXISTS _prisma_migrations CASCADE;
CREATE TABLE _prisma_migrations (
    id SERIAL PRIMARY KEY NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    migration_name VARCHAR(255) NOT NULL,
    logs TEXT,
    rolled_back_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_steps_count INTEGER NOT NULL DEFAULT 0
);
SQL
```

---

## 🔄 Rollback

Se houver problema crítico pós-deploy:

```bash
# Voltar para tag anterior
ssh root@187.77.37.213

# Verificar tags disponíveis
docker images portal-eletricistas-web --format '{{.Tag}}'

# Atualizar para versão anterior
docker service update --image portal-eletricistas-web:v1.6.3 portaleletricos_web
docker service update --image portal-eletricistas-api:v1.6.3 portaleletricos_api

# Verificar status
docker service ps portaleletricos_web
docker service ps portaleletricos_api
```

---

## 📝 Comandos Úteis

```bash
# Ver status do stack
docker stack services portaleletricos

# Ver logs em tempo real
docker service logs -f portaleletricos_web
docker service logs -f portaleletricos_api

# Reiniciar um serviço
docker service update --force portaleletricos_web

# Ver histórico de imagens
docker images portal-eletricistas-web

# Limpar espaço (cuidado!)
docker image prune -a --filter "until=24h"
```

---

## 📞 Contatos & Recursos

- **VPS Portal Elétricos**: `187.77.37.213` (root)
- **App Frontend**: `https://app.portaleletricos.com.br`
- **App Backend**: `https://api.portaleletricos.com.br`
- **Deploy Script**: `./scripts/deploy-vps.sh`
- **Env Template**: `~/.env.local.example`

---

## 🔐 Segurança

✅ Senhas em `/opt/portal-eletricistas/.env` na VPS (nunca em git)  
✅ `PORTAL_ELETRICOS_VPS_PASSWORD` em `~/.env.local` local (nunca em git)  
✅ Secrets gerados com `openssl rand` para cada deployment  
✅ SSH via `sshpass` com variáveis de ambiente  

---

*Documentação criada em 28/05/2026. Versão v1.7.0+.*

