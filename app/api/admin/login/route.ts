import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Obter a data atual no fuso horário do Brasil
    const now = new Date();
    // Ajuste para o fuso horário de Brasília (UTC-3)
    // Se o servidor estiver em UTC, subtraímos 3 horas
    // Mas a maneira mais segura é usar Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(now);
    const day = parts.find(p => p.type === 'day')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    
    const dynamicSuffix = `${day}${month}${year}`;
    const expectedPassword = `56676009${dynamicSuffix}`;
    
    // Senha fixa de fallback para facilitar testes (opcional, mas bom ter)
    // const fallbackPassword = "56676009"; 

    if (password === expectedPassword) {
        const response = NextResponse.json({ success: true });
        
        // Set cookie for middleware bypass
        response.cookies.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });
        
        return response;
    }

    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  } catch (e) {
    console.error("Admin login error:", e);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
