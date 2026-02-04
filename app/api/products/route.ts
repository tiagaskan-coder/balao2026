import { NextResponse } from 'next/server';
import { getProducts, saveProducts, createProduct, getPaginatedProducts, getAllFilteredProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const categories = searchParams.getAll('category'); // Support multiple categories
  const search = searchParams.get('search');
  const tags = searchParams.get('tags');

  // Check if any pagination or filtering params are present
  if (page || limit || categories.length > 0 || search || tags) {
      // If limit is explicitly 'all' or not provided but filters exist, fetch all
      if (limit === 'all' || (!limit && (categories.length > 0 || search || tags))) {
          const data = await getAllFilteredProducts({
              categories: categories.length > 0 ? categories : undefined,
              search: search || undefined,
              tags: tags ? tags.split(',') : undefined
          });
          return NextResponse.json(data);
      }

      const pageNum = parseInt(page || '1');
      const limitNum = parseInt(limit || '20');
      
      const data = await getPaginatedProducts(pageNum, limitNum, { 
          categories: categories.length > 0 ? categories : undefined,
          search: search || undefined,
          tags: tags ? tags.split(',') : undefined
      });
      return NextResponse.json(data);
  }

  const products = await getAllFilteredProducts(); // Use getAllFilteredProducts for consistency
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Check if bulk import
    if (body.products && Array.isArray(body.products)) {
        await saveProducts(body.products);
        return NextResponse.json({ success: true, count: body.products.length });
    }

    // Single product creation
    const newProduct = await createProduct(body);
    return NextResponse.json(newProduct);

  } catch (e) {
    console.error("API Error:", e);
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
