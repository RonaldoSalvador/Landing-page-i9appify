# Product Requirements Document (PRD) - SaaS Central i9Appify

## Visão Geral
O i9Appify SaaS Central é uma plataforma web (CRM) responsiva, desenvolvida em React + Vite e Tailwind CSS v4, que permite que organizações (PMEs) gerenciem seus Leads, Agentes IA, Canais de Comunicação (WhatsApp via Evolution API ou Z-API), e Equipes Humanas.

## Recursos e Telas (Features)
- `/`: **Login Opcional** (A barreira de entrada real está no `/crm`, página inicial redireciona para lá).
- `/crm`: **Dashboard**. Exibe estatísticas gerais e blocos interativos.
- `/crm/atendimentos`: **Bate-Papo**. Painel de chat (estilo web) em tempo real que consome as conversas (`conversations`) e mensagens do Supabase.
- `/crm/canais`: **Canais**. Gerenciamento de números de telefone e credenciais. 
- `/crm/agentes`: **Agentes IA**. Grid de Agentes virtuais, onde o usuário pode alterar as instruções (Prompt).
- `/crm/time`: **Time de Agentes**. Demonstra a orquestração e relação dos agentes (Clone Ronaldo, Luna) similar a CrewAI.
- `/crm/disparos`: **Campanhas**. Permite criar campanhas ativas em massa para contatos (Lead gen).
- `/crm/atendentes`: **Atendentes Humanos**. Adição de novos usuários para a Organization (tabela org_members).
- `/crm/storage`: **Storage**. Uploade visualização de imagens/arquivos.

## Infraestrutura
- Usa Supabase para Autenticação e Banco de Dados (`leads`, `agents`, `channels`, `org_members`, etc).

## Requisitos de Teste Visual Frontend
- A interface de navegação (Sidebar) deve colapsar de forma suave e correta.
- O Tailwind v4 Dynamic Coloring (ex: bg-red-500, bg-green-500) precisa estar visivelmente renderizado na seção de Agentes.
- Os modais de edição em `Agents`, `Channels` e `Atendentes` devem abrir, focar os campos e fechar adequadamente sem quebrar o z-index.
