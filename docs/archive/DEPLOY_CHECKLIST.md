# Checklist de Deploy - Portal dos Eletricistas (VPS)

> ⚠️ **IMPORTANTE:** Valide em STAGING (`dev`) antes de ir para PRODUÇÃO (`main`).

## 🎯 Objetivo

Garantir que a aplicação Dockerizada funcione perfeitamente na VPS.

---

## ✅ Pré-Deploy

### 1. Ambiente Local

- [ ] **Build Local:** `npm run build` roda sem erros?
- [ ] **Docker Build (Opcional):** A imagem constrói localmente? `docker build .`

### 2. Testes de Funcionalidade

- [ ] Registro/Login funcionam?
- [ ] Criação de Orçamento (PDF e Itens) ok?
- [ ] Upload de Imagens/Áudio ok?

### 3. Código

- [ ] Mudanças commitadas e push feito na `dev`?
- [ ] Testado em Staging?

---

## 🚀 Deploy

### Staging (Branch `dev`)

1. [ ] Fazer push: `git push origin dev`
2. [ ] Atualizar Stack de Staging no Portainer.
3. [ ] Validar URL de Staging.

### Produção (Branch `main`)

1. [ ] Merge `dev` -> `main`.
2. [ ] Push: `git push origin main`.
3. [ ] Criar Tag: `git tag vX.Y.Z` e `git push origin vX.Y.Z`.
4. [ ] Acessar Portainer (VPS).
5. [ ] Pull da nova imagem (tag `latest` ou específica).
6. [ ] "Recreate" nos containers.

---

## 📊 Pós-Deploy (Produção)

- [ ] Acessar URL oficial.
- [ ] Verificar logs no Portainer se necessário.
- [ ] Confirmar que banco de dados (migrações) está atualizado.
