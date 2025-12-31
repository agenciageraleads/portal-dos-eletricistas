# 🚀 Deploy via Docker Hub + VPS

Este guia descreve o fluxo de deploy utilizando imagens Docker hospedadas no Docker Hub e rodando em uma VPS com Docker Compose.

## Pré-requisitos
- [ ] Acesso SSH à VPS
- [ ] Docker e Docker Compose instalados na VPS
- [ ] Conta no Docker Hub com acesso ao repositório `lucasborgessb/portal_dos_eletricistas`

---

## 1️⃣ Build & Push (Máquina Local)

Gere as novas versões das imagens e envie para o Docker Hub.

```bash
# Login no Docker Hub (se necessário)
docker login

# Build e Push das imagens (Web e API)
# Certifique-se de estar na raiz do projeto
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml push
```

## 2️⃣ Deploy na VPS

Acesse sua VPS e atualize os serviços.

1.  **Acesse via SSH**:
    ```bash
    ssh usuario@ip-da-sua-vps
    ```

2.  **Navegue até a pasta do projeto** (ex: `/app` ou `~/portal`):
    ```bash
    cd /caminho/do/projeto
    ```

3.  **Atualize as imagens e reinicie**:
    ```bash
    # Baixar novas imagens
    docker-compose -f docker-compose.prod.yml pull

    # Recriar os containers (apenas os que mudaram)
    docker-compose -f docker-compose.prod.yml up -d
    ```

4.  **Limpeza (Opcional)**:
    Remova imagens antigas para liberar espaço:
    ```bash
    docker image prune -f
    ```

## 3️⃣ Tarefas Pós-Deploy



### Verificar Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f --tail=50
```

---

## � Troubleshooting

- **Erro de Permissão (Docker)**: Use `sudo` antes dos comandos `docker` se o usuário não estiver no grupo docker.
- **Banco de Dados**: Se houver migrações pendentes, o container da API tenta rodá-las no início. Verifique os logs da API.
