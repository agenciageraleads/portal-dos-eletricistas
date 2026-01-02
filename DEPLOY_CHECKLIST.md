# Checklist de Deploy - Portal dos Eletricistas

> ⚠️ **IMPORTANTE:** NÃO faça deploy até que TODOS os itens deste checklist estejam marcados como concluídos.

## 🎯 Objetivo

Este checklist garante que a aplicação está funcionando perfeitamente no ambiente local antes de fazer deploy em produção (Railway/Vercel).

---

## ✅ Pré-Deploy - Verificações Obrigatórias

### 1. Ambiente Local

- [ ] **PostgreSQL está rodando**
  ```bash
  docker ps | grep portal_db
  ```

- [ ] **Backend está respondendo**
  ```bash
  curl http://localhost:3333/health
  ```
  - Deve retornar `"status": "healthy"`

- [ ] **Frontend está respondendo**
  ```bash
  curl http://localhost:3000
  ```

- [ ] **Script de verificação passa**
  ```bash
  npm run verify:local
  ```
  - Deve mostrar "✅ TUDO OK!"

### 2. Testes Funcionais

#### Registro de Eletricista
- [ ] Acessar `/cadastro`
- [ ] Preencher: Nome, CPF/CNPJ, WhatsApp, Senha
- [ ] Verificar que o registro foi bem-sucedido
- [ ] Verificar no banco que o usuário foi criado:
  ```bash
  cd apps/api && npx prisma studio
  ```

#### Login
- [ ] Acessar `/login`
- [ ] Fazer login com CPF/CNPJ
- [ ] Verificar redirecionamento para dashboard
- [ ] Verificar que o nome do usuário aparece no header

#### Criação de Orçamento
- [ ] Buscar produtos no catálogo
- [ ] Adicionar pelo menos 3 produtos ao carrinho
- [ ] Editar quantidades
- [ ] Salvar orçamento
- [ ] Verificar que o orçamento foi salvo no banco

#### Visualização Pública de Orçamento
- [ ] Copiar link público do orçamento
- [ ] Abrir em aba anônima (ou outro navegador)
- [ ] Verificar que todas as informações estão visíveis:
  - Produtos e quantidades
  - Valores
  - Informações do eletricista
- [ ] Verificar que o botão de WhatsApp funciona

#### Perfil do Eletricista
- [ ] Acessar `/perfil`
- [ ] Editar informações (bio, skills)
- [ ] Salvar alterações
- [ ] Verificar que as mudanças foram persistidas

### 3. Verificações Técnicas

#### Health Checks
- [ ] `GET /health` retorna status healthy
- [ ] `GET /health/db` retorna database healthy
- [ ] `GET /health/env` não mostra variáveis faltando

#### Logs
- [ ] Backend não mostra erros críticos no console
- [ ] Frontend não mostra erros no console do navegador
- [ ] Não há warnings de segurança

#### Performance
- [ ] Busca de produtos retorna em < 1 segundo
- [ ] Páginas carregam rapidamente
- [ ] Não há memory leaks visíveis

### 4. Código e Versionamento

- [ ] Todas as mudanças estão commitadas
  ```bash
  git status
  ```

- [ ] Branch está atualizada
  ```bash
  git pull origin main
  ```

- [ ] Build de produção funciona
  ```bash
  cd apps/api && npm run build
  cd ../web && npm run build
  ```

---

## 🚀 Preparação para Deploy

### 1. Variáveis de Ambiente de Produção

#### Railway (Backend)

Certifique-se de configurar no Railway:

```bash
# Database (fornecido pelo Railway)
DATABASE_URL=postgresql://...

# JWT Secret (GERE UMA NOVA CHAVE!)
JWT_SECRET=<gerar-com-openssl-rand-base64-32>

# Server
PORT=3333
NODE_ENV=production

# CORS
FRONTEND_URL=https://portal.gera-leads.com

# Opcional: MinIO/S3 (se usar)
AWS_ENDPOINT=https://s3.gera-leads.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=portal-produtos
AWS_PUBLIC_URL=https://s3.gera-leads.com/portal-produtos
```

