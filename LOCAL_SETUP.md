# Guia de Configuração Local - Portal dos Eletricistas

Este guia fornece instruções passo a passo para configurar e executar o Portal dos Eletricistas localmente.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** ([Download](https://www.docker.com/get-started))
- **Git** ([Download](https://git-scm.com/downloads))

## 🚀 Configuração Inicial

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd portal-do-eletricista
```

### 2. Instale as Dependências

```bash
npm install
```

Este comando instalará as dependências de todos os workspaces (API e Web).

### 3. Configure o Banco de Dados

Inicie o PostgreSQL usando Docker:

```bash
docker-compose up -d
```

Verifique se o container está rodando:

```bash
docker ps
```

Você deve ver um container chamado `portal_db` rodando.

### 4. Configure as Variáveis de Ambiente

#### Backend (API)

Copie o arquivo de exemplo:

```bash
cp apps/api/.env.example apps/api/.env
```

O arquivo `.env` já vem com valores padrão para desenvolvimento local. **Não é necessário alterar nada** para rodar localmente.

**Variáveis importantes:**
- `DATABASE_URL`: Conexão com PostgreSQL (já configurada)
- `JWT_SECRET`: Chave para tokens JWT (já configurada)
- `PORT`: Porta do backend (3333)
- `FRONTEND_URL`: URL do frontend (http://localhost:3000)

#### Frontend (Web)

Copie o arquivo de exemplo:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

O arquivo `.env.local` já vem configurado para apontar para o backend local (`http://localhost:3333`).

### 5. Execute as Migrações do Banco de Dados

```bash
cd apps/api
npx prisma migrate dev
cd ../..
```

Isso criará todas as tabelas necessárias no banco de dados.

## ▶️ Executando a Aplicação

### Opção 1: Executar Tudo de Uma Vez (Recomendado)

```bash
npm run dev
```

Este comando inicia tanto o backend quanto o frontend simultaneamente usando Turbo.

### Opção 2: Executar Separadamente

**Backend (API):**
```bash
npm run dev:api
```

O backend estará disponível em: `http://localhost:3333`

**Frontend (Web):**
```bash
npm run dev:web
```

O frontend estará disponível em: `http://localhost:3000`

## ✅ Verificação de Saúde

Após iniciar a aplicação, você pode verificar se tudo está funcionando corretamente:

### Verificação Automática

Execute o script de verificação:

```bash
npm run verify:local
```

Este script verifica:
- ✅ PostgreSQL está rodando
- ✅ Backend está respondendo
- ✅ Frontend está respondendo
- ✅ Variáveis de ambiente estão configuradas

### Verificação Manual

**Health Check do Backend:**
```bash
curl http://localhost:3333/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy" },
    "environment": { "status": "healthy" }
  }
}
```

**Acessar o Frontend:**
Abra seu navegador em: `http://localhost:3000`

## 🛠 Comandos Úteis

### Banco de Dados

```bash
# Resetar o banco de dados (CUIDADO: apaga todos os dados)
npm run db:reset

# Executar migrações
npm run db:migrate

# Abrir Prisma Studio (interface visual do banco)
cd apps/api && npx prisma studio
```

### Desenvolvimento

```bash
# Executar tudo
npm run dev

# Executar apenas API
npm run dev:api

# Executar apenas Web
npm run dev:web

# Verificar saúde do sistema
npm run verify:local
```

## 🔍 Endpoints Disponíveis

### Backend (http://localhost:3333)

**Health Checks:**
- `GET /health` - Status geral do sistema
- `GET /health/db` - Status da conexão com banco de dados
- `GET /health/env` - Validação de variáveis de ambiente

**Autenticação:**
- `POST /auth/register` - Registrar novo eletricista
- `POST /auth/login` - Fazer login
- `GET /auth/me` - Obter usuário atual

**Produtos:**
- `GET /products` - Listar produtos (com busca e paginação)

**Orçamentos:**
- `POST /budgets` - Criar orçamento
- `GET /budgets` - Listar orçamentos do usuário
- `GET /budgets/:id` - Obter orçamento específico
- `PATCH /budgets/:id` - Atualizar orçamento

**Perfil:**
- `GET /users/profile` - Obter perfil do usuário
- `PATCH /users/profile` - Atualizar perfil
- `POST /users/upload-logo` - Upload de logo

## 🐛 Troubleshooting

### PostgreSQL não está rodando

**Problema:** `PostgreSQL NÃO está rodando`

**Solução:**
```bash
docker-compose up -d
```

### Backend não responde

**Problema:** `Backend NÃO está respondendo`

**Soluções:**
1. Verifique se as variáveis de ambiente estão configuradas:
   ```bash
   cat apps/api/.env
   ```

2. Verifique os logs do backend para erros

3. Certifique-se de que a porta 3333 não está em uso:
   ```bash
   lsof -i :3333
   ```

### Frontend não responde

**Problema:** `Frontend NÃO está respondendo`

**Soluções:**
1. Verifique se o arquivo `.env.local` existe:
   ```bash
   cat apps/web/.env.local
   ```

2. Certifique-se de que a porta 3000 não está em uso:
   ```bash
   lsof -i :3000
   ```

### Erro de conexão com banco de dados

**Problema:** Health check mostra `database: unhealthy`

**Soluções:**
1. Verifique se o PostgreSQL está rodando:
   ```bash
   docker ps | grep portal_db
   ```

2. Verifique a `DATABASE_URL` no `.env`:
   ```bash
   grep DATABASE_URL apps/api/.env
   ```

3. Tente reiniciar o container:
   ```bash
   docker-compose restart
   ```

### Erro "Missing environment variables"

**Problema:** Health check mostra variáveis faltando

**Solução:**
1. Copie novamente o `.env.example`:
   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

2. Reinicie o backend

## 📦 Estrutura do Projeto

```
portal-do-eletricista/
├── apps/
│   ├── api/          # Backend (NestJS)
│   │   ├── src/      # Código fonte
│   │   ├── prisma/   # Schema e migrações do banco
│   │   └── .env      # Variáveis de ambiente (não versionado)
│   └── web/          # Frontend (Next.js)
│       ├── app/      # Páginas e rotas
│       ├── src/      # Componentes e utilitários
│       └── .env.local # Variáveis de ambiente (não versionado)
├── scripts/          # Scripts utilitários
├── docker-compose.yml # Configuração do PostgreSQL
└── package.json      # Scripts raiz
```

## 🎯 Próximos Passos

Após configurar o ambiente local com sucesso:

1. **Teste o fluxo de registro:**
   - Acesse `http://localhost:3000/cadastro`
   - Crie uma conta de eletricista

2. **Teste o fluxo de login:**
   - Acesse `http://localhost:3000/login`
   - Faça login com suas credenciais

3. **Teste a criação de orçamento:**
   - Busque produtos
   - Adicione ao carrinho
   - Salve o orçamento

4. **Explore a documentação:**
   - Leia o [ROADMAP.md](./docs/ROADMAP.md) para entender o projeto
   - Veja o [planejamento.md](./docs/planejamento.md) para detalhes técnicos

## 📞 Suporte

Se encontrar problemas não listados aqui:

1. Execute `npm run verify:local` e compartilhe o output
2. Verifique os logs do backend e frontend
3. Consulte a documentação em `docs/`

---

**Desenvolvido com ❤️ em parceria com Antigravity AI**
