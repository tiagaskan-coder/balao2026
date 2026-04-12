
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/mail";
import { getBaseTemplate } from "@/lib/mail-templates";

export async function processCampaignSend(campaignId: string) {
    // 1. Buscar campanha
    const { data: campaign, error } = await supabaseAdmin
        .from('marketing_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

    if (error || !campaign) throw new Error("Campanha não encontrada");

    // 2. Buscar destinatários
    let query = supabaseAdmin.from('marketing_subscribers').select('email');
    
    // Filtros de audiência
    if (campaign.target_audience === 'buyers' || campaign.target_audience === 'leads') {
        const { data: orders } = await supabaseAdmin
            .from('orders')
            .select('customer_email');
            
        const buyerEmails = orders ? [...new Set(orders.map((o: any) => o.customer_email))] : [];
        
        if (campaign.target_audience === 'buyers') {
             if (buyerEmails.length > 0) {
                 query = query.in('email', buyerEmails);
             } else {
                 return { success: true, sent: 0, failed: 0, campaignId, message: "Nenhum comprador encontrado." };
             }
        } else if (campaign.target_audience === 'leads') {
             if (buyerEmails.length > 0) {
                 // Filtra quem NÃO está na lista de compradores
                 query = query.filter('email', 'not.in', `(${buyerEmails.map(e => `"${e}"`).join(',')})`);
             }
        }
    }

    const { data: subscribers, error: subError } = await query;
    if (subError) throw subError;

    if (!subscribers || subscribers.length === 0) {
        return { success: false, message: "Nenhum destinatário encontrado" };
    }

    // Filter out unsubscribed
    const { data: unsubscribed } = await supabaseAdmin
        .from('unsubscribed_emails')
        .select('email');
    
    const blacklist = new Set((unsubscribed || []).map((u: any) => u.email));
    const finalSubscribers = subscribers.filter((s: { email: string }) => !blacklist.has(s.email));

    if (finalSubscribers.length === 0) {
        return { success: false, message: "Todos os destinatários estão descadastrados." };
    }

    // 3. Atualizar status para 'sending'
    await supabaseAdmin
        .from('marketing_campaigns')
        .update({ status: 'sending', sent_at: new Date().toISOString() })
        .eq('id', campaignId);

    // 4. Enviar e-mails com Chunking
    const emailHtml = getBaseTemplate(campaign.content, campaign.subject); // Base template already handles unsubscribe link logic if we passed email, but here we generate generic HTML.
    // Wait, getBaseTemplate takes (content, title, email).
    // If we generate one HTML for all, we can't pass the specific email for the unsubscribe link.
    // We need to generate the HTML inside the loop OR use a placeholder.
    // For now, let's generate inside the loop or just pass the generic content and let sendEmail (if it used a template engine) handle it.
    // But getBaseTemplate returns a string.
    // Efficient way: Generate base parts, then inject email specific link. 
    // Or just call getBaseTemplate inside the loop. It's fast enough.

    let successCount = 0;
    let failCount = 0;
    const CHUNK_SIZE = 20;
    
    for (let i = 0; i < finalSubscribers.length; i += CHUNK_SIZE) {
        const chunk = finalSubscribers.slice(i, i + CHUNK_SIZE);
        const promises = chunk.map((sub: { email: string }) => {
            const specificHtml = getBaseTemplate(campaign.content, campaign.subject, sub.email);
            return sendEmail({
                to: sub.email,
                subject: campaign.subject,
                html: specificHtml,
                campaignId: campaign.id,
                eventType: 'campaign_blast'
            }).then(res => res.success ? successCount++ : failCount++);
        });
        
        await Promise.all(promises);
        // Small delay to be nice to SMTP server
        if (i + CHUNK_SIZE < finalSubscribers.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // 5. Atualizar status final
    await supabaseAdmin
        .from('marketing_campaigns')
        .update({ status: 'sent' })
        .eq('id', campaignId);

    return { 
        success: true, 
        sent: successCount, 
        failed: failCount,
        campaignId 
    };
}
