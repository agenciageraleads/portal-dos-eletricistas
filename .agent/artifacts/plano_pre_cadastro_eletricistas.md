# 🎯 PLANO DE IMPLEMENTAÇÃO: PRÉ-CADASTRO DE ELETRICISTAS

## 📊 RESUMO EXECUTIVO

Sistema de pré-cadastro automático de eletricistas usando dados do Sankhya (VIEW VW_RANKING_TECNICOS) com integração opcional de fotos do WhatsApp via Evolution API.

---

## ✅ FASE 1: ESTRUTURA BASE (CONCLUÍDA)

### 1.1 Schema do Banco de Dados

- ✅ Adicionados campos ao modelo `User`:
  - `pre_cadastrado` (Boolean)
  - `cadastro_finalizado` (Boolean)
  - `registration_origin` (String)
  - `activatedAt` (DateTime)
  - `sankhya_partner_id` (Int)
  - `sankhya_vendor_id` (Int)
  - `commercial_index` (Decimal)
  - `total_orders` (Int)
  - `total_revenue` (Decimal)
  - `average_ticket` (Decimal)
  - `sankhya_synced_at` (DateTime)

### 1.2 Integração Sankhya

- ✅ DTO: `SankhyaElectrician`
- ✅ Mapper: `ElectricianMapper`
- ✅ Service: `SankhyaService.fetchTopElectricians(limit)`
- ✅ Query SQL otimizada com ordenação por `INDICE_COMERCIAL`

### 1.3 Integração Evolution API

- ✅ Service: `EvolutionService`
- ✅ Método: `getProfilePicture(phoneNumber)`
- ✅ Método: `checkWhatsAppExists(phoneNumber)`
- ✅ Configuração: `.env` com credenciais

### 1.4 Lógica de Sincronização

- ✅ Service: `ElectricianSyncService`
- ✅ Regra: Não sobrescreve usuários que já finalizaram cadastro
- ✅ Regra: Atualiza apenas dados backend em pré-cadastros existentes
- ✅ Regra: Marca como disponível automaticamente se tiver WhatsApp

---

## 🔄 FASE 2: FLUXO DE SINCRONIZAÇÃO

### 2.1 Endpoint de Sincronização

```
POST /admin/sync/electricians?limit=50
```

**Fluxo:**

1. Busca top N eletricistas da VIEW (ordenado por contribuição)
2. Para cada eletricista:
   - Verifica se CPF já existe
   - Se não existe → cria pré-cadastro
   - Se existe como pré-cadastro → atualiza métricas backend
   - Se já finalizou cadastro → PULA (não sobrescreve)
3. [FUTURO] Busca foto do WhatsApp via Evolution API
4. Marca `isAvailableForWork = true` se tiver telefone

### 2.2 Campos Mapeados

**Visíveis/Editáveis pelo Usuário:**

- `name` ← `NOME_PARCEIRO`
- `city` ← `CIDADE`
- `state` ← `ESTADO`
- `phone` ← `TELEFONE_WHATSAPP` (já vem padronizado: 55XXXXXXXXXXX)

**Backend (Não editáveis):**

- `cpf_cnpj` ← `CPF`
- `sankhya_partner_id` ← `CODPARC`
- `sankhya_vendor_id` ← `CODVENDTEC`
- `commercial_index` ← `INDICE_COMERCIAL`
- `total_orders` ← `QTD_PEDIDOS_1100`
- `total_revenue` ← `VLR_TOTAL_1100`
- `average_ticket` ← `TICKET_MEDIO`

---

## 🎨 FASE 3: INTERFACE (CONCLUÍDA)

### 3.1 Página de Registro

- ✅ Fluxo de 2 passos (CPF → Dados completos)
- ✅ Pré-preenchimento automático para pré-cadastrados
- ✅ Mensagem de boas-vindas personalizada

### 3.2 Listagem de Profissionais

- ✅ Badge "Aguardando Ativação" para pré-cadastrados
- ✅ Indicador visual (bolinha cinza vs verde)
- ✅ Botão desabilitado para pré-cadastrados
- ✅ Contador dinâmico de eletricistas cadastrados
- ✅ Ordenação: Finalizados primeiro, depois pré-cadastrados

