# Configurar Bucket MinIO como Público

## Problema

As imagens estão sendo enviadas para o MinIO, mas não estão acessíveis publicamente porque o bucket não tem política de acesso público configurada.

## Solução

### 1. Acessar MinIO Console

1. Acesse: `https://minio.gera-leads.com`
2. Login com:
   - Username: `admin`
   - Password: `Lucas132395`

### 2. Configurar Política do Bucket

1. No menu lateral, clique em **"Buckets"**
2. Clique no bucket **"portal-produtos"**
3. Clique na aba **"Access"** ou **"Anonymous"**
4. Clique em **"Add Access Rule"** ou **"Set Policy"**
5. Configure:
   - **Prefix:** `products/*` (ou deixe vazio para todo o bucket)
   - **Access:** `readonly` ou `download`
6. Clique em **"Save"** ou **"Add"**

### 3. Verificar Acesso Público

Teste se as imagens estão acessíveis:

```bash
# Exemplo de URL pública
https://s3.gera-leads.com/portal-produtos/products/15744.webp
```

Abra essa URL no navegador. Se aparecer a imagem, está funcionando!

### 4. Política JSON (Alternativa)

Se preferir configurar via JSON, use esta política:

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

### 5. Após Configurar

1. **Limpe o banco de dados** (opcional, se quiser reprocessar):
   ```sql
   UPDATE "Product" SET image_url = NULL WHERE image_url IS NOT NULL;
   ```

2. **Rode a sincronização novamente:**
   ```bash
   curl -X POST "https://portal-api-production-c2c9.up.railway.app/admin/sync/products"
   ```

3. **Verifique se as imagens aparecem no site**

---

## Troubleshooting

**Imagens ainda não aparecem:**
- Verifique se a política foi salva corretamente
- Teste a URL diretamente no navegador
- Verifique os logs do Railway para erros

**Erro 403 Forbidden:**
- A política do bucket não está configurada corretamente
- Refaça os passos 2 e 3

**Erro 404 Not Found:**
- A imagem não existe no MinIO
- Verifique se a sincronização completou
- Verifique o nome do arquivo no MinIO
