import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nbxlcguwdojtdydkqrsq.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceRoleKey && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY WARNING]: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
}

// Server-side privileged client with complete bypass of RLS & revoked public tables
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || 'placeholder-service-key-for-build',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
