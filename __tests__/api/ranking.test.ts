import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from '@/app/api/ranking/route';

vi.mock('@/lib/supabase-admin', () => ({
  hasAdmin: true
}));

vi.mock('@/lib/ranking', () => ({
  getRankingSummary: vi.fn(async () => ({
    sellers: [{ seller: { id: 's1', name: 'Alice' }, month_total: 1000, progress_percent: 50, risk_zone: false }],
    goals: { day: { target: 500, prize: 'Guloseimas' }, week: { target: 5000, prize: 'Vale' }, month: { target: 20000, prize: 'Grande Prêmio' } },
    stats: { google_reviews_this_month: 3, sales_this_month: 20 }
  })),
  recordSale: vi.fn(async () => {}),
  addGoogleReview: vi.fn(async () => {}),
  createSeller: vi.fn(async () => ({ id: 's1' })),
  upsertGoals: vi.fn(async () => {})
}));

describe('Ranking API', () => {
  it('GET returns summary', async () => {
    const res = await GET();
    const json = await res.json();
    expect(Array.isArray(json.sellers)).toBe(true);
    expect(json.goals.month.target).toBe(20000);
  });

  it('POST record_sale', async () => {
    const req = { json: async () => ({ action: 'record_sale', sellerId: 's1', value: 1234 }) } as Request;
    const res = await POST(req);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});
