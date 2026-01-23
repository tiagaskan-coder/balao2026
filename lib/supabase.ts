import { createClient } from '@supabase/supabase-js';

// Fallback values for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ptqqvezawobgnheesgvh.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_648oVqEwCiNN-nmQMGejyg_o0Iqg2y4";

// Ensure client creation doesn't crash even with invalid keys
let client;
try {
    client = createClient(supabaseUrl, supabaseKey);
} catch (error) {
    console.error("Supabase initialization error:", error);
    // Fallback dummy client to prevent app crash
    client = {
        from: () => ({
            select: async () => ({ data: [], error: { message: "Client init failed" } }),
            upsert: async () => ({ error: { message: "Client init failed" } })
        })
    } as any;
}

export const supabase = client;
