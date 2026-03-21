# Step 02 — Processar CSV do Apollo

## Agente: Aldo Apollo (prospector)

## Tarefa

Ler o arquivo CSV exportado do Apollo e normalizar para o formato do squad.

### Como executar
```bash
node squads/captacao-i9appify/scripts/apollo-csv.js
```

### O que o script faz
1. Lê `squads/captacao-i9appify/input/apollo-export.csv`
2. Mapeia as colunas do Apollo para o formato interno
3. Remove linhas sem nome ou sem contato (email/telefone)
4. Verifica duplicatas contra `prospect_leads` no Supabase
5. Salva resultado limpo em `output/leads-brutos.json`

### Colunas esperadas do Apollo (export padrão)
- First Name, Last Name, Title, Company, Industry
- # Employees, Email, Phone, LinkedIn Url, Website

### Output esperado em `output/leads-brutos.json`
```json
[
  {
    "nome": "João Silva",
    "cargo": "CEO",
    "empresa": "Clínica Saúde Total",
    "setor": "Health",
    "tamanho_empresa": "11-50",
    "email": "joao@clinica.com.br",
    "telefone": "+55 11 99999-9999",
    "linkedin_url": "linkedin.com/in/joaosilva",
    "website": "clinicasaudetotal.com.br",
    "fonte": "apollo",
    "fonte_detalhe": "exportação manual apollo.io"
  }
]
```

### Regras
- Ignorar leads sem nome
- Ignorar leads sem email E sem telefone (sem como contatar)
- Logar quantos foram ignorados e o motivo
