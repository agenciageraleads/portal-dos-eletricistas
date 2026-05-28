# ✅ Checklist Pós-Deploy (v1.7.0)

## Validação Imediata (1-2 minutos após deploy)

- [ ] **Frontend** - Acessar https://app.portaleletricos.com.br
  - [ ] Página carrega sem erros
  - [ ] Cores azul #2563eb visíveis
  - [ ] Barra inferior com 5 abas: Orçamentos, Serviços, HOME, Ferramentas, Perfil

- [ ] **API Health Check**
  ```bash
  curl https://api.portaleletricos.com.br/health
  # Esperado: 200 OK
  ```

- [ ] **Docker Services**
  ```bash
  docker service ls | grep portaleletricos
  # Esperado: web 1/1, api 1/1, db 1/1
  ```

## Testes Funcionais (5-10 minutos após deploy)

### 1. Feed Social
- [ ] Acessar HOME (botão Raio central)
- [ ] Feed de obras carrega com imagens
- [ ] Consegue dar like (duplo clique)
- [ ] Pílulas de filtro (Explorar Obras / Colegas) funcionam

### 2. Check-in QR Code
- [ ] Acessar https://app.portaleletricos.com.br/evento/sabado-eletricistas-2026/checkin
- [ ] Página carrega corretamente
- [ ] Formulário de check-in visível

### 3. Navegação
- [ ] Orçamentos → lista de orçamentos
- [ ] Serviços → Mural de Vagas
- [ ] HOME → Feed Social
- [ ] Ferramentas → Calculadoras
- [ ] Perfil → Perfil do usuário

### 4. Responsividade Mobile
- [ ] Teste no celular ou DevTools (F12, toggle device)
- [ ] Layout se ajusta para telas pequenas
- [ ] Barra inferior sempre visível
- [ ] Touch de botões funciona bem

## Monitoramento (10-30 minutos após deploy)

- [ ] **Logs da API**
  ```bash
  docker service logs portaleletricos_api --tail 100
  # ✅ Esperado: Sem erros de Prisma
  # ✅ Esperado: NestFactory iniciada
  ```

- [ ] **Logs do Frontend**
  ```bash
  docker service logs portaleletricos_web --tail 50
  # ✅ Esperado: Sem erros de compilação
  ```

- [ ] **Banco de Dados**
  ```bash
  docker exec portaleletricos_db.1.* psql -U portal -d portal_eletricistas \
    -c "SELECT COUNT(*) FROM _prisma_migrations;"
  # ✅ Esperado: 20 migrations
  ```

- [ ] **Uptime dos Serviços**
  ```bash
  docker service ps portaleletricos_web
  docker service ps portaleletricos_api
  # ✅ Esperado: Running, sem restarts frequentes
  ```

## Testes de Carga Leve (20-30 minutos após deploy)

- [ ] Abrir múltiplas abas do app
- [ ] Fazer scroll no feed
- [ ] Carregar diferentes seções
- [ ] Validar resposta da API (< 500ms)

## Segurança & Compliance

- [ ] HTTPS está ativo (cadeado 🔒 visível)
- [ ] Sem avisos de certificado
- [ ] Headers de segurança presentes
  ```bash
  curl -I https://app.portaleletricos.com.br | grep -i "x-frame\|x-content"
  ```

- [ ] Senhas/secrets não expostos nos logs
  ```bash
  docker service logs portaleletricos_api --tail 100 | grep -i "password\|secret\|key"
  # ✅ Esperado: Nenhum match
  ```

## Rollback (se algo der errado)

Se houver problema crítico:

```bash
# Reverter para versão anterior
docker service update \
  --image ghcr.io/agenciageraleads/portal-dos-eletricistas:web-1.6.0 \
  --force portaleletricos_web

docker service update \
  --image ghcr.io/agenciageraleads/portal-dos-eletricistas:api-1.6.0 \
  --force portaleletricos_api

# Validar rollback
docker service ps portaleletricos_web
docker service ps portaleletricos_api
```

## Notificação de Sucesso

- [ ] Enviar mensagem para Bruno (55 62 8257-4301) via Evolution
  ```bash
  curl -X POST http://5.161.247.240:3000/api/send/text \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $EVOLUTION_API_KEY" \
    -d '{
      "number": "5562982574301",
      "text": "Oi Bruno! Tudo certo com as novas alterações no Portal dos Eletricistas. Está tudo ao ar! 🚀⚡"
    }'
  ```

- [ ] Registrar deployment no histórico
  ```bash
  echo "$(date): Deployed v1.7.0 - OK" >> ~/deployment.log
  ```

---

## Observações Pós-Deploy

**Data**: 28/05/2026  
**Versão**: v1.7.0  
**Tempo Total de Deploy**: ~8-15 minutos  
**Status**: ✅ Online  

### Próximas Tarefas
- [ ] Monitorar app por 24h
- [ ] Coletar feedback dos eletricistas no sábado
- [ ] Planejar v1.8.0 com melhorias

---

**Checklist criado automaticamente em 28/05/2026**
