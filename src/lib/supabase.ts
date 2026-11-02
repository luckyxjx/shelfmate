import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  !envUrl.includes('your-project') &&
  envUrl.startsWith('http')
)

const supabaseUrl = isSupabaseConfigured
  ? envUrl!
  : 'https://placeholder.supabase.co'

const supabaseAnonKey = isSupabaseConfigured
  ? envKey!
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
