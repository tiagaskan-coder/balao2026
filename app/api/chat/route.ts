import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

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
    const systemPrompt = `Você é o assistente virtual do Balão da Informática. Responda em Português do Brasil.
    
    SUA MISSÃO: Atuar como um VENDEDOR CONSULTIVO.
    
    1. FASE DE DESCOBERTA: Se o usuário pedir algo genérico (ex: "quero um notebook"), NÃO ofereça produtos imediatamente. PERGUNTE primeiro: "Para qual uso? Jogos, trabalho ou estudos?" ou "Qual sua faixa de preço?".
    2. FASE DE OFERTA: Assim que entender a necessidade ou se o usuário for específico, APRESENTE os produtos da lista abaixo com entusiasmo. Fale o nome e o preço.
    3. FINALIZAÇÃO: Sempre tente fechar a venda após apresentar.
    
    REGRAS DE VOZ:
    - Use frases CURTAS e DIRETAS (otimizado para fala).
    - Não use listas longas ou textos complexos.
    - Seja simpático mas focado em vender.
    `;
    
    const fullPrompt = `${systemPrompt}${productContext}\n\nUsuário: ${message}\nAssistente (Vendedor Consultivo):`;

    // 3. Consultar LLM (Pollinations.ai)
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Falha ao conectar com o cérebro da IA');
    }

    const text = await response.text();

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