// google-places-search.js
// Busca PMEs brasileiras via Google Places API (New) — gratuito
// Uso: node squads/captacao-i9appify/scripts/google-places-search.js
//      --setor=clinica --cidade="São Paulo" --limite=20

import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

// Carregar .env
const env = readFileSync('.env', 'utf-8');
for (const line of env.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && !key.startsWith('#')) process.env[key.trim()] = rest.join('=').trim();
}

const KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!KEY) { console.error('❌ GOOGLE_MAPS_API_KEY não encontrada no .env'); process.exit(1); }

const { values } = parseArgs({
  options: {
    setor:  { type: 'string', default: 'clinica medica' },
    cidade: { type: 'string', default: 'São Paulo' },
    limite: { type: 'string', default: '20' },
  },
  strict: false,
});

// Queries por setor para busca mais precisa
const QUERIES_POR_SETOR = {
  clinica:     'clínica médica',
  advocacia:   'escritório de advocacia',
  imobiliaria: 'imobiliária',
  educacao:    'escola curso treinamento',
  ecommerce:   'loja comércio',
};

const setor = QUERIES_POR_SETOR[values.setor] || values.setor;
const query = `${setor} ${values.cidade}`;
const limite = parseInt(values.limite);

console.log(`\n🔍 Buscando: "${query}" | limite: ${limite}\n`);

async function buscarLeads(textQuery, maxResults) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.businessStatus',
    },
    body: JSON.stringify({
      textQuery,
      languageCode: 'pt-BR',
      maxResultCount: Math.min(maxResults, 20), // API limita a 20 por request
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`${data.error.status}: ${data.error.message}`);
  return data.places || [];
}

try {
  const lugares = await buscarLeads(query, limite);
  console.log(`✅ ${lugares.length} empresas encontradas\n`);

  // Normalizar para formato do squad
  const leads = lugares
    .filter(l => l.businessStatus === 'OPERATIONAL' || !l.businessStatus)
    .map(l => ({
      nome:            l.displayName?.text || '',
      cargo:           'Proprietário / Responsável',
      empresa:         l.displayName?.text || '',
      setor:           values.setor,
      tamanho_empresa: '1-50',
      email:           '',   // Google Places não entrega email — Hunter.io pode enriquecer
      telefone:        l.nationalPhoneNumber || '',
      linkedin_url:    '',
      website:         l.websiteUri || '',
      fonte:           'google_maps',
      fonte_detalhe:   `busca: ${query}`,
      dados_extras: {
        endereco:      l.formattedAddress || '',
        avaliacao:     l.rating || null,
        total_reviews: l.userRatingCount || 0,
      },
    }))
    .filter(l => l.telefone || l.website); // só leads com algum contato

  console.log(`📋 ${leads.length} leads com contato:\n`);
  leads.forEach((l, i) => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Lead #${i+1}`);
    console.log(`Nome:     ${l.empresa}`);
    console.log(`Telefone: ${l.telefone || '—'}`);
    console.log(`Site:     ${l.website || '—'}`);
    console.log(`Endereço: ${l.dados_extras.endereco}`);
    console.log(`Avaliação: ${l.dados_extras.avaliacao || '—'} ⭐ (${l.dados_extras.total_reviews} reviews)`);
  });

  // Salvar output
  writeFileSync(
    'squads/captacao-i9appify/output/leads-brutos.json',
    JSON.stringify(leads, null, 2),
    'utf-8'
  );
  console.log(`\n💾 Salvo em squads/captacao-i9appify/output/leads-brutos.json`);

} catch (err) {
  console.error('❌ Erro:', err.message);
  process.exit(1);
}
