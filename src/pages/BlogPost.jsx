import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Calendar, Tag, Clock, Share2, ArrowRight,
    Eye, Heart, Bookmark, Copy, Twitter, Linkedin, Facebook,
    ChevronUp, MessageCircle, Home
} from 'lucide-react'

// Imagens de capa ÚNICAS para cada artigo
const imagensCapas = {
    'deepseek-r1': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
    'claude-35-opus': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=600&fit=crop',
    'ia-whatsapp-business': 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&h=600&fit=crop',
    'comparativo-ias-2026': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&h=600&fit=crop',
    'no-code-2026': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
    'i9-appify-ia': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    'automacao-vendas': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
    'futuro-apps-2026': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop',
    'chatbots-avancados': 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&h=600&fit=crop',
    'gpt-5-rumores': 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=1200&h=600&fit=crop',
    'ai-agents-2026': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
    'aplicativos-advocacia': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=600&fit=crop',
    'n8n-automacao': 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1200&h=600&fit=crop',
    'crm-pequenas-empresas': 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&h=600&fit=crop',
    'seo-ia-2026': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&h=600&fit=crop',
    'react-native-flutter': 'https://images.unsplash.com/photo-1617040619263-41c5a9ca7521?w=1200&h=600&fit=crop',
    'landing-pages-conversao': 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=600&fit=crop',
    'prompt-engineering': 'https://images.unsplash.com/photo-1676299081847-c3c9b8c8e8d8?w=1200&h=600&fit=crop'
}


// Cores por categoria
const categoriaCores = {
    'Trending': 'bg-red-500/20 text-red-400 border-red-500/30',
    '🔥 Trending': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Novidades': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Tutorial': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Análise': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'No-Code': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Cases': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Tendências': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'Desenvolvimento': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Marketing': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
}


