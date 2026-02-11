// Required Dependencies:
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function searchProducts(query: string) {
  // 1. Limpeza da string (remove acentos e espaços extras)
  const cleanedQuery = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  
  if (!cleanedQuery) return [];

  console.log(`🔎 Buscando produtos por: "${cleanedQuery}"`);

  // 2. Tentativa 1: Busca Textual (Full Text Search - Português)
  let { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, description, image_url')
    .textSearch('name', cleanedQuery, { config: 'portuguese', type: 'phrase' })
    .limit(5);

  if (error) {
    console.error('❌ Erro no textSearch:', error);
  }

  // 3. Tentativa 2: Fallback para ILIKE (Busca Parcial)
  if (!products || products.length === 0) {
    console.log('⚠️ Nenhum resultado no textSearch, tentando ILIKE...');
    
    const { data: fallbackProducts, error: fallbackError } = await supabase
      .from('products')
      .select('id, name, price, description, image_url')
      .ilike('name', `%${cleanedQuery}%`)
      .limit(5);

    if (fallbackError) {
        console.error('❌ Erro no ILIKE:', fallbackError);
    }
    
    products = fallbackProducts || [];
  }

  return products || [];
}
