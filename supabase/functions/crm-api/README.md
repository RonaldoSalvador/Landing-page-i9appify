# 🔌 API CRM para ClawdBot - Documentação Completa

## 📡 URL Base da API
```
https://ldqjunoqeepcdctheidd.supabase.co/functions/v1/crm-api
```

## 🔑 API Key
```
i9appify-clawdbot-2024-secret
```

## 🔐 Headers Obrigatórios
```
x-api-key: i9appify-clawdbot-2024-secret
Content-Type: application/json
```

---

## 📋 Endpoints

### 1. LEADS

#### Criar Lead
```http
POST /leads
```
```json
{
  "nome": "João Silva",
  "telefone": "31999998888",
  "email": "joao@email.com",
  "empresa": "Empresa X",
  "necessidade": "App para advocacia"
}
```
**Resposta:**
```json
{
  "success": true,
  "lead": { "id": 123, "nome": "João Silva", ... }
}
```

---

#### Buscar Lead por Telefone
```http
GET /leads/31999998888
```
**Resposta (cliente existe):**
```json
{
  "exists": true,
  "lead": { "id": 123, "nome": "João", "reunioes": [...] }
}
```
**Resposta (não existe):**
```json
{
  "exists": false,
  "lead": null
}
```

---

#### Listar Leads
```http
GET /leads?status=novo&limit=20
```

---

#### Atualizar Lead
```http
PATCH /leads/123
```
```json
{
  "status": "em_negociacao",
  "notas": "Cliente interessado em app"
}
```

---

### 2. INTERAÇÕES

#### Registrar Interação
```http
POST /interacoes
```
```json
{
  "lead_id": 123,
  "tipo": "whatsapp",
  "resumo": "Cliente perguntou sobre preço de app"
}
```

---

#### Ver Histórico
```http
GET /interacoes/123
```

---

### 3. REUNIÕES

#### Agendar Reunião
```http
POST /reunioes
```
```json
{
  "lead_id": 123,
  "titulo": "Reunião App Advocacia",
  "data_hora": "2026-02-05T14:00:00Z",
  "link_meet": "https://meet.google.com/abc-defg-hij"
}
```

---

#### Listar Reuniões
```http
GET /reunioes?status=agendada
```

---

#### Atualizar Reunião
```http
PATCH /reunioes/45
```
```json
{
  "status": "realizada"
}
```

---

### 4. ESTATÍSTICAS

#### Dashboard
```http
GET /stats
```
**Resposta:**
```json
{
  "leads_hoje": 5,
  "leads_semana": 23,
  "reunioes_pendentes": 3,
  "total_leads": 150
}
```

---

## 🚀 Deploy Manual

### Opção A: Via Dashboard do Supabase

1. Acesse: https://supabase.com/dashboard/project/ldqjunoqeepcdctheidd/functions
2. Clique em **"New Function"**
3. Nome: `crm-api`
4. Cole o código do arquivo `supabase/functions/crm-api/index.ts`
5. Clique **Deploy**

### Opção B: Via CLI

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link projeto
supabase link --project-ref ldqjunoqeepcdctheidd

# Deploy
supabase functions deploy crm-api --no-verify-jwt
```

---

## 💬 Exemplo de Fluxo ClawdBot

1. **Cliente manda mensagem**
2. **ClawdBot busca cliente:**
   ```
   GET /leads/31999998888
   ```
3. **Se não existe, cria:**
   ```
   POST /leads { nome, telefone }
   ```
4. **Registra interação:**
   ```
   POST /interacoes { lead_id, tipo: "whatsapp", resumo }
   ```
5. **Se agendar reunião:**
   ```
   POST /reunioes { lead_id, data_hora }
   ```

---

## ✅ Checklist

- [ ] Fazer deploy da Edge Function
- [ ] Configurar API Key no ClawdBot
- [ ] Testar criar lead via API
- [ ] Testar buscar por telefone
- [ ] Configurar skills do ClawdBot
