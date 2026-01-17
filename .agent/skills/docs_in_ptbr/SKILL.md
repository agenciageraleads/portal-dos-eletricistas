---
name: docs_in_ptbr
description: Ensure all user-facing documentation, artifacts, and UI text are in Brazilian Portuguese.
---

# Documentation & Language Skill

Use this skill to guide the language used in artifacts, documentation, and user interfaces.

## 1. Golden Rule

**ALL user-facing content must be in Brazilian Portuguese (pt-BR).**

This applies to:
- **Artifacts**: `implementation_plan.md`, `walkthrough.md`, `task.md`.
- **Explanations**: Chat responses and reasoning.
- **UI Text**: JSON translation files, hardcoded strings in components, labels, placeholders, and error messages.
- **Documentation**: `README.md`, `CHANGELOG.md`.

## 2. Code vs. Text

| Context | Language | Example |
| :--- | :--- | :--- |
| **User Interface** | 🇧🇷 pt-BR | `title="Novo Orçamento"`, `placeholder="Digite aqui..."` |
| **Artifacts (Plans)** | 🇧🇷 pt-BR | `## Mudanças Propostas`, `## Plano de Testes` |
| **Variable Names** | 🇺🇸 English | `const newBudget = ...`, `function calculateTotal()` |
| **Commit Messages** | 🇺🇸 Prefix + 🇧🇷/🇺🇸 Desc | `feat: adiciona botão de login` or `feat: add login button` (follow project pattern) |
| **Comments (Code)** | 🇺🇸 English or 🇧🇷 pt-BR | Follow existing file consistency. |

## 3. Checklist for Agent

1. [ ] **Verify Artifacts**: Are headers and descriptions in Portuguese?
2. [ ] **Verify UI**: Are button labels and toasts in Portuguese?
3. [ ] **No Mixed Signals**: Avoid "Spanglish" in user text (e.g., avoid "Click botão to Save").
4. [ ] **Tone**: Professional, technical but accessible (appropriate for Electrician Portal).

## 4. Usage Example

**Correct (Artifact):**
```markdown
## Plano de Implementação
Vou criar o componente de modal para confirmar a exclusão.
```

**Incorrect (Artifact):**
```markdown
## Implementation Plan
I will create the modal component to confirm deletion.
```
