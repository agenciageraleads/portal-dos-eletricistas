# Processo de Release (Lançamento)

Este documento descreve como realizar o lançamento de uma nova versão do **Portal dos Eletricistas**, garantindo que o GitHub e o código estejam sempre sincronizados.

---

## 🚀 Fluxo de Release

Cada vez que uma funcionalidade importante é finalizada ou um conjunto de correções é acumulado:

1.  **Atualizar o CHANGELOG.md**:
    - Adicione a nova versão e a data.
    - Descreva o que foi adicionado, alterado ou corrigido.

2.  **Tag no Git**:
    - Use o padrão SemVer (v1.x.x).
    - Comando local: `git tag v1.x.x`
    - Enviar tag: `git push origin v1.x.x`

3.  **Criar GitHub Release**:
    - Acesse a aba [Releases](https://github.com/agenciageraleads/portal-dos-eletricistas/releases) no GitHub.
    - Crie um novo release baseado na tag enviada.
    - Use o template abaixo para a descrição.

---

## 📝 Template de Release (GitHub)

```markdown
# 🏷️ Release vX.Y.Z (Título Curto)

### ✨ O que há de novo (Features)
- [Funcionalidade 1]: Descrição breve.
- [Funcionalidade 2]: Descrição breve.

### 🐞 Correções (Fixes)
- [Bug 1]: Descrição do que foi corrigido.

### 🛠️ Melhorias Técnicas
- [Melhoria 1]: Ex: Refatoração, performance, segurança.
```

---

## ⚠️ Notas Importantes
- **Imagens de Produtos**: NUNCA envie imagens da pasta `apps/web/public/products` para o Git. O repositório deve ser mantido leve para garantir a performance do time.
- **Segredos**: Nunca faça commit de arquivos `.env`. Utilize o checklist de deploy para garantir que as variáveis estão no servidor.
