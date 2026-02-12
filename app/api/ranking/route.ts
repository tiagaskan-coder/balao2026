import { NextResponse } from 'next/server';
import { hasAdmin } from '@/lib/supabase-admin';
import { getRankingSummary, recordSale, addGoogleReview, createSeller, upsertGoals } from '@/lib/ranking';

export async function GET() {
  try {
    const summary = await getRankingSummary();
    return NextResponse.json(summary);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!hasAdmin) {
    return NextResponse.json({ error: 'Admin não configurado' }, { status: 400 });
  }
  try {
    const body = await req.json();
    const { action } = body;
    if (action === 'record_sale') {
      const { sellerId, value } = body;
      await recordSale(sellerId, Number(value));
      return NextResponse.json({ ok: true });
    }
    if (action === 'add_review') {
      const { sellerId, bonusValue } = body;
      await addGoogleReview(sellerId, Number(bonusValue || 50));
      return NextResponse.json({ ok: true });
    }
    if (action === 'create_seller') {
      const { name, photo, hired_at } = body;
      const seller = await createSeller({ name, photo, hired_at });
      return NextResponse.json({ ok: true, seller });
    }
    if (action === 'set_goals') {
      const { goals } = body;
      await upsertGoals(goals || []);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
