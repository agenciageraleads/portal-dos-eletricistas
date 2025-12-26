# 🚀 Quick Start - Deploy em 15 Minutos

## Opção Recomendada: Vercel + Railway

### Pré-requisitos
- [ ] Conta GitHub
- [ ] Código no Git (fazer push)
- [ ] Credenciais Sankhya em mãos

---

## 📝 Passo a Passo

### 1️⃣ Preparar Código (2 min)

```bash
cd "/Users/Lucas-Lenovo/Documents/Documentos/Portal dos Eletricistas"

# Verificar se está tudo OK
./verify-deploy.sh

# Commitar e fazer push
git add .
git commit -m "Deploy: configuração de produção"
git push origin main
```

### 2️⃣ Deploy Backend - Railway (5 min)

1. Acesse: https://railway.app
2. Login com GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Selecione: `Portal dos Eletricistas`
5. Configure:
   - Root Directory: `apps/api`
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npx prisma migrate deploy && node dist/main.js`

6. **Adicione PostgreSQL**:
   - Clique **+ New** → **Database** → **PostgreSQL**

7. **Variáveis de ambiente**:
   ```
   JWT_SECRET=mude-isso-para-algo-super-seguro-123456
   SANKHYA_BASE_URL=https://sua-empresa.sankhya.com.br
   SANKHYA_APP_KEY=sua-app-key
   SANKHYA_USERNAME=seu-usuario
   SANKHYA_PASSWORD=sua-senha
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://portal.gera-leads.com
   ```

8. **Copie a URL** (ex: `https://portal-api-production.up.railway.app`)

### 3️⃣ Deploy Frontend - Vercel (5 min)

1. Acesse: https://vercel.com
2. Login com GitHub
3. **Add New...** → **Project**
4. Importe: `Portal dos Eletricistas`
5. Configure:
   - Framework: **Next.js**
   - Root Directory: `apps/web`
   - Build Command: `npm run build`

6. **Variável de ambiente**:
   ```
   NEXT_PUBLIC_API_URL=https://portal-api-production.up.railway.app
   ```
   *(Use a URL copiada do Railway)*

7. **Deploy** e aguarde 2-3 min

### 4️⃣ Configurar Domínio (3 min)

1. **No Vercel**:
   - Settings → Domains
   - Adicione: `portal.gera-leads.com`
   - Copie o registro DNS

2. **No seu DNS** (onde gerencia gera-leads.com):
   - Adicione CNAME:
     - Nome: `portal`
     - Valor: `cname.vercel-dns.com`

3. **Aguarde** 5-30 min (propagação DNS)

4. **Atualize no Railway**:
   - Variável `FRONTEND_URL`: `https://portal.gera-leads.com`

---

## ✅ Verificação Rápida

```bash
# 1. Backend está vivo?
curl https://sua-api-url.railway.app/health

# 2. Frontend carrega?
# Acesse: https://portal.gera-leads.com

# 3. Teste login e busca de produtos
```

---

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Build falha no Railway | Verifique logs, pode ser falta de memória (upgrade para plano pago) |
| Frontend não conecta ao backend | Verifique `NEXT_PUBLIC_API_URL` e CORS |
| Domínio não resolve | Aguarde propagação DNS (até 48h) |
| Erro de banco de dados | Execute `npx prisma migrate deploy` no Railway |

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [deployment_guide.md](file:///Users/Lucas-Lenovo/.gemini/antigravity/brain/914af116-0b18-4492-b36a-3d037ad5354a/deployment_guide.md) - Guia completo com todas as opções
- [implementation_plan.md](file:///Users/Lucas-Lenovo/.gemini/antigravity/brain/914af116-0b18-4492-b36a-3d037ad5354a/implementation_plan.md) - Plano técnico detalhado

---

## 🎉 Pronto!

Sua aplicação estará no ar em `https://portal.gera-leads.com`

**Próximos passos**:
1. Compartilhe o link com sua equipe
2. Execute sincronização Sankhya no Railway console
3. Configure backups do banco de dados
