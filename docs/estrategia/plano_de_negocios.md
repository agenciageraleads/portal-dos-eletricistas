# Plano de Negócios: Portal dos Eletricistas

Este documento detalha estratégias para maximizar a lucratividade de longo prazo do "Portal dos Eletricistas", alavancando suas funcionalidades atuais (Catálogo, Orçamentos com IA, Calculadoras, Marketplace de Serviços) e propondo novos fluxos de receita.

## 1. Visão Geral e Proposta de Valor

O Portal dos Eletricistas posiciona-se como o "Sistema Operacional do Eletricista", centralizando ferramentas técnicas, gestão de negócios e networking.
**Diferencial:** Integração de ferramentas práticas (calculadoras, criação de postes) com gestão comercial (orçamentos, serviços), algo que apps isolados não oferecem.

## 2. Modelos de Receita (Monetização)

### 2.1. SaaS para Profissionais (Assinatura "Portal Pro")

Focar em funcionalidades que aumentam a produtividade e o faturamento do eletricista.

* **Tier Gratuito (Freemium):** Acesso ao catálogo, calculadoras básicas, perfil simples, limite de 3 orçamentos/mês.
* **Tier Pro (R$ 29,90 - R$ 49,90/mês):**
  * **Orçamentos Ilimitados & IA:** Uso ilimitado da IA para gerar orçamentos automáticos a partir de fotos/listas.
  * **Personalização de Marca:** Orçamentos em PDF com logo do eletricista, cores personalizadas e termos de garantia profissionais.
  * **Calculadoras Avançadas:** Acesso a ferramentas complexas (ex: Dimensionamento de Postes com lista de materiais completa, Projetos Fotovoltaicos simples).
  * **Gestão de Clientes (CRM Leve):** Histórico de serviços, lembretes de manutenção (ex: "Oferecer revisão após 1 ano").
  * **Destaque no Marketplace:** Perfil priorizado nas buscas por serviços da região.

### 2.2. Marketplace de Materiais (B2B2C)

Transformar o `Catálogo` e os `Orçamentos` em canais de venda direta.

* **Comissão por Lead de Venda:** Quando o eletricista cria um orçamento (especialmente no "Construtor de Postes" ou "Iluminação"), incluir um botão "Cotar Materiais com Parceiros".
* **Parceria com Atacadistas Regionais:** Conectar o orçamento gerado diretamente ao WhatsApp de vendas de lojas parceiras. Cobrar uma taxa (% ou fixa) por lead qualificado enviado.
* **Anúncios Nativos (Retail Media):** Fabricantes (ex: Schneider, Tramontina) pagam para seus produtos aparecerem primeiro nas buscas do catálogo ou serem sugeridos como "Recomendação Premium" dentro das ferramentas de cálculo.

### 2.3. Marketplace de Serviços (Uberização Controlada)

Monetizar a conexão entre cliente final e eletricista através do módulo `services`.

* **Modelo de Taxa de Desbloqueio (Lead Fee):** O cliente posta o serviço gratuitamente. Os eletricistas veem o resumo (ex: "Troca de Chuveiro - Bairro X"). Para ver o contato do cliente, o eletricista gasta "Créditos" (comprados em pacotes).
  * *Vantagem:* Mais previsível que comissão sobre serviço (difícil de controlar off-platform).
* **Selo de Verificação:** Cobrar taxa única ou recorrente para validar antecedentes e certificações (NR-10), aumentando a confiança do cliente final.

### 2.4. SaaS para Pequenas Empresas e Construtoras (Enterprise)

* **Gestão de Equipes:** Permitir que uma pequena empreiteira gerencie 5-10 eletricistas, centralizando os orçamentos e chats (`chat-sessions`) em um painel administrativo.
* **Ferramenta de Vendas para Lojas:** Oferecer o "Construtor de Postes" como uma ferramenta *white-label* para lojas de material elétrico usarem no balcão de vendas.

## 3. Estratégia de Crescimento (Growth)

### "Tool-Led Growth" (Crescimento via Ferramentas)

Usar as ferramentas gratuitas como isca para aquisição de usuários.

* **SEO Programático:** Criar páginas públicas para cada cálculo possível (ex: "Calculadora de Queda de Tensão Bitola 10mm").
* **Viralidade:** Permitir que o orçamento/lista de materiais seja compartilhado via WhatsApp (já integrado) com uma marca d'água "Criado via Portal dos Eletricistas".

## 4. Roadmap de Monetização

### Fase 1: Fundação (Curto Prazo - 1 a 3 meses)

* [ ] Refinar funil de registro (Beta já existente).
* [ ] Implementar "Paywall Lógico": Bloquear recursos avançados (ex: Exportar PDF, Histórico de Chat > 5 dias) para usuários gratuitos.
* [ ] Integrar Gateway de Pagamento (Stripe/Pagar.me) na API.

### Fase 2: Monetização B2C (Médio Prazo - 3 a 6 meses)

* [ ] Lançar assinatura "Pro".
* [ ] Vender pacotes de créditos para desbloquear leads de serviços.
* [ ] Melhorar a IA de Orçamentos para justificar o valor da assinatura.

### Fase 3: Ecossistema B2B (Longo Prazo - 6+ meses)

* [ ] Painel para Atacadistas receberem cotações.
* [ ] Integração de estoque com parceiros locais.

## 5. Análise Técnica Necessária

Para suportar este plano, precisamos:

1. **Backend (API):** Criar tabelas `Subscriptions`, `Payments`, `Credits`. Integrar Webhooks de pagamento.
2. **Frontend (Web):** Criar fluxos de Checkout, Paywalls em componentes e Dashboard financeiro para o eletricista.
3. **Segurança:** Reforçar autenticação e validação de usuários para o selo de verificação.
