# Configuração MinIO/S3

Este documento consolida a configuração do armazenamento MinIO S3 para o Portal dos Eletricistas.

---

## 📋 Variáveis de Ambiente

Configurar as seguintes variáveis no ambiente de produção:

```bash
S3_ENDPOINT=https://s3.gera-leads.com
S3_BUCKET=portal-produtos
S3_ACCESS_KEY=admin
S3_SECRET_KEY=Lucas132395
S3_REGION=us-east-1
```

---

## 🚀 Como Configurar

### 1. Adicionar Variáveis no Ambiente

No seu ambiente de deploy (Railway, VPS, etc.):
1. Adicione cada variável de ambiente listada acima
2. Faça redeploy da aplicação

### 2. Verificar Logs

Após o deploy, verifique os logs da aplicação:
- ✅ Deve aparecer: `S3/MinIO configurado: https://s3.gera-leads.com/portal-produtos`
- ✅ Deve aparecer: `S3/MinIO habilitado para armazenamento de imagens`

---

## 🔓 Configurar Bucket como Público

Para permitir acesso público às imagens:

### Opção 1: Via Console MinIO

1. Acesse: `https://minio.gera-leads.com`
2. Login:
   - Username: `admin`
   - Password: `Lucas132395`
3. Menu lateral → **"Buckets"**
4. Clique no bucket **"portal-produtos"**
5. Aba **"Access"** ou **"Anonymous"**
6. Clique em **"Add Access Rule"**
7. Configure:
   - **Prefix:** `products/*`
   - **Access:** `readonly`
8. Salvar

### Opção 2: Via Política JSON

Use esta política no bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::portal-produtos/products/*"]
    }
  ]
}
```

---

## 🔄 Sincronização de Produtos

Após configurar, execute a sincronização de produtos:

```bash
curl -X POST "https://api.portaleletricos.com.br/admin/sync/products"
```

O processo:
1. ⬇️ Baixa imagens da API Sankhya
2. 🔧 Redimensiona para 800x800 e converte para WebP
3. ⬆️ Envia para MinIO em `portal-produtos/products/`
4. 💾 Salva URLs públicas no banco de dados

---

## 🌐 Acesso Público

As imagens ficam acessíveis em:
```
https://s3.gera-leads.com/portal-produtos/products/{codigo_produto}.webp
```

Exemplo:
```
https://s3.gera-leads.com/portal-produtos/products/15744.webp
```

---

## ⚙️ Fallback

Se as variáveis S3 não estiverem configuradas, o sistema usa armazenamento local (não persistente em ambientes efêmeros como Railway).

---

## 🛠 Troubleshooting

### Imagens não aparecem
- ✅ Verifique se a política do bucket está configurada
- ✅ Teste a URL diretamente no navegador
- ✅ Verifique os logs da aplicação

### Erro 403 Forbidden
- ❌ Política do bucket não está configurada corretamente
- 🔧 Refaça a configuração de acesso público

### Erro 404 Not Found
- ❌ A imagem não existe no MinIO
- 🔧 Execute a sincronização de produtos novamente

---

## ✅ Vantagens

- 🎯 **Persistência:** Imagens permanentes (não perdidas em redeploys)
- 🚀 **Performance:** Não sobrecarrega o servidor da aplicação
- 💰 **Economia:** Não pesa a API Sankhya (download único)
- 🔐 **Controle:** Servidor próprio, sem custos adicionais
