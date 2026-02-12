import { supabaseAdmin } from "@/lib/supabase-admin";

export interface Seller {
  id: string;
  name: string;
  photo?: string;
  photo_url?: string;
  badge_key?: string | null;
  hired_at: string;
}

export interface Goal {
  id: string;
  type: 'day' | 'week' | 'month';
  target: number;
  prize: string;
  updated_at: string;
}

export interface FlashChallenge {
  id: string;
  title: string;
  prize_value: number;
  active: boolean;
  created_at: string;
}

export async function getGoals(): Promise<Goal[]> {
  const { data } = await supabaseAdmin
    .from('goals')
    .select('*');
  return (data as Goal[]) || [];
}

export async function upsertGoals(goals: Partial<Goal>[]) {
  // Upsert by type
  for (const g of goals) {
    await supabaseAdmin
      .from('goals')
      .upsert({ type: g.type, target: g.target, prize: g.prize }, { onConflict: 'type' });
  }
}

export async function createSeller(seller: Partial<Omit<Seller, 'id'>>) {
  const hired_at = seller.hired_at || new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from('sellers')
    .insert({ name: seller.name, photo: seller.photo, badge_key: seller.badge_key, hired_at })
    .select()
    .single();
  if (error) throw error;
  return data as Seller;
}

export async function getSellers(): Promise<Seller[]> {
  const { data } = await supabaseAdmin
    .from('sellers')
    .select('*')
    .order('created_at', { ascending: true });
  return (data as Seller[]) || [];
}

export async function recordSale(sellerId: string, value: number) {
  const { error } = await supabaseAdmin
    .from('sales')
    .insert({ seller_id: sellerId, value });
  if (error) throw error;
}

export async function addGoogleReview(sellerId: string, bonusValue = 50) {
  const { error } = await supabaseAdmin
    .from('google_reviews')
    .insert({ seller_id: sellerId, bonus_value: bonusValue });
  if (error) throw error;
}

export async function getMonthlyStats() {
  const { data } = await supabaseAdmin
    .from('seller_monthly_stats')
    .select('*');
  return data || [];
}

export async function updateSellerBadge(sellerId: string, badgeKey: string | null) {
  const { error } = await supabaseAdmin
    .from('sellers')
    .update({ badge_key: badgeKey })
    .eq('id', sellerId);
  if (error) throw error;
}

export async function getActiveFlashChallenge(): Promise<FlashChallenge | null> {
  const { data } = await supabaseAdmin
    .from('flash_challenges')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as FlashChallenge) || null;
}

export async function setFlashChallenge(title: string, prizeValue: number) {
  await supabaseAdmin
    .from('flash_challenges')
    .update({ active: false })
    .eq('active', true);
  const { data, error } = await supabaseAdmin
    .from('flash_challenges')
    .insert({ title, prize_value: prizeValue, active: true })
    .select()
    .single();
  if (error) throw error;
  return data as FlashChallenge;
}

export async function clearFlashChallenge() {
  const { error } = await supabaseAdmin
    .from('flash_challenges')
    .update({ active: false })
    .eq('active', true);
  if (error) throw error;
}

export async function getRankingSummary() {
  const sellers = await getSellers();
  const goals = await getGoals();
  const stats = await getMonthlyStats();
  const flashChallenge = await getActiveFlashChallenge();

  const monthGoal = goals.find(g => g.type === 'month');
  const weekGoal = goals.find(g => g.type === 'week');
  const dayGoal = goals.find(g => g.type === 'day');

  // Calculate progress per seller for current month
  const currentMonth = new Date();
  const monthKey = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
  const sellerProgress = sellers.map(s => {
    const totals = stats
      .filter((st: any) => st.seller_id === s.id)
      .sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const current = totals.find((t: any) => new Date(t.month).toISOString() === monthKey);
    const totalWithBonus = current ? Number(current.total_with_bonus) : 0;
    const monthTarget = monthGoal ? Number(monthGoal.target) : 0;
    const progress = monthTarget > 0 ? Math.min(100, Math.round((totalWithBonus / monthTarget) * 100)) : 0;

    // Risk zone: 3 consecutive months without reaching target
    const recent3 = totals.slice(-3);
    const misses = recent3.filter(t => {
      const tg = monthGoal ? Number(monthGoal.target) : 0;
      return Number(t.total_with_bonus) < tg;
    }).length;
    const risk = monthGoal ? (misses >= 3) : false;

    return {
      seller: s,
      month_total: totalWithBonus,
      progress_percent: progress,
      risk_zone: risk
    };
  });

  // Stats: Google reviews count in current month
  const { data: reviewCount } = await supabaseAdmin
    .from('google_reviews')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString());

  // Sales count
  const { data: salesCount } = await supabaseAdmin
    .from('sales')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString());

  return {
    sellers: sellerProgress.sort((a, b) => b.progress_percent - a.progress_percent),
    goals: { day: dayGoal, week: weekGoal, month: monthGoal },
    stats: {
      google_reviews_this_month: (reviewCount as any)?.length ?? 0,
      sales_this_month: (salesCount as any)?.length ?? 0
    },
    flashChallenge
  };
}
