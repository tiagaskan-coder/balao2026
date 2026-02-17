'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { Vendedor, ArenaConfig } from './types';

// --- Vendedores ---

export async function getVendedores(): Promise<Vendedor[]> {
  const { data, error } = await supabaseAdmin
    .from('arena_vendedores')
    .select('*')
    .order('vendas_atual', { ascending: false });

  if (error) {
    console.error('Erro ao buscar vendedores:', error);
    return [];
  }

  return data as Vendedor[];
}

export async function criarVendedor(formData: FormData) {
  const nome = formData.get('nome') as string;
  const avatar_url = formData.get('avatar_url') as string;
  const veiculo_emoji = formData.get('veiculo_emoji') as string || '🚗';
  const meta_valor = parseFloat(formData.get('meta_valor') as string) || 0;

  const { error } = await supabaseAdmin
    .from('arena_vendedores')
    .insert({
      nome,
      avatar_url: avatar_url || null,
      veiculo_emoji,
      meta_valor,
      vendas_atual: 0
    });

  if (error) throw new Error('Erro ao criar vendedor: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

export async function atualizarVendedor(id: string, formData: FormData) {
  const nome = formData.get('nome') as string;
  const avatar_url = formData.get('avatar_url') as string;
  const veiculo_emoji = formData.get('veiculo_emoji') as string;
  const meta_valor = parseFloat(formData.get('meta_valor') as string);
  const vendas_atual = parseFloat(formData.get('vendas_atual') as string);

  const { error } = await supabaseAdmin
    .from('arena_vendedores')
    .update({
      nome,
      avatar_url: avatar_url || null,
      veiculo_emoji,
      meta_valor,
      vendas_atual
    })
    .eq('id', id);

  if (error) throw new Error('Erro ao atualizar vendedor: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

export async function adicionarVenda(id: string, valorAdicional: number) {
  // Busca o valor atual primeiro para garantir consistência (ou usa procedure RPC se preferir atômico, mas aqui vamos de simples leitura+escrita por enquanto)
  const { data: vendedor, error: fetchError } = await supabaseAdmin
    .from('arena_vendedores')
    .select('vendas_atual')
    .eq('id', id)
    .single();

  if (fetchError || !vendedor) throw new Error('Vendedor não encontrado');

  const novoTotal = (vendedor.vendas_atual || 0) + valorAdicional;

  const { error } = await supabaseAdmin
    .from('arena_vendedores')
    .update({ vendas_atual: novoTotal })
    .eq('id', id);

  if (error) throw new Error('Erro ao adicionar venda: ' + error.message);
  
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

export async function removerVendedor(id: string) {
  const { error } = await supabaseAdmin
    .from('arena_vendedores')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Erro ao remover vendedor: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

export async function resetarVendas() {
  const { error } = await supabaseAdmin
    .from('arena_vendedores')
    .update({ vendas_atual: 0 });

  if (error) throw new Error('Erro ao resetar vendas: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

// --- Configuração ---

export async function getConfig(): Promise<ArenaConfig | null> {
  const { data, error } = await supabaseAdmin
    .from('arena_config')
    .select('*')
    .single();

  if (error) {
    // Se não existir, tenta criar
    if (error.code === 'PGRST116') {
      return { id: 1, ativo: false, titulo: 'Arena de Vendas', atualizado_em: new Date().toISOString() };
    }
    console.error('Erro ao buscar config:', error);
    return null;
  }

  return data as ArenaConfig;
}

export async function toggleArena(ativo: boolean) {
  const { error } = await supabaseAdmin
    .from('arena_config')
    .upsert({ id: 1, ativo })
    .select();

  if (error) throw new Error('Erro ao alterar status da arena: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

export async function atualizarTitulo(titulo: string) {
  const { error } = await supabaseAdmin
    .from('arena_config')
    .upsert({ id: 1, titulo })
    .select();

  if (error) throw new Error('Erro ao alterar título: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}
