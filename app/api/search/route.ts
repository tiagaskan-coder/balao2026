import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  try {
    // Call the Supabase RPC function for full-text search
    const { data: products, error } = await supabase.rpc('search_products_fts', {
      query_text: query,
      limit_count: 10
    });

    if (error) {
      console.error('Search RPC Error:', error);
      // Fallback to basic search if RPC fails (e.g. migration not applied yet)
      // This ensures the site doesn't break while DB updates propagate
      const { data: fallbackData } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);
      
      return NextResponse.json(fallbackData || []);
    }

    return NextResponse.json(products);
  } catch (err) {
    console.error('Search API Error:', err);
    return NextResponse.json([], { status: 500 });
  }
}