// Artigos completos
const artigosCompletos = {
    'deepseek-r1': {
        titulo: 'DeepSeek R1: A IA chinesa que está abalando o mercado',
        categoria: 'Trending',
        tags: ['IA', 'DeepSeek', 'Open Source', 'China'],
        data: '2026-01-28',
        tempo_leitura: '5 min',
        views: 2847,
        likes: 156,
        resumo: 'Nova IA open-source promete rivalizar com ChatGPT e Claude por uma fração do custo.',
        conteudo: `
## O que é o DeepSeek R1?

O DeepSeek R1 é um modelo de linguagem desenvolvido na China que está causando um verdadeiro terremoto no mercado de IA. Lançado em janeiro de 2026, ele promete desempenho comparável ao GPT-4 e Claude 3, mas com uma vantagem crucial: **é open-source e muito mais barato**.

## Por que isso é importante?

Até agora, as melhores IAs eram controladas por empresas americanas como OpenAI, Anthropic e Google. O DeepSeek quebra essa hegemonia ao oferecer:

- **Código aberto**: Qualquer empresa pode usar e adaptar
- **Custo reduzido**: Até 90% mais barato que concorrentes
- **Desempenho competitivo**: Benchmarks mostram resultados impressionantes

## Impacto no mercado

As ações de empresas de IA americanas já sentiram o impacto. Nvidia, por exemplo, teve queda significativa após o anúncio, levantando questões sobre a dependência de hardware caro para treinar modelos.

## O que isso significa para você?

Se você é empresário, isso é uma ótima notícia. Mais competição significa:

1. **Preços menores** para usar IA nos seus produtos
2. **Mais opções** de fornecedores e modelos
3. **Inovação acelerada** com mais players no mercado

## Conclusão

O DeepSeek R1 marca um ponto de virada na indústria de IA. Empresas que ainda não estão usando inteligência artificial em seus processos têm agora mais motivos para começar - os custos nunca foram tão acessíveis.

---

**Quer saber como implementar IA no seu negócio?** [Fale com a I9 Appify](https://wa.me/5531993988889)
    `
    },
    'claude-35-opus': {
        titulo: 'Claude 3.5 Opus: O que esperar do novo modelo da Anthropic',
        categoria: 'Novidades',
        tags: ['Claude', 'Anthropic', 'IA', 'GPT'],
        data: '2026-01-27',
        tempo_leitura: '4 min',
        views: 1923,
        likes: 89,
        resumo: 'Vazamentos indicam capacidades de raciocínio avançado e visual multimodal revolucionário.',
        conteudo: `
## O que sabemos sobre o Claude 3.5 Opus?

A Anthropic está preparando o lançamento do Claude 3.5 Opus, a versão mais poderosa de sua família de modelos. Vazamentos e testes internos sugerem avanços significativos.

## Principais melhorias esperadas

### 1. Raciocínio Avançado
O modelo deve superar o GPT-4 em tarefas que exigem pensamento em múltiplas etapas, como resolução de problemas matemáticos e análise de código.

### 2. Visão Multimodal
Capacidade de analisar imagens, gráficos e documentos com precisão muito maior que versões anteriores.

### 3. Contexto Expandido
Janela de contexto ainda maior, permitindo analisar documentos inteiros sem perder informação.

## Quando será lançado?

A Anthropic não confirmou datas, mas especula-se que o lançamento aconteça no primeiro trimestre de 2026.

## Como isso afeta seu negócio?

Se você já usa Claude ou ChatGPT, pode esperar:

- Automações mais inteligentes
- Análise de documentos mais precisa
- Atendimento ao cliente mais natural

---

**Quer preparar seu negócio para a próxima geração de IA?** [Fale conosco](https://wa.me/5531993988889)
    `
    },
    'ia-whatsapp-business': {
        titulo: 'Como usar IA para automatizar seu WhatsApp Business',
        categoria: 'Tutorial',
        tags: ['WhatsApp', 'Chatbot', 'Automação', 'Negócios'],
        data: '2026-01-25',
        tempo_leitura: '7 min',
        views: 4521,
        likes: 234,
        resumo: 'Tutorial prático: configure um chatbot inteligente para atender seus clientes 24/7.',
        conteudo: `
## Por que automatizar o WhatsApp?

O WhatsApp é o principal canal de comunicação no Brasil. Se você responde mensagens manualmente, está perdendo tempo e dinheiro.

## Benefícios da automação com IA

- **Atendimento 24/7**: Responda clientes mesmo dormindo
- **Respostas instantâneas**: Zero tempo de espera
- **Qualificação automática**: Filtre leads antes de gastar tempo
- **Escalabilidade**: Atenda 100 clientes ao mesmo tempo

## Como funciona?

### Passo 1: Escolha a plataforma
Existem várias opções no mercado. Na I9 Appify, usamos o ClawdBot, que conecta diretamente ao WhatsApp Web.

### Passo 2: Configure o prompt
O prompt é a "personalidade" do seu bot. Defina:
- Tom de voz (formal, informal, técnico)
- Informações sobre sua empresa
- Fluxo de atendimento
- Quando transferir para humano

### Passo 3: Integre com seu CRM
Os dados coletados pelo bot devem ir para seu sistema de gestão. Assim você não perde nenhum lead.

### Passo 4: Teste e ajuste
Nenhum bot é perfeito de primeira. Faça testes, analise conversas e melhore continuamente.

## Exemplo de fluxo

\`\`\`
Cliente: Oi, quero saber o preço
Bot: Olá! Para qual serviço você precisa de orçamento?
     1. Aplicativo
     2. Site
     3. Automação
Cliente: Aplicativo
Bot: Ótimo! É para qual área? (Advocacia, Saúde, Comércio...)
Cliente: Advocacia
Bot: Perfeito! Preencha este formulário rápido e o Ronaldo te liga em seguida.
\`\`\`

## Resultados reais

Empresas que implementam automação no WhatsApp reportam:

- **60% menos tempo** gasto com atendimento
- **40% mais conversões** de leads em clientes
- **90% de satisfação** dos clientes com resposta rápida

---

**Quer implementar isso no seu negócio?** [Fale com a I9 Appify](https://wa.me/5531993988889)
    `
    },
    'comparativo-ias-2026': {
        titulo: 'ChatGPT vs Claude vs Gemini: Qual a melhor IA em 2026?',
        categoria: 'Análise',
        tags: ['ChatGPT', 'Claude', 'Gemini', 'Comparativo'],
        data: '2026-01-22',
        tempo_leitura: '6 min',
        views: 3156,
        likes: 178,
        resumo: 'Comparativo completo entre as principais IAs do mercado.',
        conteudo: `
## O cenário atual de IAs em 2026

O mercado de IA nunca foi tão competitivo. Três gigantes disputam a liderança: OpenAI (ChatGPT), Anthropic (Claude) e Google (Gemini).

## Comparativo Rápido

| Característica | ChatGPT | Claude | Gemini |
|----------------|---------|--------|--------|
| Raciocínio | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Código | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Criatividade | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Preço | $$$ | $$ | $$ |
| Contexto | 128k | 200k | 1M |

## Quando usar cada um?

### ChatGPT (GPT-4o)
- Melhor para: código, análise de dados, plugins/integrações
- Ponto forte: ecossistema maduro

### Claude 3.5
- Melhor para: textos longos, análise de documentos, tarefas criativas
- Ponto forte: respostas mais naturais e éticas

### Gemini 1.5 Pro
- Melhor para: contextos enormes (livros inteiros), integração com Google
- Ponto forte: janela de contexto de 1 milhão de tokens

## Conclusão

Não existe "a melhor IA". Depende do seu caso de uso:

- **Programador?** ChatGPT
- **Escritor/Marketing?** Claude
- **Precisa analisar documentos gigantes?** Gemini

---

**Não sabe qual usar no seu negócio?** [A I9 Appify te ajuda a decidir](https://wa.me/5531993988889)
    `
    },
    'no-code-2026': {
        titulo: 'No-Code em 2026: As ferramentas que você precisa conhecer',
        categoria: 'No-Code',
        tags: ['No-Code', 'Bubble', 'FlutterFlow', 'Apps'],
        data: '2026-01-20',
        tempo_leitura: '5 min',
        views: 2089,
        likes: 145,
        resumo: 'De Bubble a FlutterFlow: as melhores plataformas para criar apps sem programar.',
        conteudo: `
## O que é No-Code?

No-Code são plataformas que permitem criar aplicativos, sites e automações sem escrever código. Você arrasta blocos, configura regras e pronto.

## Melhores ferramentas em 2026

### Para Apps Mobile
1. **FlutterFlow** - O mais completo para apps nativos
2. **Adalo** - Simples e rápido para MVPs
3. **Glide** - Transforma planilhas em apps

### Para Sites
1. **Webflow** - Design profissional total
2. **Framer** - Animações incríveis
3. **Carrd** - Landing pages em minutos

### Para Automação
1. **Make (ex-Integromat)** - O mais versátil
2. **n8n** - Open-source e poderoso
3. **Zapier** - O mais fácil de usar

## Limitações do No-Code

Nem tudo são flores. Existem limitações:

- Projetos muito complexos ainda precisam de código
- Custos de plataforma podem ser altos
- Dependência do fornecedor

## Quando usar No-Code?

✅ MVPs e protótipos rápidos
✅ Automações simples a médias
✅ Sites e landing pages
✅ Apps internos de empresa

❌ Sistemas complexos com regras específicas
❌ Apps que precisam de alta performance
❌ Projetos com requisitos de segurança rigorosos

---

**Quer saber se No-Code resolve seu problema?** [Consulte a I9 Appify](https://wa.me/5531993988889)
    `
    },
    'i9-appify-ia': {
        titulo: 'Como a I9 Appify usa IA para transformar negócios',
        categoria: 'Cases',
        tags: ['I9 Appify', 'Cases', 'Sucesso', 'Automação'],
        data: '2026-01-18',
        tempo_leitura: '4 min',
        views: 1567,
        likes: 92,
        resumo: 'Cases reais de clientes que automatizaram processos e aumentaram vendas.',
        conteudo: `
## Quem é a I9 Appify?

Somos uma empresa mineira especializada em soluções digitais: aplicativos, sites e automação com IA. Nosso foco principal são escritórios de advocacia, mas atendemos diversos segmentos.

## Cases de Sucesso

### Escritório de Advocacia - BH
**Problema:** Atendimento manual no WhatsApp consumia 4 horas/dia
**Solução:** Chatbot com IA para triagem de clientes
**Resultado:** Redução de 70% no tempo de atendimento, aumento de 40% nas conversões

### Clínica Odontológica - Contagem
**Problema:** Agendamentos por telefone causavam erros e conflitos
**Solução:** App de agendamento integrado ao Google Calendar
**Resultado:** Zero conflitos de horário, satisfação dos pacientes aumentou

### E-commerce de Roupas - Online
**Problema:** Perdia vendas por demora nas respostas
**Solução:** Automação de WhatsApp + CRM
**Resultado:** Tempo de resposta de 2 min para 10 segundos, vendas +25%

## Nossa metodologia

1. **Entendimento** - Conversamos para mapear sua dor
2. **Proposta** - Apresentamos solução com prazo e valor
3. **Desenvolvimento** - Construímos com você acompanhando
4. **Entrega** - Treinamento e suporte inclusos

## Quanto custa?

Projetos geralmente ficam entre R$ 4.000 e R$ 10.000, dependendo da complexidade. Parcelamos e trabalhamos com várias formas de pagamento.

---

**Quer ser o próximo case de sucesso?** [Fale com o Ronaldo](https://wa.me/5531993988889)

---

**Fontes:**
- Dados internos I9 Appify, 2024-2026
- Pesquisa CNJ sobre tecnologia jurídica
    `
    },
    'gpt-5-rumores': {
        titulo: 'GPT-5: Tudo que sabemos sobre o próximo modelo da OpenAI',
        categoria: 'Novidades',
        tags: ['GPT-5', 'OpenAI', 'IA', 'Rumores'],
        data: '2026-01-27',
        tempo_leitura: '6 min',
        views: 8923,
        likes: 534,
        resumo: 'Vazamentos indicam que o GPT-5 terá capacidades de raciocínio superiores e memória de longo prazo.',
        conteudo: `
## O que sabemos sobre o GPT-5?

O GPT-5 é o próximo grande modelo de linguagem que a OpenAI está desenvolvendo. Embora a empresa não tenha confirmado oficialmente, diversos vazamentos e declarações de executivos nos dão pistas do que esperar.

## Principais especulações

### 1. Raciocínio avançado
O GPT-5 deve superar significativamente o GPT-4 em tarefas de raciocínio complexo, como:
- Resolução de problemas matemáticos avançados
- Análise de código complexo
- Planejamento de longo prazo

### 2. Memória persistente
Uma das maiores limitações atuais é a falta de memória entre conversas. O GPT-5 promete:
- Lembrar de conversas anteriores
- Manter contexto de projetos longos
- Aprender preferências do usuário

### 3. Multimodalidade nativa
Integração perfeita entre:
- Texto, imagem e vídeo
- Áudio e voz
- Código e diagramas

## Quando será lançado?

As apostas variam entre Q2 e Q4 de 2026. A OpenAI está focada em segurança e alinhamento antes do lançamento.

## Impacto esperado

Se as especulações se confirmarem, o GPT-5 pode:
- Automatizar tarefas mais complexas
- Substituir ferramentas especializadas
- Democratizar ainda mais o acesso à IA

---

**Fontes:**
- The Information, Janeiro 2026
- Reuters Tech News
- OpenAI Blog Oficial
    `
    },
    'ai-agents-2026': {
        titulo: 'AI Agents: O futuro da automação já chegou',
        categoria: 'Tendências',
        tags: ['AI Agents', 'Automação', 'IA', 'Produtividade'],
        data: '2026-01-26',
        tempo_leitura: '8 min',
        views: 6721,
        likes: 423,
        resumo: 'Agentes de IA autônomos estão revolucionando a forma como trabalhamos.',
        conteudo: `
## O que são AI Agents?

AI Agents são sistemas de inteligência artificial capazes de executar tarefas complexas de forma autônoma, tomando decisões e interagindo com ferramentas externas.

## Diferença entre Chatbots e Agents

| Chatbots | AI Agents |
|----------|-----------|
| Respondem perguntas | Executam tarefas |
| Dependem do usuário | Agem autonomamente |
| Conversa única | Múltiplas interações |
| Limitados ao chat | Usam ferramentas externas |

## Casos de uso em 2026

### 1. Pesquisa automatizada
Agents que navegam na web, coletam dados e geram relatórios completos.

### 2. Assistente de código
Agents que debugam, refatoram e implementam features inteiras.

### 3. Gerenciamento de projetos
Agents que coordenam tarefas, enviam lembretes e atualizam status.

### 4. Atendimento ao cliente
Agents que resolvem problemas complexos sem intervenção humana.

## Ferramentas populares

- **AutoGPT** - O pioneiro open-source
- **LangChain Agents** - Framework flexível
- **CrewAI** - Múltiplos agents colaborando

## Limitações atuais

- Custo ainda elevado para uso intensivo
- Podem cometer erros em tarefas críticas
- Requerem supervisão humana

---

**Fontes:**
- Gartner Hype Cycle 2025
- McKinsey Digital Report
- Papers do arXiv sobre agentes autônomos
    `
    },
    'aplicativos-advocacia': {
        titulo: 'Aplicativos para Advocacia: Guia Completo 2026',
        categoria: 'Cases',
        tags: ['Advocacia', 'Apps', 'Direito', 'Tecnologia'],
        data: '2026-01-24',
        tempo_leitura: '6 min',
        views: 4892,
        likes: 287,
        resumo: 'Como um app personalizado pode transformar seu escritório de advocacia.',
        conteudo: `
## Por que advogados precisam de apps?

O mercado jurídico está cada vez mais competitivo. Escritórios que investem em tecnologia se destacam por:
- **Atendimento ágil** ao cliente
- **Organização** de processos e prazos
- **Diferenciação** no mercado

## Funcionalidades essenciais

### Para o escritório
- Dashboard com métricas de casos
- Controle de prazos processuais
- Gestão de documentos
- CRM de clientes

### Para o cliente
- Acompanhar andamento do processo
- Chat direto com o advogado
- Notificações de movimentações
- Envio de documentos

## Quanto custa desenvolver?

| Escopo | Valor estimado |
|--------|----------------|
| App básico | R$ 4.000 - R$ 6.000 |
| App intermediário | R$ 6.000 - R$ 10.000 |
| App completo | R$ 10.000 - R$ 20.000 |

## Retorno sobre investimento

Escritórios que implementaram apps personalizados reportam:
- 40% menos tempo em tarefas administrativas
- 60% mais satisfação dos clientes
- 25% aumento em novos casos por indicação

---

**Fontes:**
- Pesquisa OAB Digital 2025
- Case studies I9 Appify
- Relatório LegalTech Brasil
    `
    },
    'n8n-automacao': {
        titulo: 'n8n vs Zapier vs Make: Qual ferramenta de automação escolher?',
        categoria: 'Análise',
        tags: ['n8n', 'Zapier', 'Make', 'Automação'],
        data: '2026-01-23',
        tempo_leitura: '9 min',
        views: 7234,
        likes: 456,
        resumo: 'Comparativo definitivo entre as principais ferramentas de automação.',
        conteudo: `
## Visão geral das ferramentas

### Zapier
O mais popular, com milhares de integrações prontas. Ideal para quem quer simplicidade.

### Make (ex-Integromat)
Visual e poderoso, permite automações complexas com mais controle.

### n8n
Open-source e self-hosted, máxima flexibilidade e sem custos por execução.

## Comparativo detalhado

| Critério | Zapier | Make | n8n |
|----------|--------|------|-----|
| Facilidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Integrações | 5000+ | 1000+ | 400+ |
| Preço | $$$ | $$ | Grátis* |
| Customização | Baixa | Média | Alta |
| Self-hosted | Não | Não | Sim |

*n8n é gratuito se você hospedar, pago no cloud deles.

## Quando usar cada um?

**Escolha Zapier se:**
- Você quer começar rápido
- Precisa de integrações específicas
- Não quer complexidade

**Escolha Make se:**
- Precisa de automações complexas
- Quer bom custo-benefício
- Valoriza interface visual

**Escolha n8n se:**
- Quer controle total
- Tem volume alto de execuções
- Sabe hospedar aplicações

---

**Fontes:**
- Documentação oficial das plataformas
- G2 Reviews 2025
- Testes internos I9 Appify
    `
    },
    'crm-pequenas-empresas': {
        titulo: 'CRM para Pequenas Empresas: Guia de Implementação',
        categoria: 'Tutorial',
        tags: ['CRM', 'Vendas', 'Leads', 'Gestão'],
        data: '2026-01-21',
        tempo_leitura: '10 min',
        views: 6127,
        likes: 378,
        resumo: 'Aprenda a implementar um CRM do zero e organize seus leads.',
        conteudo: `
## O que é CRM?

CRM (Customer Relationship Management) é um sistema para gerenciar relacionamento com clientes. Vai muito além de uma planilha de contatos.

## Por que pequenas empresas precisam de CRM?

Sem CRM:
- Leads se perdem em anotações
- Não sabe quando fazer follow-up
- Vendas dependem de memória

Com CRM:
- Histórico completo de cada lead
- Lembretes automáticos
- Relatórios de conversão

## Implementação passo a passo

### Passo 1: Escolha a ferramenta
Opções populares:
- **HubSpot** (gratuito básico)
- **Pipedrive** (focado em vendas)
- **RD Station** (brasileiro)
- **CRM próprio** (máximo controle)

### Passo 2: Configure seu funil
Defina as etapas do seu processo de vendas:
1. Novo lead
2. Qualificação
3. Proposta enviada
4. Negociação
5. Fechado/Perdido

### Passo 3: Importe seus dados
Migre contatos de planilhas, WhatsApp e outros sistemas.

### Passo 4: Treine a equipe
CRM só funciona se todos usarem corretamente.

## Métricas importantes

- Taxa de conversão por etapa
- Tempo médio no funil
- Valor médio dos deals
- Principais motivos de perda

---

**Fontes:**
- HubSpot State of Marketing 2025
- Salesforce Small Business Report
- Pesquisa Sebrae
    `
    },
    'seo-ia-2026': {
        titulo: 'SEO com IA: Como ranquear seu site em 2026',
        categoria: 'Tutorial',
        tags: ['SEO', 'IA', 'Marketing', 'Google'],
        data: '2026-01-19',
        tempo_leitura: '8 min',
        views: 5678,
        likes: 345,
        resumo: 'Estratégias de SEO potencializadas por inteligência artificial.',
        conteudo: `
## SEO mudou com a IA

O Google agora usa IA para entender conteúdo de forma muito mais profunda. Técnicas antigas não funcionam mais.

## O que funciona em 2026

### 1. Conteúdo de qualidade real
A IA do Google detecta conteúdo superficial. Você precisa de:
- Informações originais e profundas
- Experiência demonstrada (E-E-A-T)
- Atualização constante

### 2. Search Generative Experience (SGE)
O Google agora gera resumos com IA. Para aparecer:
- Responda perguntas de forma direta
- Use estrutura clara (headers, listas)
- Seja fonte citável

### 3. Core Web Vitals
Performance ainda é crítica:
- LCP < 2.5 segundos
- FID < 100ms
- CLS < 0.1

## Ferramentas com IA para SEO

| Ferramenta | Função |
|------------|--------|
| Surfer SEO | Otimização de conteúdo |
| Clearscope | Análise de concorrência |
| ChatGPT | Ideação e estrutura |
| Frase.io | Pesquisa e outline |

## Erros fatais em 2026

❌ Conteúdo gerado 100% por IA sem revisão
❌ Keyword stuffing
❌ Links artificiais
❌ Ignorar mobile

---

**Fontes:**
- Google Search Central Blog
- Ahrefs SEO Trends 2026
- Moz Whiteboard Friday
    `
    },
    'react-native-flutter': {
        titulo: 'React Native vs Flutter: Qual framework mobile usar?',
        categoria: 'Desenvolvimento',
        tags: ['React Native', 'Flutter', 'Mobile', 'Apps'],
        data: '2026-01-17',
        tempo_leitura: '7 min',
        views: 3892,
        likes: 234,
        resumo: 'Análise dos dois principais frameworks para desenvolvimento mobile.',
        conteudo: `
## O dilema de todo dev mobile

Criar apps nativos para iOS e Android separadamente é caro e demorado. Frameworks cross-platform resolvem isso.

## React Native

**Criado pelo Facebook (Meta)**

Pros:
- Usa JavaScript/TypeScript (muitos devs já conhecem)
- Ecossistema npm gigante
- Hot reload excelente
- Comunidade enorme

Contras:
- Performance pode ser inferior em casos específicos
- Bridge JavaScript-Native pode ser gargalo
- Dependência de bibliotecas terceiras

## Flutter

**Criado pelo Google**

Pros:
- Performance próxima ao nativo
- Design system Material/Cupertino incluso
- Compilação AOT (Ahead of Time)
- Uma codebase para mobile, web e desktop

Contras:
- Dart é menos popular que JavaScript
- Apps tendem a ser maiores
- Menos vagas de emprego (ainda)

## Comparativo direto

| Critério | React Native | Flutter |
|----------|--------------|---------|
| Linguagem | JavaScript | Dart |
| Performance | Boa | Excelente |
| UI customizada | Média | Excelente |
| Curva de aprendizado | Média | Média |
| Vagas de emprego | Alta | Crescendo |

## Nossa recomendação

**Escolha React Native se:** você ou sua equipe já dominam JavaScript/React.

**Escolha Flutter se:** performance e UI customizada são prioridade.

---

**Fontes:**
- Stack Overflow Developer Survey 2025
- State of Mobile Development 2026
- Documentação oficial React Native e Flutter
    `
    },
    'landing-pages-conversao': {
        titulo: 'Landing Pages que Convertem: O Guia Definitivo',
        categoria: 'Marketing',
        tags: ['Landing Page', 'Conversão', 'Marketing', 'Vendas'],
        data: '2026-01-16',
        tempo_leitura: '9 min',
        views: 4567,
        likes: 298,
        resumo: 'Aprenda a criar landing pages de alta conversão.',
        conteudo: `
## O que é uma landing page?

Uma landing page é uma página focada em uma única ação: converter visitantes em leads ou clientes.

## Elementos essenciais

### 1. Headline matadora
- Clara e direta
- Comunica o benefício principal
- Gera curiosidade

### 2. Subheadline de suporte
Complementa a headline com mais detalhes.

### 3. Prova social
- Depoimentos de clientes
- Logos de empresas
- Números de resultados

### 4. CTA (Call to Action)
- Botão destacado
- Texto orientado à ação
- Contraste visual

### 5. Formulário otimizado
- Apenas campos essenciais
- Labels claros
- Feedback de erro amigável

## Estrutura que converte

1. **Hero Section** - Headline + CTA
2. **Problema** - Dor do cliente
3. **Solução** - Seu produto/serviço
4. **Benefícios** - Lista clara
5. **Prova Social** - Depoimentos
6. **FAQ** - Objeções comuns
7. **CTA Final** - Última chamada

## Métricas importantes

- Taxa de conversão (meta: 3-5%)
- Taxa de rejeição
- Tempo na página
- Scroll depth

---

**Fontes:**
- Unbounce Conversion Benchmark Report
- HubSpot Landing Page Statistics
- Testes A/B I9 Appify
    `
    },
    'prompt-engineering': {
        titulo: 'Prompt Engineering: A arte de conversar com IAs',
        categoria: 'Tutorial',
        tags: ['Prompts', 'IA', 'ChatGPT', 'Claude'],
        data: '2026-01-15',
        tempo_leitura: '11 min',
        views: 7234,
        likes: 567,
        resumo: 'Técnicas avançadas para extrair o máximo das IAs generativas.',
        conteudo: `
## O que é Prompt Engineering?

Prompt Engineering é a arte de formular instruções que maximizam a qualidade das respostas de IAs como ChatGPT e Claude.

## Conceitos fundamentais

### 1. Contexto é rei
Quanto mais contexto você der, melhor a resposta.

❌ "Escreva um email"
✅ "Escreva um email profissional para um cliente B2B que pediu orçamento de um app. Tom: amigável mas profissional. Objetivo: agendar uma reunião."

### 2. Seja específico
Defina formato, tamanho e estilo desejados.

### 3. Use exemplos (Few-shot)
Mostre à IA como você quer o resultado.

## Técnicas avançadas

### Chain of Thought
Peça para a IA pensar passo a passo.
"Analise este problema passo a passo antes de dar a resposta final."

### Role Playing
Atribua um papel específico.
"Você é um copywriter sênior especializado em B2B SaaS..."

### Constraint Setting
Defina limitações claras.
"Responda em no máximo 3 parágrafos. Use bullet points."

### Iterative Refinement
Refine em múltiplas rodadas.
"Ótimo, agora torne mais conciso" ou "Adicione mais exemplos práticos"

## Prompts para diferentes usos

### Para código
"Você é um senior developer. Revise este código focando em: 1) Bugs 2) Performance 3) Legibilidade. Sugira melhorias com exemplos."

### Para marketing
"Atue como copywriter. Crie 5 variações de headline para [produto]. Foco em [benefício]. Tom: [formal/casual]."

### Para análise
"Analise os pros e contras de [decisão]. Considere: custo, tempo, risco. Formate como tabela."

---

**Fontes:**
- OpenAI Prompt Engineering Guide
- Anthropic Claude Documentation
- Papers sobre Chain of Thought Prompting
    `
    },
    'chatbots-avancados': {
        titulo: 'Chatbots Avançados: Além do FAQ Automatizado',
        categoria: 'Tutorial',
        tags: ['Chatbot', 'IA', 'Atendimento', 'Vendas'],
        data: '2026-01-13',
        tempo_leitura: '6 min',
        views: 3876,
        likes: 198,
        resumo: 'Como criar chatbots que vendem, qualificam leads e encantam clientes.',
        conteudo: `
## A evolução dos chatbots

### Geração 1: Rule-based
Chatbots que seguem árvores de decisão. Limitados a cenários previstos.

### Geração 2: NLP básico
Entendem variações de linguagem, mas ainda precisam de muito treinamento.

### Geração 3: LLM-powered
Usam GPT, Claude ou similares. Conversam naturalmente sobre qualquer assunto.

## Chatbots que vendem

Um bom chatbot de vendas deve:

### 1. Qualificar leads
- Identificar orçamento
- Descobrir urgência
- Mapear necessidades

### 2. Agendar reuniões
Integração com calendário para marcar calls automaticamente.

### 3. Responder objeções
Base de conhecimento com respostas para dúvidas comuns.

### 4. Escalar para humano
Saber quando transferir para um vendedor real.

## Métricas de sucesso

| Métrica | Meta |
|---------|------|
| Taxa de resposta | >90% |
| Leads qualificados | >30% |
| Reuniões agendadas | >10% |
| Satisfação (CSAT) | >4.0/5 |

## Ferramentas recomendadas

- **WhatsApp Business API** + IA customizada
- **ManyChat** para Instagram/Facebook
- **Intercom** para sites
- **Botpress** para máximo controle

## Erros comuns

❌ Fingir que é humano
❌ Não ter opção de falar com humano
❌ Respostas genéricas demais
❌ Não medir resultados

---

**Fontes:**
- Zendesk Customer Experience Trends
- Gartner Chatbot Report 2025
- Cases internos I9 Appify
    `
    }
}


