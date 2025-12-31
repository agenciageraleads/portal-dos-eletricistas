# Changelog

Todos as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-31
### Melhora
- **Busca Inteligente**: Suporte a sinônimos (Fio=Cabo, Disjuntor=Breaker) e normalização de medidas (2.5mm = 2,5).
- **Orçamento**: Input de quantidade editável e campo de descrição de mão de obra.
- **Micro-Dashboard**: Exibição de totais e ticket médio na lista de orçamentos.
- **Feedback de Busca**: Botão "Não encontrei" para reportar falhas na busca.

### Correções
- **UX**: Remoção do ícone de bandeira nos cards.
- **PDF**: Correção de URLs de imagem para geração do PDF.

## [1.0.0] - 2025-12-31
### Adicionado
- **Onboarding Experience**: Modal de boas-vindas para novos usuários com 4 passos (Boas-vindas, Recursos, Roadmap, Feedback).
- **Admin Role**: Funcionalidade de Admin consolidada.
- **Deploy**: Fluxo de deploy via Docker Hub + VPS documentado e validado.

### Alterado
- Atualização de dependências e scripts de build para suportar o novo fluxo de deploy.

---
*Versão Inicial Estável*
