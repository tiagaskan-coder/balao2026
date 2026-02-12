import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/chat/route';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ order: vi.fn(() => ({ limit: vi.fn(() => ({ data: [] })) })) }))
    }))
  },
  hasAdmin: false
}));

// Mock searchProducts to honor budget param
vi.mock('@/utils/supabase', () => ({
  searchProducts: vi.fn(async (q: string, limit: number, budget?: number) => {
    const items = [
      { id: 'pc1', name: 'PC Gamer Ryzen', price: 9500, description: 'RTX + Ryzen', image: '/pc1.png' },
      { id: 'pc2', name: 'PC Trabalho i5', price: 5200, description: 'Office', image: '/pc2.png' },
      { id: 'pc3', name: 'PC Premium i7', price: 12900, description: 'Topo de linha', image: '/pc3.png' },
    ];
    const filtered = typeof budget === 'number' ? items.filter(i => i.price <= budget) : items;
    return filtered.slice(0, limit);
  })
}));

describe('Chat API - Budget parsing with rulebased engine', () => {
  it('should return items within budget when message contains "até 10.000"', async () => {
    const req = {
      json: async () => ({
        message: 'Quero um pc de até 10.000',
        sessionId: 'sess2',
        engine: 'rulebased',
        fallback: 'supabase'
      })
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(Array.isArray(data.produtos)).toBe(true);
    expect(data.produtos.length).toBeGreaterThan(0);
    expect(Math.max(...data.produtos.map((p: any) => Number(p.price)))).toBeLessThanOrEqual(10000);
    expect(data.fala).toMatch(/Separei/);
  });
});
