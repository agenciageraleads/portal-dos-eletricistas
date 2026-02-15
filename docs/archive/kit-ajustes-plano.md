# Plano de Implementação - Ajustes de Usabilidade do Kit

## Objetivo
Ajustar o Antigravity Kit (skills, scripts e fluxos) para que ele seja totalmente funcional e seguro no ambiente do "Portal dos Eletricistas", seguindo as regras de tradução e validação técnica do usuário.

## Tarefas

### Fase 1: Ajustes de Infraestrutura e Scripts
- [ ] **Tarefa 1.1: Corrigir `checklist.py`**
  - Alterar chamadas de subprocesso para usar `python3` (padrão Mac).
  - Integrar a nova verificação de portas.
  - Verificar: Rodar `python3 .agent/scripts/checklist.py .` e ver se executa sem erros.
- [ ] **Tarefa 1.2: Criar `port_check.py`**
  - Criar o script em `.agent/scripts/port_check.py`.
  - Deve verificar portas comuns (3000, 3001, 4000) e alertar se estiverem ocupadas.
  - Verificar: Rodar o script manualmente.

### Fase 2: Atualização de Regras e Personalização
- [ ] **Tarefa 2.1: Traduzir/Ajustar `GEMINI.md`**
  - Reforçar as regras de PT/BR no TIER 0.
  - Incluir a verificação de portas no "Final Checklist Protocol".
  - Verificar: Ler o arquivo e confirmar inclusão.
- [ ] **Tarefa 2.2: Ajustar Prompt de Especialistas**
  - Garantir que os especialistas saibam que em caso de dúvida sobre portas, devem rodar o script de check.

### Fase 3: Validação Final
- [ ] **Tarefa 3.1: Executar Checklist Completo**
  - Rodar o novo checklist para garantir que tudo está "usável".
  - Verificar: Status "Passed" em todos os itens críticos.

## Done When
- [ ] `checklist.py` rodando com `python3`.
- [ ] Verificação de portas integrada e funcional.
- [ ] Documentação de plano e walkthrough sempre em PT/BR.
- [ ] Comentários de código em PT/BR configurados como regra.

## Notas
- O usuário está em Mac, então `python3` é fundamental.
- O monorepo tem vários apps, então a colisão de portas é um risco real.