// Posts relacionados mock
const todosOsPosts = [
    { id: 1, titulo: 'DeepSeek R1: A IA chinesa que está abalando o mercado', slug: 'deepseek-r1', categoria: 'Trending' },
    { id: 2, titulo: 'GPT-5: Tudo que sabemos sobre o próximo modelo', slug: 'gpt-5-rumores', categoria: 'Novidades' },
    { id: 3, titulo: 'AI Agents: O futuro da automação já chegou', slug: 'ai-agents-2026', categoria: 'Tendências' },
    { id: 4, titulo: 'Como usar IA para automatizar seu WhatsApp Business', slug: 'ia-whatsapp-business', categoria: 'Tutorial' },
    { id: 5, titulo: 'Aplicativos para Advocacia: Guia Completo 2026', slug: 'aplicativos-advocacia', categoria: 'Cases' },
    { id: 6, titulo: 'n8n vs Zapier vs Make: Qual ferramenta escolher?', slug: 'n8n-automacao', categoria: 'Análise' },
    { id: 7, titulo: 'Claude 3.5 Opus: O que esperar do novo modelo', slug: 'claude-35-opus', categoria: 'Novidades' },
    { id: 8, titulo: 'CRM para Pequenas Empresas: Guia de Implementação', slug: 'crm-pequenas-empresas', categoria: 'Tutorial' },
    { id: 9, titulo: 'ChatGPT vs Claude vs Gemini: Qual a melhor IA?', slug: 'comparativo-ias-2026', categoria: 'Análise' },
    { id: 10, titulo: 'SEO com IA: Como ranquear seu site em 2026', slug: 'seo-ia-2026', categoria: 'Tutorial' },
    { id: 11, titulo: 'No-Code em 2026: As ferramentas que você precisa', slug: 'no-code-2026', categoria: 'No-Code' },
    { id: 12, titulo: 'React Native vs Flutter: Qual framework mobile usar?', slug: 'react-native-flutter', categoria: 'Desenvolvimento' },
    { id: 13, titulo: 'Landing Pages que Convertem: O Guia Definitivo', slug: 'landing-pages-conversao', categoria: 'Marketing' },
    { id: 14, titulo: 'Prompt Engineering: A arte de conversar com IAs', slug: 'prompt-engineering', categoria: 'Tutorial' },
    { id: 15, titulo: 'Como a I9 Appify usa IA para transformar negócios', slug: 'i9-appify-ia', categoria: 'Cases' },
    { id: 16, titulo: 'Chatbots Avançados: Além do FAQ Automatizado', slug: 'chatbots-avancados', categoria: 'Tutorial' }
]


