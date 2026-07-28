import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
  console.warn(
    '[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. Database calls will fail until BACKEND/.env is configured.',
  )
}

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
