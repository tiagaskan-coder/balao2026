import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const hasAdmin = Boolean(supabaseUrl && supabaseServiceKey);

if (!hasAdmin) {
  console.warn("Supabase admin não configurado: defina SUPABASE_SERVICE_ROLE_KEY e NEXT_PUBLIC_SUPABASE_URL.");
}

export const supabaseAdmin = createClient(supabaseUrl || "https://example.supabase.co", supabaseServiceKey || "sb_invalid_key", {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
