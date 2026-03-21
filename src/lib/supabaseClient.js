import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ldqjunoqeepcdctheidd.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkcWp1bm9xZWVwY2RjdGhlaWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3ODgwODcsImV4cCI6MjA0NjM2NDA4N30.kwp0BHM3xcAsTZGXsigGnQ18JL9eX78Xu_WZZh-y2DI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

