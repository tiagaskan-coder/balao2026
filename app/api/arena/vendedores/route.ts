import { NextResponse } from 'next/server';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    if (!hasAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin não configurado' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('arena_vendedores')
      .select('id, nome, avatar_url, veiculo_emoji')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar vendedores:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar vendedores' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro inesperado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
