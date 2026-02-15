import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.SUPABASE_URL as string;
const supabaseAnon = import.meta.env.SUPABASE_ANON_KEY as string;

export function createServerSupabaseClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnon, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: { persistSession: false },
  });
}
