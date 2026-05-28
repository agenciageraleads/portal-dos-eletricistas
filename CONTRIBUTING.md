# Guia de Contribuição 🤝

Bem-vindo ao projeto **Portal dos Eletricistas**! Este documento detalha como você (Humano ou IA) deve contribuir para manter a integridade e profissionalismo do workspace.

## 🚀 Setup Rápido

1. Instale as dependências: `npm install`.
2. Configure o banco de dados: `docker-compose up -d`.
3. Gere o cliente Prisma: `npx prisma generate` (em `apps/api`).
4. Rode em desenvolvimento: `npm run dev`.

## 🛠 Padrões de Código

### 1. Convencional Commits
Todas as mensagens de commit devem seguir o padrão:
- `feat:` Funcionalidade nova.
- `fix:` Correção de bug.
- `docs:` Alterações na documentação.
- `style:` Formatação, semicolons, etc (sem mudanças de lógica).
- `refactor:` Mudança no código que não corrige bug nem adiciona funcionalidade.
- `test:` Adição de testes.

### 2. Fluxo de Git (Git Flow)
1.  Crie uma branch a partir da `master` ou `main`: `feature/nome-da-feature` ou `fix/nome-do-bug`.
2.  Abra um Pull Request (PR) com o template preenchido.
3.  Aguarde o Code Review.

### 3. Checklist de IA
Se você é um agente de IA:
- [ ] Validou o build local antes de propor mudanças?
- [ ] Seguiu a regra de tipos estritos (No Any)?
- [ ] Comentou o código em PT/BR para o desenvolvedor principal?
- [ ] Atualizou o Swagger se mudou a API?

## 🧪 Qualidade
- **Lint:** Rode `npm run lint` antes de dar push.
- **Testes:** Novos componentes UI devem ter snapshots de teste. Novos endpoints de API devem ter testes de integração.

---
*Dúvidas? Consulte o `docs/guia_dev.md` para detalhes técnicos profundos.*
