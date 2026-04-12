
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { processCampaignSend } from "@/lib/marketing-utils";

export async function GET() {
    try {
        // Buscar campanhas agendadas que já passaram da hora e ainda estão como 'scheduled'
        const { data: campaigns, error } = await supabaseAdmin
            .from('marketing_campaigns')
            .select('id')
            .eq('status', 'scheduled')
            .lte('scheduled_at', new Date().toISOString());

        if (error) throw error;

        if (!campaigns || campaigns.length === 0) {
            return NextResponse.json({ message: "Nenhuma campanha agendada pendente." });
        }

        const results = [];
        for (const camp of campaigns) {
            try {
                const res = await processCampaignSend(camp.id);
                results.push(res);
            } catch (e: any) {
                console.error(`Erro ao processar campanha ${camp.id}:`, e);
                results.push({ campaignId: camp.id, error: e.message });
            }
        }

        return NextResponse.json({ success: true, processed: results });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
