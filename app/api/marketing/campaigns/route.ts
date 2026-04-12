
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('marketing_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, subject, content, target_audience, scheduled_at } = body;

    // Determina status inicial
    let status = 'draft';
    if (scheduled_at && new Date(scheduled_at) > new Date()) {
        status = 'scheduled';
    }

    const campaignData = {
      title,
      subject,
      content,
      target_audience,
      scheduled_at: scheduled_at || null,
      status,
      updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
      // Update
      result = await supabaseAdmin
        .from('marketing_campaigns')
        .update(campaignData)
        .eq('id', id)
        .select()
        .single();
    } else {
      // Insert
      result = await supabaseAdmin
        .from('marketing_campaigns')
        .insert(campaignData)
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json(result.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const { error } = await supabaseAdmin
            .from('marketing_campaigns')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
