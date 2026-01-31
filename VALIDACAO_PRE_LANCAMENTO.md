# 📋 Checklist de Validação Pré-Lançamento
## Portal dos Eletricistas

**Ambiente de Teste:** https://beta.portaleletricos.com.br  
**Data:** 29/01/2026  
**Versão:** 1.5.2

---

## 🎯 Objetivo

Validar todas as funcionalidades implementadas do Portal dos Eletricistas antes do lançamento oficial, testando como um usuário real para garantir a melhor experiência possível.

---

## ✅ Checklist de Validação

### 1️⃣ **Autenticação e Cadastro**

#### 1.1 Registro de Novo Usuário
- [ ] Acessar página de cadastro (`/register`)
- [ ] Preencher formulário com dados válidos:
  - Nome completo
  - Email válido
  - Telefone (WhatsApp)
  - CPF/CNPJ
  - Senha forte
- [ ] Verificar validação de campos obrigatórios
- [ ] Verificar validação de formato de email
- [ ] Verificar validação de senha (mínimo 6 caracteres)
- [ ] Aceitar termos de uso
- [ ] Submeter cadastro
- [ ] Verificar redirecionamento após cadastro bem-sucedido
- [ ] **Resultado esperado:** Usuário criado e redirecionado para home autenticada

#### 1.2 Login
- [ ] Acessar página de login (`/login`)
- [ ] Tentar login com credenciais inválidas
- [ ] Verificar mensagem de erro apropriada
- [ ] Fazer login com credenciais válidas
- [ ] Verificar redirecionamento para home
- [ ] Verificar persistência da sessão (recarregar página)
- [ ] **Resultado esperado:** Login bem-sucedido e sessão mantida

#### 1.3 Recuperação de Senha
- [ ] Acessar "Esqueci minha senha"
- [ ] Inserir email cadastrado
- [ ] Verificar envio de email de recuperação
- [ ] Clicar no link do email
- [ ] Redefinir senha
- [ ] Fazer login com nova senha
- [ ] **Resultado esperado:** Senha alterada com sucesso

#### 1.4 Logout
- [ ] Clicar em "Sair" no menu do usuário
- [ ] Verificar redirecionamento para página de login
- [ ] Tentar acessar página protegida
- [ ] Verificar redirecionamento para login
- [ ] **Resultado esperado:** Sessão encerrada corretamente

---

### 2️⃣ **Perfil do Usuário**

#### 2.1 Visualização de Perfil
- [ ] Acessar página de perfil (`/perfil`)
- [ ] Verificar exibição de dados do usuário
- [ ] Verificar exibição de foto/logo (se houver)
- [ ] **Resultado esperado:** Dados exibidos corretamente

#### 2.2 Edição de Perfil
- [ ] Clicar em "Editar Perfil"
- [ ] Alterar nome
- [ ] Alterar telefone
- [ ] Alterar cidade/estado
- [ ] Adicionar/alterar bio
- [ ] Salvar alterações
- [ ] Verificar mensagem de sucesso
- [ ] Recarregar página e verificar persistência
- [ ] **Resultado esperado:** Dados atualizados corretamente

#### 2.3 Upload de Logo
- [ ] Acessar edição de perfil
- [ ] Fazer upload de imagem (PNG/JPG)
- [ ] Verificar preview da imagem
- [ ] Salvar
- [ ] Verificar exibição do logo no perfil
- [ ] Verificar exibição do logo nos orçamentos
- [ ] **Resultado esperado:** Logo carregado e exibido corretamente

---

### 3️⃣ **Catálogo de Produtos**

#### 3.1 Navegação no Catálogo
- [ ] Acessar catálogo (`/catalogo`)
- [ ] Verificar carregamento da lista de produtos
- [ ] Verificar exibição de imagens dos produtos
- [ ] Verificar exibição de preços
- [ ] Verificar exibição de informações básicas
- [ ] **Resultado esperado:** Produtos listados corretamente

