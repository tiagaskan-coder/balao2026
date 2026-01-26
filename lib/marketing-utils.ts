
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
    if (campaign.target_audience === 'buyers') {
        // query = query.eq('is_buyer', true); 
    }
    // TODO: Adicionar mais filtros conforme necessidade

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

    const promises = subscribers.map(sub => 
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
