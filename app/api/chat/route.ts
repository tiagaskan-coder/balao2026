import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Initialize Groq inside the handler to avoid build-time errors if env var is missing
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("GROQ_API_KEY is missing");
        return NextResponse.json(
            { text: "Erro de configuração: Chave de API não encontrada. Por favor, configure a variável de ambiente GROQ_API_KEY." },
            { status: 500 }
        );
    }

    const groq = new Groq({
        apiKey: apiKey,
    });

    // 1. Buscar produtos no Supabase com base na mensagem do usuário
    const supabase = await createClient();
    
    // Extrair termos de busca simples (remove stop words básicas)
    const searchTerms = message.toLowerCase()
        .replace(/qu[ae]ro|comprar|busco|procur[oa]|preciso|tem|voc[êe]|tem|aí/g, '')
        .trim()
        .split(' ')
        .filter((t: string) => t.length > 2)
        .slice(0, 3) // Limitar a 3 termos para não estourar a query
        .join(' & ');

    let products: any[] = [];
    
    if (searchTerms) {
        // Busca usando Full Text Search ou ILIKE simples como fallback
        const { data, error } = await supabase
            .from('products')
            .select('id, name, price, description, image_url')
            .textSearch('name', searchTerms, { type: 'websearch', config: 'english' }) // Tenta busca inteligente
            .limit(3);
        
        if (!error && data && data.length > 0) {
            products = data;
        } else {
             // Fallback: Tentar ILIKE no primeiro termo se a busca textual falhar
             const firstTerm = searchTerms.split('&')[0].trim();
             if (firstTerm) {
                 const { data: dataIlike } = await supabase
                    .from('products')
                    .select('id, name, price, description, image_url')
                    .ilike('name', `%${firstTerm}%`)
                    .limit(3);
                 if (dataIlike) products = dataIlike;
             }
        }
    }

    // 2. Montar contexto para o LLM
    let productContext = "";
    if (products.length > 0) {
        productContext = "\n\nProdutos encontrados no catálogo que podem interessar ao usuário:\n" + 
            products.map(p => `- ${p.name}: R$ ${p.price.toFixed(2)}`).join("\n");
    }

    // System Prompt para dar personalidade
    const systemPrompt = `Você é o assistente de voz do Balão da Informática.
    
    SUA MISSÃO: Vender produtos de informática. Aja como um vendedor consultivo experiente.
    
    REGRAS CRÍTICAS DE RESPOSTA (Latência Baixa):
    1. Responda em UMA única frase curta sempre que possível.
    2. NUNCA use listas, bullet points ou formatação complexa. O texto será falado.
    3. CONSULTIVO: Se o usuário pedir algo genérico (ex: "quero um notebook"), PERGUNTE o uso (ex: "Para jogos, estudo ou trabalho?") antes de sugerir.
    4. OFERTA: USE APENAS os produtos listados no contexto abaixo. Se a lista estiver vazia, diga que não encontrou exatamente isso no momento e pergunte se pode ajudar com outra coisa. NUNCA INVENTE PREÇOS OU PRODUTOS.
    5. Seja coloquial, rápido e direto. Não seja robótico.
    
    Contexto de produtos:${productContext}`;
    
    // 3. Consultar LLM (Groq)
    const completion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: message
            }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
        max_tokens: 150,
        top_p: 1,
        stream: false,
        stop: null
    });

    const text = completion.choices[0]?.message?.content || "Desculpe, não entendi.";

    return NextResponse.json({
      text: text,
      products: products // Retorna os produtos para o frontend exibir cards
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { text: "Desculpe, meu cérebro está um pouco lento agora. Tente novamente." },
      { status: 500 }
    );
  }
}
