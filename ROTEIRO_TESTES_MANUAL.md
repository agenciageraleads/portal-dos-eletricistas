# 🧪 Roteiro de Testes - Portal dos Eletricistas

## Validação Manual Guiada

**URL de Teste:** <https://beta.portaleletricos.com.br>  
**Data:** 30/01/2026  
**Executor:** _____________

---

## 📱 TESTE 1: PRIMEIRA IMPRESSÃO (Landing Page)

### Objetivo

Validar a experiência inicial do usuário não autenticado.

### Passos

1. Acesse: <https://beta.portaleletricos.com.br>
2. Aguarde carregamento completo da página

### ✅ Checklist Visual

- [ ] Logo "PortalEletricista" visível no topo
- [ ] Mensagem de boas-vindas clara
- [ ] Botões "Entrar" e "Cadastrar Grátis" visíveis
- [ ] Seção "Acesso Rápido" com 4 cards:
  - Novo Orçamento
  - Meus Orçamentos
  - Catálogo
  - Calculadoras
- [ ] ~~Card de instalação PWA~~ (OCULTO conforme solicitado)
- [ ] Seção "Outros Serviços" com badge "Em Breve"
- [ ] Bottom Navigation visível (mobile)

### 🐛 Problemas Encontrados

```
[Anotar aqui qualquer problema visual ou de layout]
```

### 📸 Screenshot Sugerido

`01_landing_page.png`

---

## 🔐 TESTE 2: CADASTRO DE NOVO USUÁRIO

### Objetivo

Validar o fluxo completo de registro de um novo eletricista.

### Dados de Teste

```
Nome: João Silva Teste
Email: teste.joao.{TIMESTAMP}@gmail.com
Telefone: (11) 98765-4321
CPF/CNPJ: 123.456.789-00
Senha: Teste@123
```

### Passos

1. Na landing page, clique em **"Cadastrar Grátis"**
2. Verifique redirecionamento para `/register`
3. Preencha o formulário com os dados acima
4. Marque "Aceito os termos de uso"
5. Clique em "Cadastrar"

### ✅ Checklist

- [ ] Formulário carrega corretamente
- [ ] Todos os campos estão visíveis e editáveis
- [ ] Link "Termos de Uso" funciona
- [ ] Validação de email funciona (testar email inválido)
- [ ] Validação de senha funciona (testar senha fraca)
- [ ] Validação de CPF funciona (testar CPF inválido)
- [ ] Checkbox de termos é obrigatório
- [ ] Mensagem de sucesso aparece após cadastro
- [ ] Redirecionamento automático para home autenticada

### 🐛 Problemas Encontrados

```
[Anotar aqui]
```

### 📸 Screenshots Sugeridos

- `02a_formulario_cadastro.png`
- `02b_validacao_erro.png` (se houver)
- `02c_cadastro_sucesso.png`

---

[... continua com todos os outros testes ...]
