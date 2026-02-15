# Guia: Criar Usuário de Teste em Produção

## Opção 1: Manual (Recomendado)

1. Acesse: <https://app.portaleletricos.com.br/register>
2. Preencha o formulário com os seguintes dados:

**Etapa 1 - CPF:**

```
CPF: 748.813.601-24
```

**Etapa 2 - Dados Completos:**

```
Nome: Usuário de Teste E2E
Email: teste.e2e@portaleletricos.com.br
WhatsApp: (11) 99999-9999
Senha: Teste@E2E123
```

1. Marque o checkbox "Li e concordo com os Termos de Uso"
2. Clique em "Finalizar Cadastro"

## Opção 2: Via API (Se disponível)

Se houver um endpoint de criação de usuário, você pode usar:

```bash
curl -X POST https://app.portaleletricos.com.br/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "74881360124",
    "name": "Usuário de Teste E2E",
    "email": "teste.e2e@portaleletricos.com.br",
    "phone": "11999999999",
    "password": "Teste@E2E123"
  }'
```

## Opção 3: Direto no Banco (Acesso Admin)

Se você tiver acesso ao banco de dados de produção:

```sql
-- ATENÇÃO: Use com cuidado em produção!
INSERT INTO users (cpf, name, email, phone, password_hash, created_at, updated_at)
VALUES (
  '74881360124',
  'Usuário de Teste E2E',
  'teste.e2e@portaleletricos.com.br',
  '11999999999',
  -- Hash de 'Teste@E2E123' (você precisa gerar com bcrypt)
  '$2b$10$...',
  NOW(),
  NOW()
);
```

## Verificação

Após criar o usuário, teste o login:

```bash
TEST_URL=https://app.portaleletricos.com.br npx playwright test tests/e2e/03-login.spec.ts:72 --project=chromium
```

## Notas

- **Importante**: Este usuário é apenas para testes E2E. Não use em produção real.
- Se o email já estiver em uso, você pode tentar com outro timestamp ou deletar o usuário existente.
- Guarde essas credenciais em um local seguro (já estão em `tests/e2e/fixtures/test-user.ts`).
