---
description: Workflow seguro para deploy em produção
---

# Workflow de Deploy - Portal dos Eletricistas

## 🚨 REGRA DE OURO

**NUNCA fazer `git push origin main` sem aprovação explícita do usuário.**

Todos os pushes para `main` disparam deploy automático em:
- 🔵 Vercel (Frontend)
- 🟣 Railway (Backend)

---

## 📋 Fluxo de Desenvolvimento

### 1. Desenvolvimento Local

```bash
# Criar branch de desenvolvimento
git checkout -b dev

# Fazer alterações
# ... código ...

# Commit local (não afeta produção)
git add .
git commit -m "feat: descrição da mudança"
```

### 2. Testar Localmente

```bash
# Frontend
cd apps/web
npm run dev

# Backend
cd apps/api
npm run dev
```

### 3. Push para Branch de Dev (Opcional)

```bash
# Push para branch de desenvolvimento
git push origin dev

# Vercel cria preview automático
# URL: portal-xxx-git-dev.vercel.app
```

---

## 🚀 Deploy para Produção

### Passo 1: Revisar Mudanças

```bash
# Ver diferenças entre dev e main
git diff main dev

# Listar arquivos alterados
git diff --name-only main dev
```

### Passo 2: Merge para Main

```bash
# Voltar para main
git checkout main

# Atualizar main
git pull origin main

# Merge da branch de desenvolvimento
git merge dev
```

### Passo 3: Push (COM APROVAÇÃO)

**⚠️ IMPORTANTE:** Antes de fazer o push, o agente DEVE:

1. Mostrar resumo das alterações
2. Listar arquivos modificados
3. Perguntar: "Confirma o deploy para produção?"
4. Aguardar aprovação explícita

```bash
# Só executar após aprovação
git push origin main
```

---

## 🔧 Comandos Úteis

### Desfazer último commit (local)
```bash
git reset --soft HEAD~1
```

### Desfazer push (CUIDADO!)
```bash
git revert HEAD
git push origin main
```

### Ver histórico
```bash
git log --oneline -10
```

### Criar tag de versão
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## 📦 Versionamento

Seguir padrão semântico: `v{MAJOR}.{MINOR}.{PATCH}`

- **MAJOR**: Mudanças incompatíveis (v2.0.0)
- **MINOR**: Novas funcionalidades (v1.1.0)
- **PATCH**: Correções de bugs (v1.0.1)

Exemplo:
```bash
# Nova feature
git tag v1.1.0 -m "Adiciona filtro de produtos"
git push origin v1.1.0

# Correção de bug
git tag v1.0.1 -m "Corrige erro no login"
git push origin v1.0.1
```

---

## ✅ Checklist Pré-Deploy

Antes de fazer push para `main`, verificar:

- [ ] Código testado localmente
- [ ] Sem erros no console
- [ ] Build passa sem warnings críticos
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations rodadas (se houver)
- [ ] Aprovação do usuário obtida

---

## 🔄 Rollback Rápido

Se algo der errado em produção:

```bash
# Ver últimos commits
git log --oneline -5

# Voltar para commit anterior
git revert HEAD
git push origin main

# Ou voltar para versão específica
git revert <commit-hash>
git push origin main
```

---

## 📝 Notas

- Vercel mantém histórico de deploys (pode fazer rollback pela UI)
- Railway mantém histórico de deploys (pode fazer rollback pela UI)
- Sempre manter `main` estável
- Usar branches para experimentação
