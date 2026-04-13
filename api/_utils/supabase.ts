import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.SUPABASE_URL;
export const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null as any;

export function requireSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Faltan variables de entorno en Vercel. SUPABASE_URL: ${!!supabaseUrl}, SUPABASE_ANON_KEY: ${!!supabaseKey}`);
  }
}
