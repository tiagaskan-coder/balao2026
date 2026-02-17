'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { Vendedor, ArenaConfig, EventoMidia } from './types';

// Inicializa o cliente Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
  const vendas_atual = parseFloat(formData.get('vendas_atual') as string);

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
