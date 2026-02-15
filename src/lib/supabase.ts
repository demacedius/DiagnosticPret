import { createClient } from '@supabase/supabase-js';

const supabaseUrl      = import.meta.env.SUPABASE_URL as string;
const serviceRoleKey   = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string;

export function createServerSupabaseClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
