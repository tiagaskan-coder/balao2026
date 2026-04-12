
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('marketing_subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, source } = body;

    // Se for array (importação em massa)
    if (Array.isArray(body)) {
        const { error } = await supabaseAdmin
            .from('marketing_subscribers')
            .upsert(
                body.map((s: any) => ({ 
                    email: s.email, 
                    name: s.name, 
                    source: s.source || 'import',
                    updated_at: new Date().toISOString()
                })), 
                { onConflict: 'email' }
            );
            
        if (error) throw error;
        return NextResponse.json({ success: true, count: body.length });
    }

    // Único
    const { data, error } = await supabaseAdmin
      .from('marketing_subscribers')
      .upsert({ email, name, source }, { onConflict: 'email' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const { error } = await supabaseAdmin
            .from('marketing_subscribers')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
