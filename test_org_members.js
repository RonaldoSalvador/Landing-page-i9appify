import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'APP I9 APPIFY 2026 02/Landing-page-i9appify-main/.env.local' })
dotenv.config({ path: 'APP I9 APPIFY 2026 02/Landing-page-i9appify-main/.env' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('Faltam credenciais do Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
  console.log('Testando query na tabela org_members...')
  const { data, error } = await supabase
    .from('org_members')
    .select(`
      id,
      role,
      nome,
      email,
      avatar_url,
      is_online,
      ultimo_acesso,
      created_at
    `)
    
  if (error) {
    console.error('ERRO AO BUSCAR ORG_MEMBERS:', error)
  } else {
    console.log('Sucesso! Dados:', data)
  }
}

testQuery()
