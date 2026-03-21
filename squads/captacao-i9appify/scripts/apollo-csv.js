// apollo-csv.js
// Lê o CSV exportado do Apollo.io e normaliza para o formato do squad
// Uso: node squads/captacao-i9appify/scripts/apollo-csv.js [--arquivo=meu-export.csv]

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: { arquivo: { type: 'string', default: 'apollo-export.csv' } },
  strict: false,
});

const INPUT_PATH  = `squads/captacao-i9appify/input/${values.arquivo}`;
const OUTPUT_PATH = 'squads/captacao-i9appify/output/leads-brutos.json';

// Verificar se arquivo existe
if (!existsSync(INPUT_PATH)) {
  console.error(`❌ Arquivo não encontrado: ${INPUT_PATH}`);
  console.error('   Exporte o CSV do Apollo e salve em squads/captacao-i9appify/input/');
  process.exit(1);
}

console.log(`📂 Lendo ${INPUT_PATH}...`);
const raw = readFileSync(INPUT_PATH, 'utf-8');

// Parser CSV simples (sem dependências externas)
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

  return lines.slice(1).map(line => {
    // Lidar com campos que contêm vírgula dentro de aspas
    const cols = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; continue; }
      if (char === ',' && !inQuotes) { cols.push(current.trim()); current = ''; continue; }
      current += char;
    }
    cols.push(current.trim());

    return Object.fromEntries(headers.map((h, i) => [h, cols[i] || '']));
  });
}

const rows = parseCSV(raw);
console.log(`📊 ${rows.length} linhas encontradas no CSV`);

// Mapeamento de colunas Apollo → formato interno
// O Apollo pode exportar com nomes ligeiramente diferentes dependendo da região
function mapRow(row) {
  // Tentar múltiplas variações de nome de coluna
  const get = (...keys) => {
    for (const k of keys) {
      const val = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()] || '';
      if (val) return val;
    }
    return '';
  };

  const firstName = get('First Name', 'first_name', 'Nome');
  const lastName  = get('Last Name',  'last_name',  'Sobrenome');
  const nome      = `${firstName} ${lastName}`.trim();
  const email     = get('Email', 'email', 'E-mail');
  const telefone  = get('Phone', 'phone', 'Mobile Phone', 'Work Direct Phone', 'Telefone');

  return {
    nome,
    cargo:            get('Title', 'title', 'Job Title', 'Cargo'),
    empresa:          get('Company', 'company', 'Company Name', 'Empresa'),
    setor:            get('Industry', 'industry', 'Setor'),
    tamanho_empresa:  get('# Employees', 'employees', 'Company Size', 'Funcionários'),
    email,
    telefone,
    linkedin_url:     get('LinkedIn Url', 'linkedin_url', 'LinkedIn', 'Person Linkedin Url'),
    website:          get('Website', 'website', 'Company Website', 'Company Domain'),
    fonte:            'apollo',
    fonte_detalhe:    'exportação manual apollo.io',
    _email_ok:        email.includes('@'),
    _tel_ok:          telefone.length > 5,
    _nome_ok:         nome.length > 1,
  };
}

const todos    = rows.map(mapRow);
const validos  = todos.filter(l => l._nome_ok && (l._email_ok || l._tel_ok));
const ignorados = todos.length - validos.length;

// Remover campos internos de controle
const leads = validos.map(({ _email_ok, _tel_ok, _nome_ok, ...lead }) => lead);

console.log(`✅ ${leads.length} leads válidos`);
if (ignorados > 0) {
  console.log(`⚠️  ${ignorados} ignorados (sem nome ou sem email/telefone)`);
}

// Salvar output
writeFileSync(OUTPUT_PATH, JSON.stringify(leads, null, 2), 'utf-8');
console.log(`💾 Salvo em ${OUTPUT_PATH}`);

// Preview dos primeiros 5
console.log('\n📋 Primeiros leads:');
leads.slice(0, 5).forEach((l, i) => {
  console.log(`  ${i + 1}. ${l.nome} | ${l.cargo} | ${l.empresa} | ${l.email || l.telefone}`);
});