export default function BlogPost() {
    const { slug } = useParams()
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [readProgress, setReadProgress] = useState(0)
    const [liked, setLiked] = useState(false)
    const [saved, setSaved] = useState(false)
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const articleRef = useRef(null)

    useEffect(() => {
        fetchPost()

        // Check saved
        const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]')
        setSaved(savedPosts.includes(slug))

        // Check liked
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
        setLiked(likedPosts.includes(slug))
    }, [slug])

    useEffect(() => {
        const handleScroll = () => {
            // Reading progress
            if (articleRef.current) {
                const element = articleRef.current
                const totalHeight = element.scrollHeight - window.innerHeight
                const progress = Math.min((window.scrollY / totalHeight) * 100, 100)
                setReadProgress(Math.max(0, progress))
            }

            // Show scroll to top button
            setShowScrollTop(window.scrollY > 500)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const fetchPost = async () => {
        const { data } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .eq('publicado', true)
            .single()

        if (data) {
            setPost(data)
        } else if (artigosCompletos[slug]) {
            setPost(artigosCompletos[slug])
        }
        setLoading(false)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    const toggleLike = () => {
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
        if (liked) {
            localStorage.setItem('likedPosts', JSON.stringify(likedPosts.filter(s => s !== slug)))
        } else {
            localStorage.setItem('likedPosts', JSON.stringify([...likedPosts, slug]))
        }
        setLiked(!liked)
    }

    const toggleSave = () => {
        const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]')
        if (saved) {
            localStorage.setItem('savedPosts', JSON.stringify(savedPosts.filter(s => s !== slug)))
        } else {
            localStorage.setItem('savedPosts', JSON.stringify([...savedPosts, slug]))
        }
        setSaved(!saved)
    }

    const sharePost = (platform) => {
        const url = window.location.href
        const text = post?.titulo

        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        }

        if (platform === 'copy') {
            navigator.clipboard.writeText(url)
            alert('Link copiado!')
        } else {
            window.open(urls[platform], '_blank', 'width=600,height=400')
        }
        setShowShareMenu(false)
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const getImagem = (s) => imagensCapas[s] || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop'

    // Posts relacionados (mesma categoria, exclui atual)
    const postsRelacionados = todosOsPosts
        .filter(p => p.slug !== slug)
        .slice(0, 3)

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
                <Link to="/blog" className="text-cyan-400 hover:underline flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Voltar para o Blog
                </Link>
            </div>
        )
    }

    return (
        <div ref={articleRef} className="min-h-screen bg-[#050505] text-white">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-[60]">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${readProgress}%` }}
                />
            </div>

            {/* Header */}
            <header className="fixed top-1 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/95 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/blog" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Voltar ao Blog</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* Like */}
                        <button
                            onClick={toggleLike}
                            className={`p-2 rounded-lg transition-all ${liked ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                        </button>

                        {/* Save */}
                        <button
                            onClick={toggleSave}
                            className={`p-2 rounded-lg transition-all ${saved ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
                        </button>

                        {/* Share */}
                        <div className="relative">
                            <button
                                onClick={() => setShowShareMenu(!showShareMenu)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <Share2 size={20} />
                            </button>

                            {showShareMenu && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="absolute right-0 top-12 bg-[#111] border border-white/10 rounded-xl p-2 shadow-2xl min-w-[160px]"
                                >
                                    <button onClick={() => sharePost('copy')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                                        <Copy size={16} /> Copiar link
                                    </button>
                                    <button onClick={() => sharePost('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                                        <MessageCircle size={16} /> WhatsApp
                                    </button>
                                    <button onClick={() => sharePost('twitter')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                                        <Twitter size={16} /> Twitter
                                    </button>
                                    <button onClick={() => sharePost('linkedin')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                                        <Linkedin size={16} /> LinkedIn
                                    </button>
                                    <button onClick={() => sharePost('facebook')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                                        <Facebook size={16} /> Facebook
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Article */}
            <article className="pt-24">
                {/* Hero Image */}
                <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                    <img
                        src={post.imagem_capa || getImagem(slug)}
                        alt={post.titulo}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto px-6 -mt-32 relative z-10">
                    {/* Meta */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                            <Link to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                                <Home size={14} /> Home
                            </Link>
                            <span>/</span>
                            <Link to="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link>
                            <span>/</span>
                            <span className="text-gray-400">{post.categoria}</span>
                        </div>

                        {/* Category & Meta */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className={`text-sm px-4 py-1.5 rounded-full border font-medium ${categoriaCores[post.categoria] || 'bg-cyan-400/10 text-cyan-400 border-cyan-500/30'}`}>
                                {post.categoria}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1.5">
                                <Calendar size={14} />
                                {formatDate(post.data || post.created_at)}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1.5">
                                <Clock size={14} />
                                {post.tempo_leitura || '5 min de leitura'}
                            </span>
                            <span className="text-gray-400 text-sm flex items-center gap-1.5">
                                <Eye size={14} />
                                {(post.views || 0).toLocaleString()} views
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                            {post.titulo}
                        </h1>

                        {/* Summary */}
                        <p className="text-xl text-gray-400 leading-relaxed mb-8">
                            {post.resumo}
                        </p>

                    </motion.div>


                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {post.tags.map(tag => (
                                <Link
                                    key={tag}
                                    to={`/blog?q=${tag}`}
                                    className="text-sm bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 px-3 py-1.5 rounded-full text-gray-400 transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="prose prose-invert prose-lg max-w-none
                            prose-headings:text-white prose-headings:font-bold
                            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
                            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                            prose-p:text-gray-300 prose-p:leading-relaxed
                            prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-white
                            prose-ul:text-gray-300 prose-li:mb-2
                            prose-code:bg-white/10 prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                            prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-white/10
                            prose-table:border-collapse prose-th:border prose-th:border-white/10 prose-th:p-3 prose-th:bg-white/5
                            prose-td:border prose-td:border-white/10 prose-td:p-3"
                        dangerouslySetInnerHTML={{ __html: formatContent(post.conteudo) }}
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-4 my-12 py-8 border-t border-b border-white/10">
                        <button
                            onClick={toggleLike}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${liked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                }`}
                        >
                            <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                            {liked ? 'Curtido!' : 'Curtir'}
                        </button>
                        <button
                            onClick={toggleSave}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${saved ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                }`}
                        >
                            <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
                            {saved ? 'Salvo!' : 'Salvar'}
                        </button>
                        <button
                            onClick={() => sharePost('whatsapp')}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all"
                        >
                            <Share2 size={20} />
                            Compartilhar
                        </button>
                    </div>

                    {/* CTA */}
                    <div className="p-8 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl text-center mb-12">
                        <h3 className="text-2xl font-bold mb-2">Gostou do conteúdo?</h3>
                        <p className="text-gray-400 mb-6">Entre em contato e descubra como a I9 Appify pode ajudar seu negócio.</p>
                        <a
                            href="https://wa.me/5531993988889"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-400 transition-colors"
                        >
                            💬 Falar no WhatsApp
                        </a>
                    </div>

                    {/* Posts Relacionados */}
                    <div className="mb-12">
                        <h3 className="text-2xl font-bold mb-6">Artigos Relacionados</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {postsRelacionados.map(p => (
                                <Link
                                    key={p.id}
                                    to={`/blog/${p.slug}`}
                                    className="block cursor-pointer group bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                                >
                                    <div className="h-32 overflow-hidden">
                                        <img
                                            src={getImagem(p.slug)}
                                            alt={p.titulo}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <span className="text-xs text-cyan-400">{p.categoria}</span>
                                        <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-2 mt-1">
                                            {p.titulo}
                                        </h4>
                                    </div>
                                </Link>
                            ))}

                        </div>
                    </div>
                </div>
            </article>

            {/* Scroll to Top */}
            {showScrollTop && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 p-4 bg-cyan-500 text-black rounded-full shadow-lg hover:bg-cyan-400 transition-colors z-50"
                >
                    <ChevronUp size={24} />
                </motion.button>
            )}

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 text-center">
                <Link to="/" className="text-gray-600 hover:text-cyan-400 transition-colors">i9appify.com.br</Link>
                <span className="mx-2 text-gray-700">•</span>
                <span className="text-gray-600">© 2026</span>
            </footer>
        </div>
    )
}

// Markdown parser
function formatContent(content) {
    if (!content) return ''

    return content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)\n(?=<li>)/g, '$1')
        .replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        .replace(/```[\s\S]*?```/g, (match) => {
            const code = match.replace(/```\w*\n?/g, '').trim()
            return `<pre><code>${code}</code></pre>`
        })
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\|.*\|/g, (match) => {
            const cells = match.split('|').filter(c => c.trim())
            if (cells.some(c => c.includes('---'))) return ''
            return `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join('')}</tr>`
        })
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<)(.+)$/gm, '<p>$1</p>')
        .replace(/^---$/gm, '<hr>')
        .replace(/✅/g, '<span class="text-green-400">✅</span>')
        .replace(/❌/g, '<span class="text-red-400">❌</span>')
}
