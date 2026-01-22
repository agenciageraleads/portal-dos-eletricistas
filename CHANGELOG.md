# Changelog

Todos as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.1] - 2026-01-21

### Added

- **Admin**: Novo painel de Feedbacks (`/admin/feedbacks`) com listagem de sugestões.
- **Orçamento**: Refatoração dos modos "Produtos + Mão de Obra" e "Apenas Mão de Obra".
  - Modo Mão de Obra agora permite adicionar serviços à lista.
  - Modo Produtos oculta botão "Adicionar Serviço".

## [1.5.0] - 2026-01-14

### Added

- **Orçamento Inteligente**: Nova funcionalidade que permite gerar orçamentos a partir de listas de texto ou imagens (fotos de listas) usando IA (GPT-4o-mini).
- **Importação de Arquivo**: Suporte para upload de imagens no modal de orçamento.
- **Engine de Busca**: Novo motor de correspondência (Matching Engine) para identificar produtos por código, nome e marca automaticamente.

## [1.4.10] - 2026-01-13

### Changed

- **PDF**: Layout melhorado para exibir Condições Comerciais (Prazo, Pagamento, Validade, Garantia) em grade estruturada.

## [1.4.9] - 2026-01-13

### Fixed

- **Sync Timeout**: Aumentado timeout do cliente Sankhya para 120s para suportar queries lentas em produção.

## [1.4.8] - 2026-01-12

### Fixed

- **Sync Robustness**: Corrigida a falha `ORA-00904` removendo a coluna `ENDIMAGEM` da query principal do Sankhya.
- **Data Mapping**: Ajuste no `ProductMapper` para alinhar com a nova estrutura da query, resolvendo o bug onde categorias apareciam como IDs numéricos.
- **Sorting**: Produtos agora são ordenados corretamente pelo `INDICE_POPULARIDADE`.
- **Category Filter**: Filtros de categoria na Home/Catálogo agora funcionam corretamente.

## [1.4.1] - 2026-01-05

### Added

- **Home UI Redesign:** Substituídos os cards grandes por um grid de botões estilo App para melhor navegação.
- **Budget PDF:** Adicionados campos de Logo, Fotos do Produto, Descrição do Serviço e Notas (Garantia/Condições).
- **Labor Budget:** Agora é possível salvar orçamentos simplificados contendo apenas valor de Mão de Obra (sem produtos).

### Fixed

- **Tutorial:** Corrigido bug onde o tour iniciava antes do modal fechar (adicionado delay).
- **Reordering:** Atalho "Ferramentas" movido para antes dos itens "Em Breve".

## [1.3.0] - 2026-01-02

### Adicionado

- **Calculadoras Embutidas**: Nova página `/ferramentas` com calculadoras de Bitola de Cabo (NBR 5410) e Dimensionamento de Disjuntor.
- **Especificações Técnicas**: Exibição de Amperagem, Curva, Tensão e Bitola diretamente nos cards de produto (`ProductCard`).
- **Observações do Orçamento**: Novos campos estruturados para Prazo de Execução, Validade, Garantia e Condições de Pagamento.
- **Link Ferramentas**: Acesso rápido às ferramentas no header da aplicação.

### Melhora

- **Privacidade do Orçamento (Público)**: Lógica aprimorada na visualização pública (`/o/[id]`) para ocultar preços unitários e detalhamento de mão de obra quando configurado pelo eletricista.
- **Feedback Visual**: Badges coloridos para facilitar leitura de especificações técnicas.

### Correções

- **Staging**: Correção de CORS na API para permitir conexões do ambiente de staging (`beta.portaleletricos.com.br`), originalmente planejada para v1.2.1.

## [1.2.0] - 2025-12-31

### Adicionado

- **Visibilidade Admin**: Nova página para administradores visualizarem todos os orçamentos do sistema.
- **Customização de Marca**: Suporte para upload e exibição de logo da empresa nos PDFs de orçamento.
- **Privacidade do Orçamento**: Toggles para ocultar valores unitários e total de mão de obra para o cliente final.
- **Itens Manuais**: Possibilidade de adicionar produtos ou serviços fora do catálogo com foto e indicação de fonte.
- **Campos Detalhados**: Novos campos de notas internas e descrição detalhada de mão de obra no orçamento.

## [1.1.0] - 2025-12-31

### Melhora

- **Busca Inteligente**: Suporte a sinônimos (Fio=Cabo, Disjuntor=Breaker) e normalização de medidas (2.5mm = 2,5).
- **Orçamento**: Input de quantidade editável e campo de descrição de mão de obra.
- **Micro-Dashboard**: Exibição de totais e ticket médio na lista de orçamentos.
- **Feedback de Busca**: Botão "Não encontrei" para reportar falhas na busca.
- **LGPD**: Nova página `/termos` e checkbox de consentimento obrigatório no cadastro.
- **Segurança**: Hardening de credenciais e remoção de segredos hardcoded do docker-compose.

### Correções

- **UX**: Remoção do ícone de bandeira nos cards.
- **PDF**: Correção de URLs de imagem para geração do PDF.
- **Build**: Correção de dependência na página de Termos de Uso.

## [1.0.0] - 2025-12-31

### Adicionado

- **Onboarding Experience**: Modal de boas-vindas para novos usuários com 4 passos (Boas-vindas, Recursos, Roadmap, Feedback).
- **Admin Role**: Funcionalidade de Admin consolidada.
- **Deploy**: Fluxo de deploy via Docker Hub + VPS documentado e validado.

### Alterado

- Atualização de dependências e scripts de build para suportar o novo fluxo de deploy.

---
*Versão Inicial Estável*
