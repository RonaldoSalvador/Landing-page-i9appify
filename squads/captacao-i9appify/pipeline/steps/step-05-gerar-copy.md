# Step 05 — Gerar Abordagens

## Agente: Carlos Copy (copywriter)

## Tarefa

Para cada lead qualificado, pesquisar a empresa e escrever uma mensagem
de primeiro contato para WhatsApp + 1 follow-up de reforço.

### Processo por lead

1. **Pesquisar** o site e LinkedIn da empresa (web_fetch)
2. **Identificar** a dor principal (atendimento manual? sem automação? equipe pequena?)
3. **Escrever** mensagem personalizada usando o skill `cold-email` + `copywriting`

### Estrutura da mensagem WhatsApp (1ª abordagem)

```
Oi [Nome]! 👋

Vi que a [Empresa] atua em [setor] e queria trocar uma ideia rápida.

Tenho ajudado negócios como o seu a [benefício específico] com automação de IA —
sem precisar contratar mais atendentes.

Vale uma conversa de 10 minutos esta semana?
```

### Estrutura do follow-up (após 3 dias sem resposta)

```
Oi [Nome], só passando para ver se minha mensagem chegou!

Recentemente ajudei [empresa similar] a [resultado concreto].
Posso mostrar como funcionaria para a [Empresa] também.

Tem um tempinho?
```

### Regras (skill marketing-psychology aplicado)
- Máximo 3 linhas por mensagem
- 1 benefício concreto, 1 pergunta no final
- Tom: próximo, direto, sem pressão
- Nunca usar palavras: "oferta", "promoção", "desconto", "venda"

### Output
Salvar em `output/abordagens.md` com uma seção por lead.
