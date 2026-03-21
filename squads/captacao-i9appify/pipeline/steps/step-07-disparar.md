# Step 07 — Salvar e Disparar

## Agente: Diego Disparo (dispatcher)

## Tarefa

Para cada lead aprovado no Step 06:

### 1. Salvar no Supabase

Inserir ou atualizar em `prospect_leads`:
```json
{
  "nome": "...",
  "cargo": "...",
  "empresa": "...",
  "email": "...",
  "telefone": "...",
  "fonte": "apollo",
  "score": 85,
  "icp_match": true,
  "qualificado": true,
  "status": "contatado",
  "dados_extras": {
    "mensagem_whatsapp": "...",
    "followup": "...",
    "squad_run": "[id da execução]"
  }
}
```

### 2. Acionar N8N via webhook

POST para o webhook do N8N configurado em `configuracoes`:
```json
{
  "evento": "novo_prospect_aprovado",
  "lead": { ... },
  "mensagem": "...",
  "agente": "Ronaldo IA"
}
```

O N8N cuida do envio real pelo WhatsApp (Z-API ou Evolution).

### 3. Registrar execução

Inserir em `skill_executions`:
```json
{
  "skill_nome": "captacao-i9appify-dispatcher",
  "skill_repo": "opensquad",
  "status": "success",
  "output_resumo": "X leads salvos, X disparos acionados"
}
```

### Output
Salvar em `output/relatorio-disparo.md` com resumo da rodada:
- Total prospectados
- Total qualificados
- Total aprovados
- Total disparados
- Falhas (se houver)
