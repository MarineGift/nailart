import { createClient } from '@supabase/supabase-js'

// Use provided Supabase credentials
const supabaseUrl = 'https://hkqudtzlgzohxhevvcem.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcXVkdHpsZ3pvaHhoZXZ2Y2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDI5MjEsImV4cCI6MjA3MDc3ODkyMX0.vxoTrmuZPt6sMaz7nD21qkTXTJIzWctkbziLNLV_89M'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Force use service key to bypass RLS completely
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { 
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
})

console.log('Supabase client initialized with service key')

// Export anon client for client-side operations if needed
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)