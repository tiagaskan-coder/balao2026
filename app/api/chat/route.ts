import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // System Prompt para dar personalidade
    const systemPrompt = "Você é o assistente virtual do Balão da Informática. Responda em Português do Brasil. Seja útil, breve e atue como um vendedor experiente. Se perguntarem preço, diga que precisa buscar no catálogo.";
    const fullPrompt = `${systemPrompt}\n\nUsuário: ${message}\nAssistente:`;

    // Usando Pollinations.ai (Gratuito, sem API Key)
    // Documentação não-oficial: GET/POST em https://text.pollinations.ai/
    const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Falha ao conectar com o cérebro da IA');
    }

    const text = await response.text();

    return NextResponse.json({
      text: text,
      products: [] // Futuramente podemos integrar a busca do Supabase aqui
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { text: "Desculpe, meu cérebro está um pouco lento agora. Tente novamente." },
      { status: 500 }
    );
  }
}