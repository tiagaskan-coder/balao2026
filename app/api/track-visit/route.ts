import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { page, visitorId } = body;

    if (!visitorId) return NextResponse.json({ success: false }, { status: 400 });

    // Tentar inserir na tabela site_visits
    // Se a tabela não existir, vai falhar, mas ok
    const { error } = await supabaseAdmin
      .from('site_visits')
      .insert({
        page: page,
        visitor_id: visitorId
      });

    if (error) {
       // Se o erro for que a tabela não existe, logar apenas como warning
       if (error.code === '42P01') {
         console.warn("Tabela site_visits não encontrada. Rode o SQL de migração.");
       } else {
         console.error("Erro ao registrar visita:", error);
       }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
