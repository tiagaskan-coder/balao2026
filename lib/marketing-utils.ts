
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

    // 3. Atualizar status para 'sending'
    await supabaseAdmin
        .from('marketing_campaigns')
        .update({ status: 'sending', sent_at: new Date().toISOString() })
        .eq('id', campaignId);

    // 4. Enviar e-mails
    const emailHtml = getBaseTemplate(campaign.content, campaign.subject);
    
    let successCount = 0;
    let failCount = 0;

    const promises = (subscribers || []).map((sub: { email: string }) => 
        sendEmail({
            to: sub.email,
            subject: campaign.subject,
            html: emailHtml,
            campaignId: campaign.id,
            eventType: 'campaign_blast'
        }).then(res => res.success ? successCount++ : failCount++)
    );

    await Promise.all(promises);

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
