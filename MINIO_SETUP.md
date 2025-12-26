# Configuração MinIO/S3 para Railway

## Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no Railway para habilitar o armazenamento de imagens no MinIO:

```bash
S3_ENDPOINT=https://s3.gera-leads.com
S3_BUCKET=portal-produtos
S3_ACCESS_KEY=admin
S3_SECRET_KEY=Lucas132395
S3_REGION=us-east-1
```

## Como Adicionar no Railway

1. Vá no Railway → Projeto → Serviço `portal-api`
2. Clique na aba **"Variables"**
3. Adicione cada variável acima
4. Clique em **"Deploy"** (vai fazer redeploy automático)

## Verificação

Após o redeploy, verifique os logs:
- Deve aparecer: `S3/MinIO configurado: https://s3.gera-leads.com/portal-produtos`
- Deve aparecer: `S3/MinIO habilitado para armazenamento de imagens`

## Sincronização de Produtos

Depois que o deploy terminar, dispare a sincronização:

```bash
curl -X POST "https://portal-api-production-c2c9.up.railway.app/admin/sync/products"
```

As imagens serão:
1. Baixadas da API Sankhya
2. Processadas (redimensionadas para 800x800, convertidas para WebP)
3. Enviadas para o MinIO em `s3.gera-leads.com/portal-produtos/products/`
4. URLs públicas salvas no banco de dados

## Acesso Público

As imagens ficarão acessíveis em:
```
https://s3.gera-leads.com/portal-produtos/products/15744.webp
```

## Fallback

Se as variáveis S3 não estiverem configuradas, o sistema automaticamente usa armazenamento local (não persistente no Railway).

## Custos

- **MinIO na VPS:** Sem custo adicional (já está rodando)
- **Bandwidth:** Depende do uso, mas MinIO não cobra
- **Railway:** Apenas o custo normal do serviço

## Vantagens

✅ Imagens permanentes (não são perdidas em redeploys)
✅ Não pesa o servidor Railway
✅ Não pesa a API Sankhya (imagens baixadas 1x)
✅ Controle total (seu próprio MinIO)
✅ Sem custos adicionais
