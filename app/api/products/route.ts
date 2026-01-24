import { NextResponse } from 'next/server';
import { getProducts, saveProducts, createProduct } from '@/lib/db';


export async function GET() {
  const products = await getProducts();
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
    console.error(e);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}
