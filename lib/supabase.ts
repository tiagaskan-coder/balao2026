import { createClient } from '@supabase/supabase-js';

// Fallback values for build time to prevent "supabaseUrl is required" error
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ptqqvezawobgnheesgvh.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_648oVqEwCiNN-nmQMGejyg_o0Iqg2y4";

export const supabase = createClient(supabaseUrl, supabaseKey);