### 3.3 Feature Flag

- ✅ `FEATURE_PRE_REG_DISABLED` para ocultar pré-cadastros se necessário

---

## 🚀 FASE 4: PRÓXIMOS PASSOS

### 4.1 Integração de Fotos (PENDENTE)

```typescript
// Em ElectricianSyncService
async syncWithWhatsAppPhotos() {
  for (const electrician of electricians) {
    if (electrician.phone) {
      const photoUrl = await evolutionService.getProfilePicture(electrician.phone);
      if (photoUrl) {
        // Download da foto
        // Upload para S3/MinIO
        // Atualizar logo_url no banco
      }
    }
  }
}
```

### 4.2 Script de Importação Única

```bash
# Rodar apenas UMA VEZ para popular banco inicial
curl -X POST http://localhost:3333/admin/sync/electricians?limit=100
```

### 4.3 Monitoramento

- Log detalhado de cada importação
- Métricas: criados, atualizados, pulados, erros
- Dashboard admin para visualizar status

---

## 📋 CHECKLIST DE TESTES

### Backend

- [ ] Testar conexão com Sankhya
- [ ] Testar busca da VIEW VW_RANKING_TECNICOS
- [ ] Testar criação de pré-cadastro
- [ ] Testar atualização de pré-cadastro existente
- [ ] Testar que não sobrescreve cadastros finalizados
- [ ] Testar conexão com Evolution API
- [ ] Testar busca de foto de perfil

### Frontend

- [ ] Testar registro com CPF novo
- [ ] Testar registro com CPF pré-cadastrado
- [ ] Testar que pré-cadastrados aparecem na listagem
- [ ] Testar que botão está desabilitado para pré-cadastrados
- [ ] Testar contador de eletricistas
- [ ] Testar ordenação (finalizados primeiro)

### Integração

- [ ] Testar fluxo completo: Sankhya → Banco → Frontend
- [ ] Testar ativação de pré-cadastro via registro
- [ ] Testar que após ativação, usuário consegue logar
- [ ] Testar que métricas backend são preservadas

---

## 🔐 SEGURANÇA

- ✅ Senhas temporárias aleatórias para pré-cadastros
- ✅ Email temporário único baseado em CPF
- ✅ Validação de CPF antes de criar usuário
- ✅ Bloqueio de login para pré-cadastrados não finalizados
- ✅ API Key da Evolution em variável de ambiente

---

## 📊 MÉTRICAS DE SUCESSO

1. **Prova Social**: Aumentar número visível de eletricistas
2. **Conversão**: % de pré-cadastrados que ativam conta
3. **Qualidade**: Top contribuidores aparecem primeiro
4. **Engajamento**: Tempo médio para ativação
5. **Retenção**: Usuários ativos após 30 dias

---

## 🛠️ COMANDOS ÚTEIS

```bash
# Sincronizar eletricistas (manual)
curl -X POST http://localhost:3333/admin/sync/electricians?limit=50

# Testar conexão Sankhya
curl http://localhost:3333/admin/sync/test

# Verificar status
curl http://localhost:3333/admin/sync/status

# Regenerar Prisma Client
npx prisma generate --schema=apps/api/prisma/schema.prisma

# Sincronizar banco
npx prisma db push --schema=apps/api/prisma/schema.prisma
```

---

## 📝 NOTAS IMPORTANTES

1. **Executar apenas UMA VEZ**: A sincronização inicial deve rodar uma única vez
2. **Não sobrescreve**: Usuários que já finalizaram cadastro nunca são alterados
3. **Telefone padronizado**: Já vem no formato 55XXXXXXXXXXX da VIEW
4. **Feature Flag**: Use `FEATURE_PRE_REG_DISABLED=true` para ocultar pré-cadastros
5. **Evolution API**: Opcional - sistema funciona sem fotos do WhatsApp

---

**Status**: ✅ Implementação base completa  
**Próximo passo**: Testar sincronização e integração de fotos  
**Data**: 2026-01-30
