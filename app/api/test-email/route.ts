
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        
        // Verifica o que está configurado
        const configStatus = {
            resend: !!process.env.RESEND_API_KEY,
            smtp: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
            adminEmail: process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'balaocastelo@gmail.com'
        };

        const targets = [configStatus.adminEmail];
        if (email) targets.push(email);

        const uniqueTargets = [...new Set(targets)];

        console.log(`[Test Email] Iniciando teste para: ${uniqueTargets.join(', ')}`);
        console.log(`[Test Email] Configuração:`, configStatus);

        const results = await Promise.all(uniqueTargets.map(to => 
            sendEmail({
                to,
                subject: "Teste de Integração de E-mail - Balão Castelo",
                html: `
                    <h1>Teste de E-mail</h1>
                    <p>Se você recebeu este e-mail, o sistema de envio está funcionando corretamente.</p>
                    <hr>
                    <h3>Diagnóstico de Configuração:</h3>
                    <ul>
                        <li><strong>Resend API Key:</strong> ${configStatus.resend ? '✅ Configurado' : '❌ Ausente'}</li>
                        <li><strong>SMTP (Gmail):</strong> ${configStatus.smtp ? '✅ Configurado' : '❌ Ausente'}</li>
                    </ul>
                    <p><em>Este e-mail foi enviado via: ${process.env.RESEND_API_KEY ? 'Resend' : (configStatus.smtp ? 'SMTP' : 'Simulação')}</em></p>
                `,
                eventType: "test_email"
            })
        ));

        return NextResponse.json({ 
            success: true, 
            results,
            config: configStatus,
            message: "Teste finalizado. Verifique os logs e sua caixa de entrada."
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
