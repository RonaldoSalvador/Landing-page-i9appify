# Pasta de Input — Captação I9Appify

Coloque aqui o CSV exportado do Apollo.io antes de rodar o squad.

## Como exportar do Apollo

1. Acesse [app.apollo.io](https://app.apollo.io) → **Search** → **People**
2. Filtros recomendados:
   - Job Title: `CEO`, `Dono`, `Founder`, `Sócio`, `Diretor`
   - Industry: `Health`, `Legal`, `Real Estate`, `Education`
   - # Employees: `1-50`
   - Location: `Brazil`
3. **Export** → **Export to CSV**
4. Salve o arquivo aqui como `apollo-export.csv`

## Depois de salvar

Execute no terminal:
```bash
node squads/captacao-i9appify/scripts/apollo-csv.js
```

Ou rode o squad completo:
```
/opensquad run captacao-i9appify
```
