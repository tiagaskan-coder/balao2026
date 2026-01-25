import { NextResponse } from 'next/server';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { ids, action, value } = await request.json();

    if (!hasAdmin) {
      return NextResponse.json({ error: 'Configuração ausente: SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
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
      // Percentage update is tricky because price is stored as string "R$ 1.200,00"
      // We need to fetch, calculate and update each one.
      // Or, ideally, we should migrate price to numeric column in DB. 
      // For now, let's fetch all selected products, calculate in JS and update.
      
      const { data: products, error: fetchError } = await supabaseAdmin
        .from('products')
        .select('id, price')
        .in('id', ids);

      if (fetchError) throw fetchError;

      const percentage = parseFloat(value); // e.g. 10 for +10%, -10 for -10%
      
      const updates = products.map((p: { id: string; price: string | number }) => {
        // Parse price string to number
        // "R$ 1.200,00" -> 1200.00
        let priceNum = 0;
        if (typeof p.price === 'string') {
            priceNum = parseFloat(p.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
        } else if (typeof p.price === 'number') {
            priceNum = p.price;
        }
        
        if (isNaN(priceNum)) priceNum = 0;

        // Apply percentage
        const newPriceNum = priceNum * (1 + percentage / 100);

        // Format back to string
        const newPriceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newPriceNum);

        return {
            id: p.id,
            price: newPriceFormatted
        };
      });

      // Perform updates (Supabase doesn't have a bulk update with different values easily exposed in JS client without RPC)
      // We will loop for now, or use upsert if we include all required fields (but we only have id and price).
      // Upsert only works if we have all non-nullable fields or if they have defaults.
      // Safer to loop updates for now since we don't expect thousands of products selected at once.
      
      const updatePromises = updates.map((u: { id: string; price: string }) => 
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
