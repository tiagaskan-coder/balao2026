import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { processCampaignSend } from "@/lib/marketing-utils";

export const dynamic = 'force-dynamic'; // Ensure it's not cached

export async function GET(req: Request) {
    try {
        // 1. Verify Authorization (optional but recommended for cron jobs)
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new NextResponse('Unauthorized', { status: 401 });
        // }

        // 2. Find scheduled campaigns that are due
        const now = new Date().toISOString();
        const { data: campaigns, error } = await supabaseAdmin
            .from('marketing_campaigns')
            .select('id, title')
            .eq('status', 'scheduled')
            .lte('scheduled_at', now);

        if (error) throw error;

        if (!campaigns || campaigns.length === 0) {
            return NextResponse.json({ message: "No campaigns to send" });
        }

        // 3. Process each campaign
        const results = await Promise.all(
            campaigns.map(async (camp: { id: string, title: string }) => {
                try {
                    return await processCampaignSend(camp.id);
                } catch (err: any) {
                    // Log error but continue
                    console.error(`Failed to send campaign ${camp.id}:`, err);
                    await supabaseAdmin
                        .from('marketing_campaigns')
                        .update({ status: 'failed' }) // Or keep scheduled to retry? Better to fail to avoid loops.
                        .eq('id', camp.id);
                    return { campaignId: camp.id, error: err.message };
                }
            })
        );

        return NextResponse.json({ 
            success: true, 
            processed: campaigns.length,
            results 
        });

    } catch (error: any) {
        console.error("Cron error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}