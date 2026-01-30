# 🚀 GUIA DE DEPLOY E SINCRONIZAÇÃO - PRÉ-CADASTRO DE ELETRICISTAS

## 📋 CHECKLIST PRÉ-DEPLOY

- [x] Commits enviados para `dev`
- [x] Dockerfile atualizado com `prisma db push` no startup
- [x] Docker-compose com variáveis Evolution API
- [x] Limite padrão alterado para 297 eletricistas
- [ ] Build do GitHub Actions completo
- [ ] Redeploy via Portainer executado

---

## 🎯 APÓS O DEPLOY - PASSO A PASSO

### **1. Verificar se o Deploy Foi Bem-Sucedido**

```bash
# Testar health check
curl https://beta-api.portaleletricos.com.br/health

# Verificar logs do container
# No Portainer: Containers → api-staging → Logs
# Procurar por: "🔄 Syncing database schema..."
```

**Resultado esperado:**

```
🔄 Syncing database schema...
⚠️  Schema already synced
🔄 Running database migrations...
⚠️  No migrations to run
🚀 Starting application...
```

---

### **2. Testar Login (Validar Schema)**

Tente fazer login no frontend:

- URL: <https://beta.portaleletricos.com.br>
- Use suas credenciais normais

**✅ Se funcionar:** Schema foi sincronizado corretamente!  
**❌ Se der erro:** Verificar logs do container

---

### **3. Sincronizar os 297 Eletricistas**

```bash
# Sincronizar TODOS os 297 eletricistas com fotos do WhatsApp
curl -X POST https://beta-api.portaleletricos.com.br/admin/sync/electricians

# OU especificar quantidade diferente
curl -X POST "https://beta-api.portaleletricos.com.br/admin/sync/electricians?limit=100"

# OU sem fotos (mais rápido para teste)
curl -X POST "https://beta-api.portaleletricos.com.br/admin/sync/electricians?photos=false"
```

**Tempo estimado:**

- Sem fotos: ~30-60 segundos
- Com fotos (297): ~10-15 minutos (depende da Evolution API)

**Resultado esperado:**

```json
{
  "success": true,
  "duration": "XXXs",
  "created": 297,
  "updated": 0,
  "skipped": 0,
  "photosDownloaded": 250,
  "errors": 0
}
```

---

### **4. Verificar Resultado no Frontend**

1. **Acessar página de serviços:**
   - URL: <https://beta.portaleletricos.com.br/services>

2. **Verificar:**
   - ✅ Contador mostra "+ de 297 eletricistas cadastrados"
   - ✅ Eletricistas aparecem com fotos do WhatsApp
   - ✅ Badge "Aguardando Ativação" nos pré-cadastrados
   - ✅ Indicador visual (bolinha cinza) nos pré-cadastrados
   - ✅ Botão "Solicitar Orçamento" desabilitado para pré-cadastrados

---

### **5. Testar Fluxo de Registro**

1. **Acessar:** <https://beta.portaleletricos.com.br/register>

2. **Passo 1 - Inserir CPF de um eletricista pré-cadastrado**
   - Sistema deve reconhecer e mostrar mensagem de boas-vindas

3. **Passo 2 - Dados pré-preenchidos**
   - Nome, cidade, estado, telefone devem vir preenchidos
   - Permitir edição

4. **Finalizar cadastro**
   - Criar senha
   - Submeter formulário

5. **Verificar:**
   - ✅ Login funciona com as novas credenciais
   - ✅ Usuário agora aparece como "ativo" (bolinha verde)
   - ✅ Badge "Aguardando Ativação" removido
   - ✅ Botão "Solicitar Orçamento" habilitado

---

## 🔍 VALIDAÇÕES TÉCNICAS

### **Verificar no Banco de Dados**

```sql
-- Contar pré-cadastros
SELECT COUNT(*) FROM users 
WHERE pre_cadastrado = true 
AND cadastro_finalizado = false;
-- Resultado esperado: ~297

-- Ver eletricistas com foto
SELECT name, logo_url, phone 
FROM users 
WHERE pre_cadastrado = true 
AND logo_url IS NOT NULL
LIMIT 10;

-- Ver métricas do Sankhya
SELECT name, commercial_index, total_orders, total_revenue 
FROM users 
WHERE sankhya_partner_id IS NOT NULL
ORDER BY commercial_index DESC
LIMIT 10;
```

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Valor Esperado |
|---------|----------------|
| Pré-cadastros criados | 297 |
| Fotos baixadas | ~250-280 (nem todos têm WhatsApp) |
| Erros | 0 |
| Tempo de sincronização | 10-15 min |
| Login funcionando | ✅ |
| Contador frontend | "+ de 297 eletricistas" |

---

## 🐛 TROUBLESHOOTING

### **Erro: "Column pre_cadastrado does not exist"**

```bash
# Acessar container
docker exec -it portal-api-staging sh

# Forçar sync do schema
npx prisma db push --accept-data-loss

# Reiniciar
exit
docker restart portal-api-staging
```

### **Fotos não aparecem**

- Verificar se `EVOLUTION_API_KEY` está configurada
- Verificar logs: procurar por "📸 Foto do WhatsApp salva"
- Testar Evolution API manualmente:

  ```bash
  curl -X POST https://evolutionapi.gera-leads.com/chat/fetchProfilePictureUrl/WhatsAppPortal \
    -H "apikey: cb988b940da16208625675ba7be69465" \
    -H "Content-Type: application/json" \
    -d '{"number": "5562982435286"}'
  ```

### **Sincronização muito lenta**

- Rodar sem fotos primeiro: `?photos=false`
- Depois rodar novamente com fotos (vai apenas atualizar)

---

## 🎉 RESULTADO FINAL ESPERADO

Após completar todos os passos:

1. ✅ **297 eletricistas pré-cadastrados** no banco
2. ✅ **~250-280 fotos do WhatsApp** baixadas e armazenadas no S3
3. ✅ **Frontend atualizado** com contador e badges
4. ✅ **Fluxo de registro** funcionando com pré-preenchimento
5. ✅ **Prova social** aumentada (de 0 para 297+ eletricistas visíveis)
6. ✅ **Top contribuidores** aparecem primeiro (ordenados por índice comercial)

---

## 📞 COMANDO FINAL

```bash
# Executar sincronização completa
curl -X POST https://beta-api.portaleletricos.com.br/admin/sync/electricians

# Acompanhar logs em tempo real (Portainer)
# Containers → api-staging → Logs → Auto-refresh ON
```

---

**Data:** 2026-01-30  
**Versão:** 1.0  
**Status:** ✅ Pronto para execução
