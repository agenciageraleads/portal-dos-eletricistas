---
description: Workflow para deploy em VPS (Docker/Portainer)
---

# Workflow de Deploy - Portal dos Eletricistas (VPS)

## 🚨 REGRA DE OURO

**NUNCA fazer push direto na `main` sem validação prévia na `dev`.**

- 🟠 **Branch `dev`**: Ambiente de Staging (Testes/Homologação).
- 🟢 **Branch `main`**: Ambiente de Produção (Oficial/Clientes).

---

## 📋 Fluxo de Desenvolvimento

### 1. Desenvolvimento Local

```bash
git checkout -b dev
# ... código ...
git add .
git commit -m "feat: nova funcionalidade"
```

### 2. Testar Localmente

```bash
npm run build
```

---

## 🚀 Deploy para Staging (Dev)

Objetivo: Validar funcionalidades novas em um ambiente idêntico ao de produção.

1. **Push para Dev:**

    ```bash
    git push origin dev
    ```

2. **Build & Update (VPS):**
    - O Portainer (ou CI/CD) deve puxar a imagem/código da branch `dev`.
    - Ou manualmente: Pull da branch `dev` e rebuild dos containers de staging.

---

## 🚀 Deploy para Produção (Main)

Objetivo: Lançar versão estável para os clientes.

### Passo 1: Merge Dev -> Main

Só faça isso após validar que tudo funciona em Staging.

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

### Passo 2: Atualizar VPS (Produção)

1. Acessar Portainer ou Terminal da VPS.
2. Puxar nova imagem Docker (tag `latest` ou versão específica).
3. Recriar containers.

---

## 📦 Versionamento (Tags)

Sempre crie uma tag ao lançar em produção:

```bash
git tag v1.5.0
git push origin v1.5.0
```

---

## 🔄 Rollback

Se produção quebrar:

```bash
# Voltar código
git revert HEAD
git push origin main

# No Portainer:
# Redeploy usando a imagem da versão anterior (ex: v1.4.0)
```
