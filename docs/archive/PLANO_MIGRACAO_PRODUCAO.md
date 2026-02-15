# 🚀 Plano de Ação: Migração para Produção (Portal dos Eletricistas)

Este documento descreve os passos necessários para levar a aplicação do ambiente de Staging para Produção, utilizando a infraestrutura validada (GitHub Container Registry + Docker Swarm + Portainer).

## 1. Preparação da Infraestrutura (VPS)

* [ ] **Verificar Domínio**: Garantir que `app.portaleletricos.com.br` (e `api.portaleletricos.com.br`) estejam apontando para o IP da VPS de Produção.
* [ ] **Autenticação GHCR**: Executar login no GitHub Container Registry na VPS de produção (assim como fizemos na staging) para permitir o pull das imagens privadas.

    ```bash
    echo $CR_PAT | docker login ghcr.io -u SEU_USUARIO --password-stdin
    ```

* [ ] **Segurança**: Garantir que as variáveis de ambiente de produção (`.env.prod`) estejam seguras e definidas (seja no Portainer ou em arquivo `.env` na VPS).

## 2. Configuração do CI/CD (GitHub Actions)

Vamos replicar o sucesso do workflow de staging, mas voltado para a branch `main`.

* [ ] **Criar Workflow de Produção** (`.github/workflows/deploy-prod.yml`):
  * **Trigger**: Push na branch `main`.
  * **Imagens**: Tags `ghcr.io/...:web-prod` e `ghcr.io/...:api-prod`.
  * **Build Args**: Definir `NEXT_PUBLIC_API_URL` para a URL de produção.
  * **Delay**: Manter o `sleep 30` antes dos webhooks para garantir propagação no registry.
  * **Webhooks**: Configurar novos Webhooks no Portainer específicos para o stack de produção.

## 3. Configuração dos Containers (Docker Compose)

* [ ] **Criar `docker-compose.prod.yml`**:
  * Baseado no `docker-compose.staging.yml` validado.
  * **Serviços**: Renomear para `api-prod`, `web-prod`, `db-prod`.
  * **Traefik**: Ajustar labels para o domínio oficial (`Host(`portaleletricos.com.br`)`).
  * **Reinício**: Garantir `restart: always` ou `reservations` adequados para produção.
  * **Healthchecks**: Manter os healthchecks rigorosos que criamos.

## 4. Banco de Dados e Migrações

* [ ] **Backup Preventivo**: Se já houver banco de produção, realizar dump completo antes de qualquer deploy.
* [ ] **Migração de Schema**: O container da API já possui o script de entrada (`start.sh`) que executa `npx prisma migrate deploy`. Isso garante que o banco produtivo seja atualizado automaticamente ao subir a nova versão.

## 5. Execução da Migração (Passo a Passo)

1. **Merge para Main**: Realizar o merge da branch `dev` (estável) para `main`.
2. **Disparo do CI/CD**: O GitHub Actions iniciará o build das imagens de produção.
3. **Validação de Build**: Confirmar que as imagens `prod` foram enviadas para o GHCR.
4. **Deploy Inicial**:
    * Transferir `docker-compose.prod.yml` para a VPS.
    * Executar `docker stack deploy -c docker-compose.prod.yml portal-eletricistas-prod --with-registry-auth`.
5. **Configuração de Webhooks**: Pegar as URLs de webhook no Portainer (para API e Web de produção) e atualizar no arquivo de workflow do GitHub.
6. **Teste de Fumaça (Smoke Test)**:
    * Verificar logs da API (`docker service logs ...`).
    * Testar login e carregamento da home em produção.

## 6. Plano de Rollback (Se der ruim)

* **Reverter Imagem**: No Portainer, podemos forçar o serviço a voltar para a tag anterior (ou sha específico) em segundos.
* **Banco de Dados**: Em caso de corrupção de dados crítica, restaurar o dump SQL realizado no passo 4.

---

### Diferenças Chave Staging vs Produção

| Recurso | Staging | Produção |
| :--- | :--- | :--- |
| **Branch** | `dev` | `main` |
| **URL Web** | `beta.portaleletricos.com.br` | `app.portaleletricos.com.br` |
| **Tag Imagem** | `:api-staging` | `:api-prod` |
| **Réplicas** | 1 (economia) | 2+ (alta disponibilidade - opcional) |
| **Logs** | Debug/Verbose | Error/Warn |
