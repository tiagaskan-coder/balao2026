'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Vendedor, ArenaConfig, EventoMidia, Venda } from './types';

// Inicializa o cliente Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// --- Vendas (Histórico) ---

export async function getVendasRecentes(limit = 50): Promise<Venda[]> {
  const { data, error } = await supabaseAdmin
    .from('arena_vendas')
    .select('*, vendedor:arena_vendedores(*)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar vendas:', error);
    return [];
  }
  
  // Mapeia para garantir a estrutura correta (Supabase retorna array em joins as vezes)
  return data.map((v: any) => ({
    ...v,
    vendedor: Array.isArray(v.vendedor) ? v.vendedor[0] : v.vendedor
  })) as Venda[];
}

export async function removerVenda(vendaId: string) {
  // 1. Busca a venda para saber o valor e o vendedor
  const { data: venda, error: fetchError } = await supabaseAdmin
    .from('arena_vendas')
    .select('*')
    .eq('id', vendaId)
    .single();

  if (fetchError || !venda) throw new Error('Venda não encontrada');

  // 2. Busca o vendedor atual
  const { data: vendedor, error: vendError } = await supabaseAdmin
    .from('arena_vendedores')
    .select('vendas_atual')
    .eq('id', venda.vendedor_id)
    .single();

  if (vendError || !vendedor) throw new Error('Vendedor não encontrado');

  // 3. Subtrai o valor (garante não ficar negativo)
  const novoTotal = Math.max(0, (vendedor.vendas_atual || 0) - venda.valor);

  // 4. Atualiza vendedor
  const { error: updateError } = await supabaseAdmin
    .from('arena_vendedores')
    .update({ vendas_atual: novoTotal })
    .eq('id', venda.vendedor_id);

  if (updateError) throw new Error('Erro ao atualizar total do vendedor');

  // 5. Remove a venda do histórico
  const { error: deleteError } = await supabaseAdmin
    .from('arena_vendas')
    .delete()
    .eq('id', vendaId);

  if (deleteError) throw new Error('Erro ao remover registro de venda');

  // 6. Se tiver pedido associado, cancela o pedido
  if (venda.order_id) {
    const { error: cancelOrderError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', venda.order_id);
      
    if (cancelOrderError) {
      console.error('Erro ao cancelar pedido associado:', cancelOrderError);
      // Não lança erro aqui para não impedir a remoção da venda no Arena,
      // mas loga para investigação
    }
  }

  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

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
  const veiculo_emoji = formData.get('veiculo_emoji') as string;
  const meta_valor = parseFloat(formData.get('meta_valor') as string);
  
  // Se vier vendas_atual, usa, senão 0
  const vendas_atual_raw = formData.get('vendas_atual');
  const vendas_atual = vendas_atual_raw ? parseFloat(vendas_atual_raw as string) : 0;

  const { error } = await supabaseAdmin
    .from('arena_vendedores')
    .insert({
      nome,
      avatar_url,
      veiculo_emoji,
      meta_valor,
      vendas_atual
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
      avatar_url,
      veiculo_emoji,
      meta_valor,
      vendas_atual
    })
    .eq('id', id);

  if (error) throw new Error('Erro ao atualizar vendedor: ' + error.message);
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

export async function adicionarVenda(id: string, valor: number) {
  // Busca vendedor atual para somar
  const { data: vendedor, error: fetchError } = await supabaseAdmin
    .from('arena_vendedores')
    .select('vendas_atual')
    .eq('id', id)
    .single();

  if (fetchError || !vendedor) throw new Error('Vendedor não encontrado');

  const novaVenda = (vendedor.vendas_atual || 0) + valor;

  // 1. Atualiza total
  const { error } = await supabaseAdmin
    .from('arena_vendedores')
    .update({ vendas_atual: novaVenda })
    .eq('id', id);

  if (error) throw new Error('Erro ao adicionar venda: ' + error.message);

  // 2. Registra histórico
  await supabaseAdmin
    .from('arena_vendas')
    .insert({
      vendedor_id: id,
      valor: valor
    });

  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

export async function resetarVendas() {
  // 1. Limpa histórico
  await supabaseAdmin
    .from('arena_vendas')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Zera totais
  const { error } = await supabaseAdmin
    .from('arena_vendedores')
    .update({ vendas_atual: 0 })
    .neq('id', '00000000-0000-0000-0000-000000000000'); 

  if (error) throw new Error('Erro ao resetar vendas: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

// --- Configuração ---

export async function getConfig(): Promise<ArenaConfig | null> {
  const { data, error } = await supabaseAdmin
    .from('arena_config')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar config:', error);
    return null;
  }

  return data as ArenaConfig;
}

export async function atualizarConfig(formData: FormData) {
  const titulo = formData.get('titulo') as string;
  const ativo = formData.get('ativo') === 'true';

  // Verifica se já existe config
  const config = await getConfig();

  let error;
  if (config) {
    const result = await supabaseAdmin
      .from('arena_config')
      .update({ titulo, ativo, atualizado_em: new Date().toISOString() })
      .eq('id', config.id);
    error = result.error;
  } else {
    const result = await supabaseAdmin
      .from('arena_config')
      .insert({ titulo, ativo });
    error = result.error;
  }

  if (error) throw new Error('Erro ao atualizar config: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

// --- Eventos de Mídia ---

export async function getEventosMidia(): Promise<EventoMidia[]> {
  const { data, error } = await supabaseAdmin
    .from('arena_eventos_midia')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar eventos de mídia:', error);
    return [];
  }

  return data as EventoMidia[];
}

export async function criarEventoMidia(formData: FormData) {
  const evento_tipo = formData.get('evento_tipo') as string;
  const gif_url = formData.get('gif_url') as string;
  const titulo = formData.get('titulo') as string;
  const mensagem_template = formData.get('mensagem_template') as string;

  const { error } = await supabaseAdmin
    .from('arena_eventos_midia')
    .insert({
      evento_tipo,
      gif_url,
      titulo,
      mensagem_template,
      ativo: true
    });

  if (error) throw new Error('Erro ao criar evento de mídia: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

export async function atualizarEventoMidia(id: string, formData: FormData) {
  const evento_tipo = formData.get('evento_tipo') as string;
  const gif_url = formData.get('gif_url') as string;
  const titulo = formData.get('titulo') as string;
  const mensagem_template = formData.get('mensagem_template') as string;
  const ativo = formData.get('ativo') === 'true';

  const { error } = await supabaseAdmin
    .from('arena_eventos_midia')
    .update({
      evento_tipo,
      gif_url,
      titulo,
      mensagem_template,
      ativo
    })
    .eq('id', id);

  if (error) throw new Error('Erro ao atualizar evento de mídia: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}

export async function removerEventoMidia(id: string) {
  const { error } = await supabaseAdmin
    .from('arena_eventos_midia')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Erro ao remover evento de mídia: ' + error.message);
  revalidatePath('/arena/admin');
  revalidatePath('/arena');
}
