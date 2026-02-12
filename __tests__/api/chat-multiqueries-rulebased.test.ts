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

// Mock searchProducts returning items by keyword
vi.mock('@/utils/supabase', () => ({
  searchProducts: vi.fn(async (q: string, limit: number) => {
    const lower = q.toLowerCase();
    if (lower.includes('monitor')) {
      return [
        { id: 'm24', name: 'Monitor 24" Full HD', price: 799.9, description: 'Painel IPS', image: '/mon24.png' },
        { id: 'm27', name: 'Monitor 27" QHD', price: 1299.0, description: 'Painel VA', image: '/mon27.png' }
      ].slice(0, limit);
    }
    if (lower.includes('notebook')) {
      return [
        { id: 'n1', name: 'Notebook i5 8GB 256GB SSD', price: 3299.0, description: 'Tela 15.6"', image: '/nb1.png' },
        { id: 'n2', name: 'Notebook Ryzen 7 16GB 512GB', price: 4999.0, description: 'Tela 15.6"', image: '/nb2.png' }
      ].slice(0, limit);
    }
    if (lower.includes('mouse')) {
      return [
        { id: 'mo1', name: 'Mouse Gamer 7200 DPI', price: 129.9, description: 'RGB', image: '/mouse1.png' },
        { id: 'mo2', name: 'Mouse Office Wireless', price: 89.9, description: 'Silencioso', image: '/mouse2.png' }
      ].slice(0, limit);
    }
    return [];
  })
}));

describe('Chat API - Multiple queries rulebased', () => {
  it('monitor: should return list of monitors', async () => {
    const req = { json: async () => ({ message: 'Quero um monitor', sessionId: 'sA', engine: 'rulebased', fallback: 'supabase' }) } as unknown as Request;
    const res = await POST(req);
    const data = await res.json();
    expect(data.produtos.length).toBeGreaterThan(0);
    expect(data.produtos[0].name).toContain('Monitor');
  });

  it('notebook: should return list of notebooks', async () => {
    const req = { json: async () => ({ message: 'Preciso de notebook', sessionId: 'sB', engine: 'rulebased', fallback: 'supabase' }) } as unknown as Request;
    const res = await POST(req);
    const data = await res.json();
    expect(data.produtos.length).toBeGreaterThan(0);
    expect(data.produtos[0].name).toContain('Notebook');
  });

  it('mouse: should return list of mouses', async () => {
    const req = { json: async () => ({ message: 'Quero um mouse', sessionId: 'sC', engine: 'rulebased', fallback: 'supabase' }) } as unknown as Request;
    const res = await POST(req);
    const data = await res.json();
    expect(data.produtos.length).toBeGreaterThan(0);
    expect(data.produtos[0].name).toContain('Mouse');
  });
});
