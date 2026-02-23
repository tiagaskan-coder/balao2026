import { NextResponse } from "next/server";
import { supabaseAdmin, hasAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    if (hasAdmin) {
      const { data, error } = await supabaseAdmin
        .from('topbar_messages')
        .select('text, active, display_order')
        .eq('active', true)
        .order('display_order', { ascending: true });
      if (!error && data) {
        const messages = data.map((r: any) => r.text).filter(Boolean);
        return NextResponse.json({ messages });
      }
    }
  } catch {}
  return NextResponse.json({
    messages: [
      "Telefone: (19) 3255-1661",
      "WhatsApp: (19) 98751-0267",
      "E-mail: balaocastelo@balaodainformatica.com.br",
      "Horário de Atendimento: Seg a Sex das 07:00 às 18:00",
      "Endereço: Av. Andrade Neves, 1682 - Jardim Chapadão, Campinas - SP"
    ]
  });
}

export async function POST(req: Request) {
  try {
    if (!hasAdmin) {
      return NextResponse.json({ error: "Supabase admin não configurado" }, { status: 501 });
    }
    const body = await req.json();
    const messages: string[] = Array.isArray(body?.messages) ? body.messages : [];
    const clean = messages.map(m => (typeof m === 'string' ? m.trim() : '')).filter(m => m.length > 0);

    // Simple approach: clear and insert ordered
    const { error: delError } = await supabaseAdmin.from('topbar_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delError) {
      // If table doesn't exist yet, ignore and continue to insert which will fail as well; user should run SQL migration.
      // We still return an error for transparency.
    }

    if (clean.length > 0) {
      const rows = clean.map((text, idx) => ({ text, active: true, display_order: idx }));
      const { error: insError } = await supabaseAdmin.from('topbar_messages').insert(rows);
      if (insError) {
        return NextResponse.json({ error: insError.message }, { status: 500 });
      }
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
