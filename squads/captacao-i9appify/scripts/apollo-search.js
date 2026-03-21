// apollo-search.js
// Busca leads no Apollo.io e retorna lista para o squad captacao-i9appify
// Uso: node apollo-search.js [--setor=saude] [--cargo=CEO] [--limite=50]

import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

// Carregar .env manualmente (sem dependência extra)
function loadEnv() {
  try {
    const env = readFileSync(new URL('../../../../.env', import.meta.url), 'utf-8');
    for (const line of env.split('\n')) {
      const [key, ...rest] = line.split('=');
      if (key && !key.startsWith('#')) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    }
  } catch {
    console.error('❌ .env não encontrado. Crie o arquivo na raiz do projeto.');
    process.exit(1);
  }
}

loadEnv();

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
if (!APOLLO_API_KEY) {
  console.error('❌ APOLLO_API_KEY não encontrada no .env');
  process.exit(1);
}

// Filtros padrão I9Appify ICP
const DEFAULT_FILTERS = {
  cargos: ['CEO', 'Founder', 'Co-Founder', 'Dono', 'Sócio', 'Diretor', 'Gerente Comercial'],
  setores: ['Health', 'Legal', 'Real Estate', 'Education', 'E-Commerce'],
  pais: 'BR',
  tamanho_min: 1,
  tamanho_max: 50,
  limite: 50,
};

async function buscarLeads(filtros = {}) {
  const config = { ...DEFAULT_FILTERS, ...filtros };

  console.log('🔭 Buscando leads no Apollo.io...');
  console.log('Filtros:', JSON.stringify(config, null, 2));

  const body = {
    api_key: APOLLO_API_KEY,
    page: 1,
    per_page: config.limite,
    person_titles: config.cargos,
    organization_num_employees_ranges: [`${config.tamanho_min},${config.tamanho_max}`],
    person_locations: [config.pais],
    q_organization_industry_tag_ids: [],  // Apollo usa IDs internos para setores
    contact_email_status: ['verified', 'guessed'],
  };

  try {
    const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const erro = await response.text();
      console.error(`❌ Apollo API erro ${response.status}:`, erro);
      process.exit(1);
    }

    const data = await response.json();
    const pessoas = data.people || [];

    console.log(`✅ ${pessoas.length} leads encontrados`);

    // Normalizar para o formato do squad
    const leads = pessoas.map((p) => ({
      nome: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      cargo: p.title || '',
      empresa: p.organization?.name || '',
      setor: p.organization?.industry || '',
      tamanho_empresa: p.organization?.estimated_num_employees?.toString() || '',
      email: p.email || '',
      telefone: p.phone_numbers?.[0]?.raw_number || '',
      linkedin_url: p.linkedin_url || '',
      website: p.organization?.website_url || '',
      fonte: 'apollo',
      fonte_detalhe: `busca: ${config.cargos.join(', ')} | ${config.setores.join(', ')}`,
      dados_extras: {
        apollo_id: p.id,
        cidade: p.city || '',
        estado: p.state || '',
        pais: p.country || '',
      },
    }));

    // Salvar output
    const outputPath = new URL('../output/leads-brutos.json', import.meta.url);
    writeFileSync(outputPath, JSON.stringify(leads, null, 2), 'utf-8');
    console.log(`💾 Salvo em output/leads-brutos.json`);

    return leads;
  } catch (err) {
    console.error('❌ Erro ao chamar Apollo:', err.message);
    process.exit(1);
  }
}

// Executar
const { values } = parseArgs({
  options: {
    setor:  { type: 'string' },
    cargo:  { type: 'string' },
    limite: { type: 'string' },
  },
  strict: false,
});

await buscarLeads({
  ...(values.limite && { limite: parseInt(values.limite) }),
});
