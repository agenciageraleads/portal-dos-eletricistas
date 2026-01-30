# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "Login Eletricista" [level=1] [ref=e4]
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: Email ou CPF/CNPJ
        - textbox "Digite seu email ou CPF" [ref=e8]: teste.e2e@portaleletricos.com.br
      - generic [ref=e9]:
        - generic [ref=e10]: Senha
        - textbox [ref=e11]: Teste@E2E123
        - link "Esqueci minha senha" [ref=e13] [cursor=pointer]:
          - /url: /esqueci-senha
      - button "Entrar" [ref=e14]
    - generic [ref=e15]:
      - text: Não tem conta?
      - link "Cadastre-se" [ref=e16] [cursor=pointer]:
        - /url: /register
    - link "Voltar para Home" [ref=e18] [cursor=pointer]:
      - /url: /
  - alert [ref=e19]
```