import nodemailer from 'nodemailer';
import { supabaseAdmin } from './supabase-admin';

// Configuração SMTP do Brevo
const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // Geralmente false para porta 587 (STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
};

// Cria o transportador apenas se as credenciais existirem para evitar erros no build/runtime se não configurado
const createTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP_USER ou SMTP_PASS não configurados. O envio de e-mails será simulado.');
        return null;
    }
    return nodemailer.createTransport(smtpConfig);
};

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    campaignId?: string;
    eventType?: string; // Para logs
}

/**
 * Envia um e-mail genérico via SMTP e loga no Supabase
 */
export async function sendEmail({ to, subject, html, eventType = 'general', campaignId }: SendEmailParams) {
    const transporter = createTransporter();
    
    // Log inicial
    console.log(`[Mail] Tentando enviar e-mail para ${to}: ${subject}`);

    try {
        if (!transporter) {
            // Simulação
            await logEmail(eventType, to, 'simulated', 'Credenciais SMTP ausentes', { subject });
            return { success: false, error: 'SMTP não configurado' };
        }

        const info = await transporter.sendMail({
            from: `"Balão Castelo" <${process.env.SMTP_USER}>`, // Remetente padrão
            to,
            subject,
            html,
        });

        console.log(`[Mail] Enviado: ${info.messageId}`);
        
        await logEmail(eventType, to, 'success', null, { messageId: info.messageId, campaignId });
        return { success: true, messageId: info.messageId };

    } catch (error: any) {
        console.error('[Mail] Erro ao enviar:', error);
        await logEmail(eventType, to, 'error', error.message, { subject });
        return { success: false, error: error.message };
    }
}

/**
 * Envia notificação do sistema para o administrador
 */
export async function sendSystemNotification(event: string, data: any) {
    const subject = `[Admin] Novo Evento: ${event}`;
    
    // Formata os dados em HTML simples
    const dataHtml = Object.entries(data)
        .map(([key, value]) => `<strong>${key}:</strong> <pre>${JSON.stringify(value, null, 2)}</pre>`)
        .join('<br>');

    const html = `
        <h2>Nova notificação do sistema</h2>
        <p><strong>Evento:</strong> ${event}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <hr>
        <h3>Detalhes:</h3>
        ${dataHtml}
        <br>
        <p>Este é um e-mail automático do sistema Balão Castelo.</p>
    `;

    return sendEmail({
        to: 'balaocastelo@gmail.com',
        subject,
        html,
        eventType: `system_${event}`
    });
}

/**
 * Loga o evento de e-mail no Supabase
 */
async function logEmail(event: string, recipient: string, status: string, errorMessage: string | null, metadata: any) {
    try {
        await supabaseAdmin.from('marketing_logs').insert({
            event,
            recipient,
            status,
            error_message: errorMessage,
            metadata
        });
    } catch (err) {
        console.error('Erro ao salvar log de e-mail:', err);
    }
}
