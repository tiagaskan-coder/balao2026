import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/chat/route';
import { NextResponse } from 'next/server';

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ order: vi.fn(() => ({ limit: vi.fn(() => ({ data: [] })) })) }))
    }))
  },
  hasAdmin: false
}));

vi.mock('@/utils/supabase', () => ({
  searchProducts: vi.fn(async (q: string, limit: number) => {
    if (q.includes('monitor')) {
      return [
        { id: 'p1', name: 'Monitor 24"', price: 799.9, description: 'Full HD', image: '/img1.png' },
        { id: 'p2', name: 'Monitor 27"', price: 1299.0, description: 'QHD', image: '/img2.png' }
      ].slice(0, limit);
    }
    return [];
  })
}));

describe('Chat API - Rulebased Engine', () => {
  it('should return friendly pt-BR text and products with rulebased engine', async () => {
    const req = {
      json: async () => ({
        message: 'Quero um monitor',
        sessionId: 'sess1',
        engine: 'rulebased',
        fallback: 'supabase'
      })
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res instanceof NextResponse).toBe(true);
    expect(data.fala).toMatch(/Separei/);
    expect(Array.isArray(data.produtos)).toBe(true);
    expect(data.produtos.length).toBeGreaterThan(0);
  });

  it('should ask for details when no products found', async () => {
    const req = {
      json: async () => ({
        message: 'Produto inexistente',
        sessionId: 'sess1',
        engine: 'rulebased',
        fallback: 'supabase'
      })
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(data.fala).toMatch(/Não encontrei itens/);
    expect(Array.isArray(data.produtos)).toBe(true);
  });
});
