import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';
import { Product } from '@/lib/utils';

export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  try {
    const { products, replace } = await request.json();
    
    let updatedProducts: Product[];
    
    if (replace) {
        updatedProducts = products;
    } else {
        const current = getProducts();
        updatedProducts = [...current, ...products];
    }
    
    saveProducts(updatedProducts);
    return NextResponse.json({ success: true, count: updatedProducts.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
  }
}
