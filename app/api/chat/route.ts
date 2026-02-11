// Required Dependencies:
// npm install groq-sdk

import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { searchProducts } from '@/utils/supabase';

const apiKey = process.env.GROQ_API_KEY;
const groq = apiKey ? new Groq({ apiKey }) : null;

export async function POST(req: Request) {
  let message = '';
  let products: any[] = [];

  try {
    const body = await req.json();
    message = body.message || '';

    // 1. Camada de Dados: Busca produtos antes de chamar a IA
    products = await searchProducts(message);

    if (!groq) throw new Error('Groq API Key missing');

    const productContext = products.length > 0 
      ? JSON.stringify(products.map(p => ({ id: p.id, name: p.name, price: p.price })))
      : "Nenhum produto encontrado.";

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

            INSTRUÇÕES:
            1. Analise a pergunta do usuário e os produtos encontrados.
            2. Se houver produtos, destaque o melhor preço ou característica.
            3. Se NÃO houver produtos, peça mais detalhes gentilmente.
            4. Responda em Português, de forma curta (max 2 frases faladas).

            FORMATO JSON OBRIGATÓRIO:
            {
              "fala": "Texto para síntese de voz",
              "produtos": [ ...lista original de produtos... ]
            }
          `
        },
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
