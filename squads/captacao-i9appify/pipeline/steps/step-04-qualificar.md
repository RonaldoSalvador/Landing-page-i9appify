# Step 04 — Qualificar e Pontuar

## Agente: Queli Qualifica (qualifier)

## Tarefa

Para cada lead aprovado, aplicar score de ICP (0–100).

### Critérios de pontuação

| Critério | Peso | Pontos |
|----------|------|--------|
| Cargo é dono/CEO/sócio | Alto | +30 |
| Empresa tem 1–50 funcionários | Alto | +20 |
| Setor prioritário (saúde, jurídico, imobiliário) | Médio | +20 |
| Tem telefone verificado | Médio | +15 |
| Tem email verificado | Médio | +10 |
| LinkedIn encontrado | Baixo | +5 |

### Classificação final
- **80–100** → `icp_match: true`, `qualificado: true` → entra no Step 05
- **50–79**  → `icp_match: false`, `qualificado: true` → entra no Step 05 (segunda prioridade)
- **0–49**   → `status: descartado` → não avança

### Output esperado
Salvar em `output/leads-qualificados.json` com campo `score` e `icp_match` preenchidos.
Salvar cada lead na tabela `prospect_leads` do Supabase com status `qualificado`.
