import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        const targets = ["balaocastelo@gmail.com", "tiagaskan@gmail.com"];
        if (email) targets.push(email);

        const uniqueTargets = [...new Set(targets)];

        const results = await Promise.all(uniqueTargets.map(to => 
            sendEmail({
                to,
                subject: "Teste de Integração de E-mail - Balão Castelo",
                html: "<h1>Teste de E-mail</h1><p>Se você recebeu este e-mail, o sistema de envio está funcionando corretamente via Gmail SMTP.</p>",
                eventType: "test_email"
            })
        ));

        return NextResponse.json({ 
            success: true, 
            results,
            env: {
                user: process.env.SMTP_USER ? "Configured" : "Missing",
                pass: process.env.SMTP_PASS ? "Configured" : "Missing"
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