#### 3.2 Busca de Produtos
- [ ] Usar barra de busca
- [ ] Buscar por nome de produto (ex: "Disjuntor")
- [ ] Verificar resultados relevantes
- [ ] Buscar por código (ex: "123456")
- [ ] Buscar por termo genérico (ex: "cabo")
- [ ] Testar busca sem resultados
- [ ] Verificar mensagem apropriada
- [ ] **Resultado esperado:** Busca funcionando corretamente

#### 3.3 Filtros e Ordenação
- [ ] Filtrar por categoria (se disponível)
- [ ] Filtrar por marca (se disponível)
- [ ] Ordenar por preço (crescente/decrescente)
- [ ] Ordenar por nome
- [ ] Verificar aplicação correta dos filtros
- [ ] **Resultado esperado:** Filtros aplicados corretamente

#### 3.4 Detalhes do Produto
- [ ] Clicar em um produto
- [ ] Verificar exibição de detalhes completos
- [ ] Verificar imagem em tamanho maior
- [ ] Verificar especificações técnicas
- [ ] Verificar preço e unidade
- [ ] **Resultado esperado:** Detalhes exibidos corretamente

---

### 4️⃣ **Criação de Orçamentos**

#### 4.1 Novo Orçamento - Fluxo Básico
- [ ] Acessar "Novo Orçamento" (`/orcamento/novo`)
- [ ] Buscar e adicionar produto ao carrinho
- [ ] Definir quantidade
- [ ] Adicionar mais produtos (mínimo 3)
- [ ] Verificar cálculo do subtotal
- [ ] Preencher dados do cliente:
  - Nome do cliente
  - Telefone do cliente
- [ ] Salvar como rascunho
- [ ] Verificar mensagem de sucesso
- [ ] **Resultado esperado:** Orçamento salvo como DRAFT

#### 4.2 Adicionar Mão de Obra
- [ ] Abrir orçamento em edição
- [ ] Adicionar descrição de mão de obra
- [ ] Definir valor de mão de obra
- [ ] Verificar cálculo do total (materiais + mão de obra)
- [ ] Salvar
- [ ] **Resultado esperado:** Mão de obra incluída no total

#### 4.3 Adicionar Produtos Externos
- [ ] Criar novo orçamento
- [ ] Clicar em "Adicionar produto externo"
- [ ] Preencher:
  - Nome do produto
  - Preço
  - Quantidade
  - Fonte/fornecedor (opcional)
- [ ] Adicionar ao orçamento
- [ ] Verificar inclusão na lista
- [ ] **Resultado esperado:** Produto externo adicionado

#### 4.4 Configurações de Exibição
- [ ] Editar orçamento
- [ ] Alternar "Mostrar total de mão de obra"
- [ ] Alternar "Mostrar preços unitários"
- [ ] Salvar e visualizar PDF
- [ ] Verificar aplicação das configurações
- [ ] **Resultado esperado:** Configurações aplicadas no PDF

#### 4.5 Adicionar Observações
- [ ] Editar orçamento
- [ ] Adicionar observações/notas
- [ ] Salvar
- [ ] Verificar exibição no PDF
- [ ] **Resultado esperado:** Observações incluídas

---

### 5️⃣ **Gestão de Orçamentos**

#### 5.1 Listar Orçamentos
- [ ] Acessar "Meus Orçamentos" (`/orcamentos`)
- [ ] Verificar listagem de todos os orçamentos
- [ ] Verificar exibição de:
  - Nome do cliente
  - Data de criação
  - Status (Rascunho, Compartilhado, etc.)
  - Valor total
- [ ] **Resultado esperado:** Orçamentos listados corretamente

#### 5.2 Filtrar Orçamentos
- [ ] Filtrar por status (Rascunho, Compartilhado, Aprovado)
- [ ] Filtrar por data
- [ ] Buscar por nome de cliente
- [ ] **Resultado esperado:** Filtros funcionando

#### 5.3 Visualizar Orçamento
- [ ] Clicar em um orçamento
- [ ] Verificar exibição de todos os detalhes
- [ ] Verificar lista de itens
- [ ] Verificar totais
- [ ] **Resultado esperado:** Detalhes completos exibidos

