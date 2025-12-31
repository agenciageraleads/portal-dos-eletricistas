# Configuração de Volume no Railway para Imagens

## Por que precisamos disso?

As imagens dos produtos são baixadas para `/web/public/products` no container do Railway.
Quando há um redeploy, o container é recriado e as imagens são perdidas.
Um **Volume** cria um disco permanente que sobrevive a redeploys.

---

## Passo a Passo

### 1. Criar o Volume no Railway

1. Vá no Railway → Projeto → Serviço `portal-api`
2. Clique na aba **"Settings"**
3. Role até **"Volumes"**
4. Clique em **"+ New Volume"**
5. Configure:
   - **Mount Path:** `/app/web/public/products`
   - **Size:** 5 GB (ajuste conforme necessário)
6. Clique em **"Add"**

### 2. Redeploy

Após criar o volume, o Railway vai fazer um redeploy automático.

### 3. Sincronizar Produtos

Depois que o redeploy terminar, dispare a sincronização:

```bash
curl -X POST "https://portal-api-production-c2c9.up.railway.app/admin/sync/products"
```

As imagens serão baixadas e salvas no volume permanente.

---

## Verificação

Para verificar se funcionou:

1. Acesse o site e veja se as imagens aparecem
2. Faça um redeploy manual no Railway
3. Após o redeploy, as imagens devem continuar aparecendo (não precisam ser baixadas de novo)

---

## Custos

- **Railway Volumes:** $0.25/GB por mês
- **Exemplo:** 5GB = $1.25/mês
- **Estimativa:** ~1000 produtos com imagens = ~2-3GB

---

## Alternativas

Se preferir não pagar pelo volume, pode usar:

1. **Cloudinary** (grátis até 25GB)
2. **Servir direto da Sankhya** (sem custo, mas pesa a API Sankhya)

---

## Troubleshooting

**Imagens não aparecem após criar o volume:**
- Verifique se o Mount Path está correto: `/app/web/public/products`
- Rode a sincronização novamente
- Verifique os logs do Railway para erros

**Volume cheio:**
- Aumente o tamanho do volume nas Settings
- Ou implemente limpeza automática de imagens antigas
