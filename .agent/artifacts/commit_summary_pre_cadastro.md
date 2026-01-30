# 🎯 COMMIT: Implementação de Pré-Cadastro de Eletricistas

## 📋 RESUMO

Sistema completo de pré-cadastro automático de eletricistas usando dados do Sankhya (VIEW VW_RANKING_TECNICOS) com integração de fotos do WhatsApp via Evolution API.

---

## ✨ FUNCIONALIDADES IMPLEMENTADAS

### 1. **Backend - Banco de Dados**
- ✅ Novos campos no modelo `User`:
  - Controle: `pre_cadastrado`, `cadastro_finalizado`, `registration_origin`, `activatedAt`
  - Métricas Sankhya: `sankhya_partner_id`, `sankhya_vendor_id`, `commercial_index`, `total_orders`, `total_revenue`, `average_ticket`, `sankhya_synced_at`

### 2. **Backend - Integração Sankhya**
- ✅ Query SQL otimizada da `VW_RANKING_TECNICOS` ordenada por `INDICE_COMERCIAL`
- ✅ Mapper completo: `ElectricianMapper` (Sankhya → Portal)
- ✅ Service: `SankhyaService.fetchTopElectricians(limit)`
- ✅ Telefone já vem padronizado (55XXXXXXXXXXX)

### 3. **Backend - Integração Evolution API (WhatsApp)**
- ✅ Service: `EvolutionService`
- ✅ Método: `getProfilePicture(phoneNumber)` - busca foto de perfil
- ✅ Método: `checkWhatsAppExists(phoneNumber)` - valida número
- ✅ Credenciais configuradas no `.env`

### 4. **Backend - Lógica de Sincronização**
- ✅ `ElectricianSyncService` com regras inteligentes:
  - ❌ Não sobrescreve cadastros finalizados
  - 🔄 Atualiza apenas métricas backend em pré-cadastros
  - ✅ Marca como disponível se tiver WhatsApp
  - 📸 Download e upload automático de fotos do WhatsApp para S3/MinIO
- ✅ Endpoint: `POST /admin/sync/electricians?limit=50&photos=true`

### 5. **Frontend - Registro**
- ✅ Fluxo em 2 passos (CPF → Dados completos)
- ✅ Pré-preenchimento automático para pré-cadastrados
- ✅ Mensagem de boas-vindas personalizada
- ✅ Endpoint: `GET /auth/check-registration/:cpf`

### 6. **Frontend - Listagem de Profissionais**
- ✅ Badge "Aguardando Ativação" para pré-cadastrados
- ✅ Indicador visual (bolinha verde/cinza)
- ✅ Botão desabilitado para pré-cadastrados
- ✅ Contador dinâmico: "+ de X eletricistas cadastrados"
- ✅ Ordenação: Finalizados primeiro, depois pré-cadastrados

### 7. **Feature Flags**
- ✅ `FEATURE_PRE_REG_DISABLED` - oculta pré-cadastros se necessário

---

## 📁 ARQUIVOS CRIADOS

### Backend
```
apps/api/src/
├── integrations/
│   ├── evolution/
│   │   ├── evolution.module.ts
│   │   ├── evolution.service.ts
│   │   └── dto/evolution-response.dto.ts
│   └── sankhya/
│       ├── dto/sankhya-electrician.dto.ts
│       └── mappers/electrician.mapper.ts
├── sync/
│   └── electrician-sync.service.ts
└── scripts/
    ├── test-pre-registration.ts
    └── sync-electricians.sh
```

### Frontend
- Modificado: `app/(auth)/register/page.tsx`
- Modificado: `app/services/page.tsx`

### Configuração
- Modificado: `apps/api/prisma/schema.prisma`
- Modificado: `.env` (Evolution API)
- Modificado: `apps/api/.env` (Evolution API)

### Documentação
- Criado: `.agent/artifacts/plano_pre_cadastro_eletricistas.md`

---

## 🚀 COMO USAR (APÓS DEPLOY)

### 1. Sincronizar Eletricistas
```bash
# Com fotos do WhatsApp (padrão)
curl -X POST https://api.portaldoseletricistas.com/admin/sync/electricians?limit=50

# Sem fotos (mais rápido)
curl -X POST https://api.portaldoseletricistas.com/admin/sync/electricians?limit=50&photos=false

# Usando o script
./apps/api/scripts/sync-electricians.sh 100
```

### 2. Testar Integração
```bash
# Testar conexão Sankhya
curl https://api.portaldoseletricistas.com/admin/sync/test

# Verificar status
curl https://api.portaldoseletricistas.com/admin/sync/status
```

---

## 🔐 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```bash
# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://evolutionapi.gera-leads.com
EVOLUTION_API_KEY=cb988b940da16208625675ba7be69465
EVOLUTION_INSTANCE_NAME=WhatsAppPortal

# Feature Flags (opcional)
FEATURE_PRE_REG_DISABLED=false
```

---

## 📊 CAMPOS MAPEADOS

| Campo Sankhya | Campo Portal | Visível | Editável |
|---------------|--------------|---------|----------|
| NOME_PARCEIRO | name | ✅ Sim | ✅ Sim |
| CPF | cpf_cnpj | ✅ Sim | ❌ Não* |
| TELEFONE_WHATSAPP | phone | ✅ Sim | ✅ Sim |
| CIDADE | city | ✅ Sim | ✅ Sim |
| ESTADO | state | ✅ Sim | ✅ Sim |
| CODPARC | sankhya_partner_id | ❌ Não | ❌ Não |
| INDICE_COMERCIAL | commercial_index | ❌ Não | ❌ Não |

*CPF visível mas não editável (exceto se quiser adicionar CNPJ - campo futuro)

---

## ✅ CHECKLIST PRÉ-DEPLOY

- [x] Schema do banco atualizado
- [x] Prisma Client regenerado
- [x] Variáveis de ambiente configuradas
- [x] Integração Sankhya testada
- [x] Integração Evolution API configurada
- [x] Frontend atualizado
- [x] Documentação completa
- [ ] Build sem erros
- [ ] Testes no servidor

---

## 🎯 PRÓXIMOS PASSOS (PÓS-DEPLOY)

1. **Rodar sincronização inicial**
   ```bash
   curl -X POST https://api.portaldoseletricistas.com/admin/sync/electricians?limit=100
   ```

2. **Verificar no banco**
   - Conferir se pré-cadastros foram criados
   - Validar fotos do WhatsApp
   - Checar métricas do Sankhya

3. **Testar no frontend**
   - Acessar `/services` e ver eletricistas
   - Tentar registrar com CPF pré-cadastrado
   - Validar badges e indicadores visuais

4. **Monitorar logs**
   - Verificar erros de integração
   - Acompanhar taxa de sucesso de fotos

---

## 🐛 TROUBLESHOOTING

### Erro na sincronização
```bash
# Verificar logs da API
pm2 logs api

# Testar conexão Sankhya
curl https://api.portaldoseletricistas.com/admin/sync/test
```

### Fotos não aparecem
- Verificar credenciais Evolution API no `.env`
- Validar permissões S3/MinIO
- Conferir se telefones estão no formato correto (55XXXXXXXXXXX)

### Pré-cadastros não aparecem
- Verificar `FEATURE_PRE_REG_DISABLED` no `.env`
- Conferir se `pre_cadastrado=true` e `cadastro_finalizado=false` no banco

---

**Commit Type**: `feat`  
**Breaking Changes**: Não  
**Requer Migration**: Sim (Prisma schema)  
**Requer Restart**: Sim (novas variáveis de ambiente)
