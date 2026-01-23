import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';
import { Product } from '@/lib/utils';

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const { products } = await request.json();
    
    // In Supabase logic, we usually append/upsert. 
    // If "replace" was needed, we'd delete all first, but let's stick to upsert for safety.
    
    await saveProducts(products);
    return NextResponse.json({ success: true, count: products.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}
