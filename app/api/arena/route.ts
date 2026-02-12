import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Seller = {
  id: string;
  nome: string;
  avatar_url: string | null;
  meta_valor: number | null;
  criado_em: string;
};

type Sale = {
  id: string;
  vendedor_id: string;
  valor: number;
  is_google_bonus: boolean;
  criado_em: string;
};

type Challenge = {
  id: string;
  premio_semana: string;
  meta_global: number;
  criado_em: string;
};

const calculateTotals = (sales: Sale[]) => {
  return sales.reduce<Record<string, number>>((acc, sale) => {
    const delta = Number(sale.valor || 0) + (sale.is_google_bonus ? 100 : 0);
    acc[sale.vendedor_id] = (acc[sale.vendedor_id] || 0) + delta;
    return acc;
  }, {});
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const full = searchParams.get("full") === "1";
    const { data: sellers, error: sellersError } = await supabaseAdmin
      .from("vendedores")
      .select("*")
      .order("criado_em", { ascending: true });
    if (sellersError) throw sellersError;

    const { data: challenges, error: challengesError } = await supabaseAdmin
      .from("arena_desafios")
      .select("*")
      .order("criado_em", { ascending: false });
    if (challengesError) throw challengesError;

    const salesQuery = supabaseAdmin
      .from("vendas")
      .select("*")
      .order("criado_em", { ascending: false });

    const { data: salesFeed, error: salesFeedError } = full
      ? await salesQuery
      : await salesQuery.limit(30);
    if (salesFeedError) throw salesFeedError;

    const { data: allSales, error: allSalesError } = await supabaseAdmin
      .from("vendas")
      .select("id, vendedor_id, valor, is_google_bonus, criado_em");
    if (allSalesError) throw allSalesError;

    const totals = calculateTotals((allSales || []) as Sale[]);
    const activeChallenge = (challenges && challenges[0]) || null;

    return NextResponse.json({
      sellers: (sellers || []) as Seller[],
      challenges: (challenges || []) as Challenge[],
      activeChallenge,
      salesFeed: (salesFeed || []) as Sale[],
      totals
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body as { action: string };

    if (action === "create_seller") {
      const { nome, avatar_url, meta_valor } = body as {
        nome: string;
        avatar_url?: string | null;
        meta_valor?: number | null;
      };
      const { data, error } = await supabaseAdmin
        .from("vendedores")
        .insert({
          nome,
          avatar_url: avatar_url || null,
          meta_valor: meta_valor ?? null
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === "update_seller") {
      const { id, updates } = body as {
        id: string;
        updates: Partial<Omit<Seller, "id" | "criado_em">>;
      };
      const { data, error } = await supabaseAdmin
        .from("vendedores")
        .update({
          nome: updates.nome,
          avatar_url: updates.avatar_url ?? null,
          meta_valor: updates.meta_valor ?? null
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === "delete_seller") {
      const { id } = body as { id: string };
      const { error } = await supabaseAdmin
        .from("vendedores")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "create_sale") {
      const { vendedor_id, valor, is_google_bonus } = body as {
        vendedor_id: string;
        valor: number;
        is_google_bonus: boolean;
      };
      const { data, error } = await supabaseAdmin
        .from("vendas")
        .insert({
          vendedor_id,
          valor,
          is_google_bonus
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === "update_sale") {
      const { id, updates } = body as {
        id: string;
        updates: Partial<Omit<Sale, "id" | "criado_em">>;
      };
      const { data, error } = await supabaseAdmin
        .from("vendas")
        .update({
          vendedor_id: updates.vendedor_id,
          valor: updates.valor,
          is_google_bonus: updates.is_google_bonus
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === "delete_sale") {
      const { id } = body as { id: string };
      const { error } = await supabaseAdmin
        .from("vendas")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (action === "create_challenge") {
      const { premio_semana, meta_global } = body as {
        premio_semana: string;
        meta_global: number;
      };
      const { data, error } = await supabaseAdmin
        .from("arena_desafios")
        .insert({
          premio_semana,
          meta_global
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === "update_challenge") {
      const { id, updates } = body as {
        id: string;
        updates: Partial<Omit<Challenge, "id" | "criado_em">>;
      };
      const { data, error } = await supabaseAdmin
        .from("arena_desafios")
        .update({
          premio_semana: updates.premio_semana,
          meta_global: updates.meta_global
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === "delete_challenge") {
      const { id } = body as { id: string };
      const { error } = await supabaseAdmin
        .from("arena_desafios")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
