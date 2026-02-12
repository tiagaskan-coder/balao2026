// Required Dependencies:
// npm install groq-sdk

import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { searchProducts } from '@/utils/supabase';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';

const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

export async function POST(req: Request) {
  let message = '';
  let products: any[] = [];
  let sessionId = '';
  let maxResults = 5;
  let engine = 'groq';
  let fallback = 'supabase';

  try {
    const body = await req.json();
    message = body.message || '';
    sessionId = body.sessionId || '';
    engine = body.engine || engine;
    fallback = body.fallback || fallback;

    // Extração simples de orçamento (ex.: "até 10.000", "10000", "R$ 10.000")
    const numMatches = (message || '').replace(/r\$\s*/gi, '').match(/\d{1,3}(\.\d{3})*(,\d+)?|\d+(,\d+)?/g);
    let budget: number | undefined = undefined;
    if (numMatches && numMatches.length > 0) {
      // Pega o maior número como orçamento
      const nums = numMatches.map(n => {
        const cleaned = n.replace(/\./g, '').replace(',', '.');
        return Number(cleaned);
      }).filter(v => !Number.isNaN(v));
      if (nums.length > 0) {
        budget = Math.max(...nums);
      }
    }

    // 0. Configurações do assistente (limite de resultados)
    if (hasAdmin) {
      try {
        const { data } = await supabaseAdmin
          .from('assistant_settings')
          .select('max_results, engine, fallback_strategy')
          .eq('key', 'default')
          .single();
        if (data && typeof data.max_results === 'number') {
          maxResults = data.max_results;
        }
        if (data && typeof data.engine === 'string') {
          engine = data.engine;
        }
        if (data && typeof data.fallback_strategy === 'string') {
          fallback = data.fallback_strategy;
        }
      } catch {}
    }

    // 1. Camada de Dados: Busca produtos antes de chamar a IA
    // Preferir supabaseAdmin no backend para evitar problemas de RLS/credenciais
    if (hasAdmin) {
      const cleanedQuery = (message || '').trim();
      const normalizedQuery = cleanedQuery
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 2);

      // Tentativa 1: FTS em name_description
      let builder = supabaseAdmin
        .from('products')
        .select('id, name, price, description, image');
      if (typeof budget === 'number' && !Number.isNaN(budget)) {
        builder = builder.lte('price', budget);
      }
      let ftsProducts: any[] = [];
      try {
        const { data, error } = await builder
          .textSearch('name_description', cleanedQuery, { config: 'portuguese', type: 'websearch' })
          .limit(maxResults);
        if (!error && data) ftsProducts = data;
      } catch {}

      if (ftsProducts && ftsProducts.length > 0) {
        products = ftsProducts;
      } else {
        // Tentativa 2: ILIKE AND por termos no campo name
        let q = supabaseAdmin
          .from('products')
          .select('id, name, price, description, image');
        if (typeof budget === 'number' && !Number.isNaN(budget)) {
          q = q.lte('price', budget);
        }
        if (terms.length > 0) {
          for (const term of terms) {
            q = q.ilike('name', `%${term}%`);
          }
        } else {
          q = q.ilike('name', `%${normalizedQuery}%`);
        }
        const { data } = await q.limit(maxResults);
        products = data || [];
      }
    } else {
      // Fallback para client anon
      products = await searchProducts(message, maxResults, budget);
    }
    if ((!products || products.length === 0) && fallback === 'site') {
      try {
        const { data: latest } = await supabaseAdmin
          .from('products')
          .select('id, name, price, description, image')
          .order('created_at', { ascending: false })
          .limit(maxResults);
        products = latest || [];
      } catch {}
    }

    // 1.1 Motor de IA: se engine for "rulebased" ou chave ausente, usa lógica gratuita
    if (engine === 'rulebased' || !groq) {
      const fala =
        products && products.length > 0
          ? `Separei ${products.length} opção(ões) com ótimo custo-benefício. Posso te detalhar o melhor agora.`
          : `Não encontrei itens com essa descrição. Pode me dizer marca ou categoria?`;
      return NextResponse.json({ fala, produtos: products || [] });
    }

    const productContext = products.length > 0 
      ? JSON.stringify(products.map(p => ({ id: p.id, name: p.name, price: p.price, description: p.description })))
      : "Nenhum produto encontrado.";

    // 1.1 Memória de sessão: histórico recente
    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    if (hasAdmin && sessionId) {
      try {
        const { data } = await supabaseAdmin
          .from('assistant_messages')
          .select('role, content')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(15);
        if (Array.isArray(data)) {
          history = data as any;
        }
      } catch {}
    }

    // 2. Camada de Inteligência: Gera resposta estruturada
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `
            Você é o assistente virtual do "Balão da Informática".
            OBJETIVO: Vender produtos e tirar dúvidas.
            
            CONTEXTO DE DADOS (Resultados da busca):
            ${productContext}

            Linguagem: Português brasileiro natural, humano, acolhedor, sem jargões; não soe como robô.
            Instruções:
            1. Analise a pergunta do usuário e os produtos encontrados.
            2. Se houver produtos, destaque até 2 opções com preço e benefício.
            3. Se NÃO houver produtos, peça mais detalhes gentilmente para refinar a busca.
            4. Responda com frases curtas (máx. 2 frases faladas), tom de conversa.

            FORMATO JSON OBRIGATÓRIO:
            {"fala":"<texto pt-BR>", "produtos": <lista de produtos do contexto ou vazia>}
          `
        },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 250
    });

    const rawContent = completion.choices[0].message.content || '{}';
    let jsonResponse;
    
    try {
      jsonResponse = JSON.parse(rawContent);
    } catch (e) {
      // Fallback caso a IA não retorne JSON
      jsonResponse = {
        fala: rawContent,
        produtos: products
      };
    }

    // Garante que a lista de produtos seja a real do banco, caso a IA alucine
    if (!jsonResponse.produtos || jsonResponse.produtos.length === 0) {
      jsonResponse.produtos = products;
    }

    // 3. Persistência da memória da sessão
    if (hasAdmin && sessionId) {
      try {
        await supabaseAdmin.from('assistant_messages').insert([
          { session_id: sessionId, role: 'user', content: message },
          { session_id: sessionId, role: 'assistant', content: jsonResponse.fala || '' }
        ]);
      } catch {}
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error('❌ Erro na Camada de Inteligência:', error);
    
    // Tratamento de Erro solicitado
    return NextResponse.json({
      fala: "Estou com instabilidade, mas aqui estão os produtos que encontrei.",
      produtos: products // Retorna os produtos que conseguiu buscar antes do erro
    });
  }
}
