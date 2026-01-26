
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/mail";
import { getBaseTemplate } from "@/lib/mail-templates";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { email } = await req.json();
    
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const { data: campaign, error } = await supabaseAdmin
        .from('marketing_campaigns')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !campaign) throw new Error("Campanha não encontrada");

    const emailHtml = getBaseTemplate(campaign.content, `[TESTE] ${campaign.subject}`);

    const result = await sendEmail({
        to: email,
        subject: `[TESTE] ${campaign.subject}`,
        html: emailHtml,
        campaignId: campaign.id,
        eventType: 'campaign_test'
    });

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