#### Vercel (Frontend)

Certifique-se de configurar no Vercel:

```bash
# API URL (URL do Railway)
NEXT_PUBLIC_API_URL=https://api-portal.railway.app
```

### 2. Backup

- [ ] **Fazer backup do banco de dados local** (se tiver dados importantes)
  ```bash
  docker exec portal_db pg_dump -U admin portal_eletricista_db > backup.sql
  ```

- [ ] **Documentar estado atual** (versão, commit hash)
  ```bash
  git log -1 --oneline > deploy_version.txt
  ```

---

## 📦 Deploy

### Railway (Backend)

1. [ ] Fazer push para o repositório
   ```bash
   git push origin main
   ```

2. [ ] Aguardar deploy automático no Railway

3. [ ] Verificar logs de deploy no Railway
   - Procurar por erros
   - Confirmar que a aplicação iniciou

4. [ ] Testar health check em produção
   ```bash
   curl https://api-portal.railway.app/health
   ```

5. [ ] Executar migrações (se necessário)
   - Acessar Railway CLI ou dashboard
   - Executar: `npx prisma migrate deploy`

### Vercel (Frontend)

1. [ ] Fazer push para o repositório (se não fez ainda)

2. [ ] Aguardar deploy automático no Vercel

3. [ ] Verificar preview do deploy

4. [ ] Promover para produção

---

## ✅ Pós-Deploy - Validação em Produção

### 1. Verificações Básicas

- [ ] **Frontend carrega** em `https://portal.gera-leads.com`

- [ ] **Backend responde** em `https://api-portal.railway.app/health`
  - Deve retornar `"status": "healthy"`

- [ ] **Não há erros no console** do navegador

### 2. Testes Funcionais em Produção

#### Registro
- [ ] Criar nova conta de teste
- [ ] Verificar que o registro funciona

#### Login
- [ ] Fazer login com a conta criada
- [ ] Verificar redirecionamento

#### Orçamento
- [ ] Criar um orçamento de teste
- [ ] Verificar link público
- [ ] Testar em dispositivo móvel

### 3. Monitoramento

- [ ] Configurar alertas no Railway (opcional)
- [ ] Verificar métricas de uso
- [ ] Monitorar logs por 15-30 minutos

---

## 🚨 Rollback (Se Algo Der Errado)

Se encontrar problemas críticos em produção:

### Railway
1. Acessar Railway Dashboard
2. Ir em Deployments
3. Clicar em "Rollback" para a versão anterior

### Vercel
1. Acessar Vercel Dashboard
2. Ir em Deployments
3. Promover deployment anterior para produção

### Banco de Dados
Se precisar restaurar backup:
```bash
# Conectar ao Railway e restaurar
cat backup.sql | railway run psql $DATABASE_URL
```

---

## 📊 Checklist de Sucesso Final

Marque apenas quando TUDO estiver funcionando em produção:

- [ ] ✅ Frontend acessível e sem erros
- [ ] ✅ Backend respondendo com status healthy
- [ ] ✅ Registro de usuário funciona
- [ ] ✅ Login funciona
- [ ] ✅ Criação de orçamento funciona
- [ ] ✅ Link público de orçamento funciona
- [ ] ✅ Perfil de usuário funciona
- [ ] ✅ Nenhum erro crítico nos logs
- [ ] ✅ Performance aceitável (< 3s para carregar páginas)
- [ ] ✅ **GitHub Release publicado** (v1.x.x)

---

## 📝 Notas

**Data do Deploy:** _______________

**Versão Deployada:** _______________

**Responsável:** _______________

**Observações:**
```
[Espaço para anotações sobre o deploy]
```

---

**🎉 Parabéns! Se todos os itens estão marcados, seu deploy foi um sucesso!**