#### 5.4 Editar Orçamento
- [ ] Abrir orçamento existente
- [ ] Modificar quantidade de item
- [ ] Adicionar novo item
- [ ] Remover item
- [ ] Alterar dados do cliente
- [ ] Salvar alterações
- [ ] **Resultado esperado:** Alterações salvas

#### 5.5 Duplicar Orçamento
- [ ] Selecionar orçamento
- [ ] Clicar em "Duplicar" (se disponível)
- [ ] Verificar criação de cópia
- [ ] **Resultado esperado:** Orçamento duplicado

#### 5.6 Excluir Orçamento
- [ ] Selecionar orçamento de teste
- [ ] Clicar em "Excluir"
- [ ] Confirmar exclusão
- [ ] Verificar remoção da lista
- [ ] **Resultado esperado:** Orçamento excluído

---

### 6️⃣ **Compartilhamento de Orçamentos**

#### 6.1 Gerar PDF
- [ ] Abrir orçamento
- [ ] Clicar em "Gerar PDF" ou "Visualizar"
- [ ] Verificar abertura do PDF
- [ ] Verificar formatação:
  - Logo da empresa (se houver)
  - Dados do eletricista
  - Dados do cliente
  - Lista de itens com preços
  - Totais
  - Observações
- [ ] **Resultado esperado:** PDF gerado corretamente

#### 6.2 Compartilhar via WhatsApp
- [ ] Abrir orçamento
- [ ] Clicar em "Compartilhar via WhatsApp"
- [ ] Verificar abertura do WhatsApp Web/App
- [ ] Verificar mensagem pré-formatada com link
- [ ] **Resultado esperado:** Link compartilhável gerado

#### 6.3 Copiar Link
- [ ] Abrir orçamento
- [ ] Clicar em "Copiar Link"
- [ ] Verificar mensagem de confirmação
- [ ] Abrir link em aba anônima
- [ ] Verificar visualização pública do orçamento
- [ ] **Resultado esperado:** Link público funcionando

#### 6.4 Visualização Pública
- [ ] Acessar link público de orçamento
- [ ] Verificar exibição sem necessidade de login
- [ ] Verificar formatação adequada
- [ ] Verificar botão de contato (WhatsApp)
- [ ] **Resultado esperado:** Orçamento acessível publicamente

---

### 7️⃣ **Ferramentas e Calculadoras**

#### 7.1 Acessar Ferramentas
- [ ] Acessar seção de ferramentas (`/ferramentas`)
- [ ] Verificar lista de calculadoras disponíveis
- [ ] **Resultado esperado:** Ferramentas listadas

#### 7.2 Testar Calculadoras (se implementadas)
- [ ] Calculadora de queda de tensão
- [ ] Calculadora de dimensionamento de cabos
- [ ] Outras calculadoras disponíveis
- [ ] Verificar cálculos corretos
- [ ] **Resultado esperado:** Cálculos precisos

---

### 8️⃣ **Notificações**

#### 8.1 Visualizar Notificações
- [ ] Clicar no ícone de notificações
- [ ] Verificar lista de notificações
- [ ] Verificar indicador de não lidas
- [ ] **Resultado esperado:** Notificações exibidas

#### 8.2 Marcar como Lida
- [ ] Clicar em uma notificação
- [ ] Verificar marcação como lida
- [ ] Verificar atualização do contador
- [ ] **Resultado esperado:** Status atualizado

#### 8.3 Ações de Notificação
- [ ] Clicar em notificação com link
- [ ] Verificar redirecionamento correto
- [ ] **Resultado esperado:** Navegação correta

---

### 9️⃣ **Gamificação (se implementada)**

#### 9.1 Visualizar Progresso
- [ ] Verificar exibição de pontos/nível
- [ ] Verificar missões/desafios
- [ ] **Resultado esperado:** Gamificação visível

#### 9.2 Completar Missões
- [ ] Realizar ação que completa missão
- [ ] Verificar notificação de conquista
- [ ] Verificar atualização de pontos
- [ ] **Resultado esperado:** Recompensas funcionando

---

### 🔟 **Responsividade e UX**

