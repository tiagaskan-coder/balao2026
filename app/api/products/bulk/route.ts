import { NextResponse } from 'next/server';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { ids, action, value } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    if (!hasAdmin) {
      return NextResponse.json({ error: 'Configuração ausente: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    if (action === 'update_category') {
      const { error } = await supabaseAdmin
        .from('products')
        .update({ category: value })
        .in('id', ids);

      if (error) throw error;

      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === 'update_price') {
      const { data: products, error: fetchError } = await supabaseAdmin
        .from('products')
        .select('id, price')
        .in('id', ids);

      if (fetchError) throw fetchError;

      const percentage = parseFloat(value);

      const updates = products.map(p => {
        let priceNum = 0;
        if (typeof p.price === 'string') {
          priceNum = parseFloat(p.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
        } else if (typeof p.price === 'number') {
          priceNum = p.price;
        }
        if (isNaN(priceNum)) priceNum = 0;

        const newPriceNum = priceNum * (1 + percentage / 100);
        const newPriceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newPriceNum);
        return { id: p.id, price: newPriceFormatted };
      });

      const updatePromises = updates.map(u =>
        supabaseAdmin.from('products').update({ price: u.price }).eq('id', u.id)
      );
      await Promise.all(updatePromises);

      return NextResponse.json({ success: true, count: ids.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update products' }, { status: 500 });
  }
}
