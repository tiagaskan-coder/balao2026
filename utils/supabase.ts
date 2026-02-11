// Required Dependencies:
// npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL: Supabase credentials missing in environment variables!');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
} else {
  console.log('✅ Supabase Client Initialized with URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function searchProducts(query: string) {
  // 1. Limpeza básica da query
  const cleanedQuery = query.trim();
  
  if (!cleanedQuery) return [];

  console.log(`🔎 Buscando produtos por: "${cleanedQuery}"`);

  // 2. Tentativa 1: Busca Textual Otimizada (Full Text Search) na coluna 'name_description'
  // Usamos 'websearch' que lida melhor com input natural do usuário (ex: "monitor gamer" vira "monitor & gamer")
  let { data: products, error } = await supabase
    .from('products')
    .select('id, name, price, description, image') // Corrigido: image_url -> image
    .textSearch('name_description', cleanedQuery, { config: 'portuguese', type: 'websearch' })
    .limit(5);

  if (error) {
    console.warn('⚠️ Erro no textSearch (pode ser falta de índice/coluna):', error.message);
  }

  // Se encontrou produtos via FTS, retorna
  if (products && products.length > 0) {
      console.log(`✅ Encontrados ${products.length} produtos via FTS.`);
      return products;
  }

  console.log('⚠️ Nenhum resultado no FTS ou erro, tentando Fallback ILIKE Inteligente...');

  // 3. Tentativa 2: Fallback ILIKE Inteligente (Todas as palavras devem estar presentes - AND)
  // Remove acentos para o ILIKE pois o banco pode não estar normalizado nesse aspecto
  const normalizedQuery = cleanedQuery
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
    
  const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 2); // Ignora palavras muito curtas
  
  if (terms.length > 0) {
      let queryBuilder = supabase
          .from('products')
          .select('id, name, price, description, image'); // Corrigido: image_url -> image
      
      // Adiciona um ILIKE para cada termo (AND logico)
      terms.forEach(term => {
          queryBuilder = queryBuilder.ilike('name', `%${term}%`);
      });
      
      const { data: fallbackData, error: fallbackError } = await queryBuilder.limit(5);
      
      if (!fallbackError && fallbackData && fallbackData.length > 0) {
          console.log(`✅ Encontrados ${fallbackData.length} produtos via ILIKE (AND).`);
          return fallbackData;
      }
  }

  // 4. Tentativa 3: Fallback Final (Busca Genérica - OR)
  // Se não achou com todas as palavras, tenta achar com PELO MENOS UMA palavra (para não retornar vazio)
  // Ou busca pela string original simples
  console.log('⚠️ Tentando último recurso (ILIKE simples)...');
  
  const { data: finalFallback } = await supabase
      .from('products')
      .select('id, name, price, description, image') // Corrigido: image_url -> image
      .ilike('name', `%${normalizedQuery}%`)
      .limit(5);

  return finalFallback || [];
}
