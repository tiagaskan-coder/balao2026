import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ptqqvezawobgnheesgvh.supabase.co";
const rawServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY;

const supabaseServiceKey = rawServiceKey || "placeholder_key";

export const hasAdmin = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && rawServiceKey);

if (!hasAdmin) {
  console.warn("Supabase admin não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SERVICE_ROLE_KEY).");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