#### 10.1 Mobile (Smartphone)
- [ ] Acessar pelo celular
- [ ] Testar navegação
- [ ] Testar criação de orçamento
- [ ] Verificar menu mobile
- [ ] Verificar bottom navigation
- [ ] Testar compartilhamento
- [ ] **Resultado esperado:** Experiência mobile fluida

#### 10.2 Tablet
- [ ] Acessar pelo tablet
- [ ] Verificar layout adaptativo
- [ ] Testar funcionalidades principais
- [ ] **Resultado esperado:** Layout adequado

#### 10.3 Desktop
- [ ] Acessar pelo desktop
- [ ] Verificar uso de espaço
- [ ] Testar todas as funcionalidades
- [ ] **Resultado esperado:** Interface otimizada

---

### 1️⃣1️⃣ **Performance e Estabilidade**

#### 11.1 Velocidade de Carregamento
- [ ] Medir tempo de carregamento inicial
- [ ] Verificar carregamento de imagens
- [ ] Verificar transições entre páginas
- [ ] **Resultado esperado:** Carregamento rápido (<3s)

#### 11.2 Navegação
- [ ] Testar botão "Voltar" do navegador
- [ ] Testar navegação entre seções
- [ ] Verificar breadcrumbs (se houver)
- [ ] **Resultado esperado:** Navegação intuitiva

#### 11.3 Tratamento de Erros
- [ ] Desconectar internet e tentar ação
- [ ] Verificar mensagem de erro
- [ ] Reconectar e verificar recuperação
- [ ] Tentar submeter formulário inválido
- [ ] Verificar validações
- [ ] **Resultado esperado:** Erros tratados adequadamente

---

### 1️⃣2️⃣ **Segurança**

#### 12.1 Proteção de Rotas
- [ ] Tentar acessar rota protegida sem login
- [ ] Verificar redirecionamento para login
- [ ] **Resultado esperado:** Rotas protegidas

#### 12.2 Dados Sensíveis
- [ ] Verificar que senhas não são exibidas
- [ ] Verificar HTTPS no ambiente de produção
- [ ] **Resultado esperado:** Dados protegidos

---

### 1️⃣3️⃣ **Integrações**

#### 13.1 WhatsApp
- [ ] Testar compartilhamento via WhatsApp
- [ ] Verificar formatação da mensagem
- [ ] Verificar link funcional
- [ ] **Resultado esperado:** Integração funcionando

#### 13.2 Email (Recuperação de Senha)
- [ ] Solicitar recuperação de senha
- [ ] Verificar recebimento de email
- [ ] Verificar formatação do email
- [ ] Clicar no link e verificar funcionamento
- [ ] **Resultado esperado:** Emails sendo enviados

---

## 🐛 Registro de Bugs/Problemas

### Formato de Registro:
```
**ID:** BUG-001
**Severidade:** Alta/Média/Baixa
**Módulo:** [Nome do módulo]
**Descrição:** [Descrição detalhada do problema]
**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]
**Resultado Esperado:** [O que deveria acontecer]
**Resultado Atual:** [O que está acontecendo]
**Screenshots:** [Links ou anexos]
**Prioridade:** Crítica/Alta/Média/Baixa
```

---

## 📊 Resumo da Validação

### Estatísticas
- **Total de Itens:** ___ / ___
- **Aprovados:** ___
- **Com Problemas:** ___
- **Bugs Críticos:** ___
- **Bugs Não-Críticos:** ___

### Recomendação Final
- [ ] ✅ **APROVADO PARA LANÇAMENTO** - Todas as funcionalidades críticas funcionando
- [ ] ⚠️ **APROVADO COM RESSALVAS** - Pequenos ajustes necessários, mas não bloqueantes
- [ ] ❌ **NÃO APROVADO** - Problemas críticos que impedem o lançamento

---

## 📝 Observações Gerais

[Espaço para anotações gerais sobre a experiência de uso, sugestões de melhorias, feedback sobre UX/UI, etc.]

---

## 👥 Validadores

| Nome | Data | Assinatura |
|------|------|------------|
|      |      |            |
|      |      |            |

---

**Última Atualização:** 29/01/2026  
**Próxima Revisão:** Após correções de bugs identificados
