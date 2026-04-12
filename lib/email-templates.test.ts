import { describe, it, expect } from 'vitest';
import { generateEmailHtml, EmailTemplateProduct } from './email-templates';

describe('Email Templates Generation', () => {
  const mockProducts: EmailTemplateProduct[] = [
    {
      id: '1',
      name: 'Produto Teste 1',
      price: 'R$ 100,00',
      image: 'https://via.placeholder.com/150',
      link: 'https://balao.info/produto/1',
      description: 'Descrição do produto 1'
    },
    {
      id: '2',
      name: 'Produto Teste 2',
      price: 'R$ 200,00',
      image: 'https://via.placeholder.com/150',
      link: 'https://balao.info/produto/2',
      description: 'Descrição do produto 2'
    }
  ];

  const baseData = {
    subject: 'Teste Assunto',
    message: 'Mensagem de teste',
    products: mockProducts,
    companyName: 'Balão Teste'
  };

  it('should generate valid HTML for grid template', () => {
    const html = generateEmailHtml('grid', baseData);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Produto Teste 1');
    expect(html).toContain('R$ 100,00');
    expect(html).toContain('display: grid'); // Grid specific check (might be inline style) or structure
    expect(html).toContain('Balão Teste');
  });

  it('should generate valid HTML for list template', () => {
    const html = generateEmailHtml('list', baseData);
    expect(html).toContain('Produto Teste 2');
    expect(html).toContain('R$ 200,00');
    // List specific checks could look for table structures if used
    expect(html).toContain('<table'); 
  });

  it('should generate valid HTML for hero template', () => {
    const html = generateEmailHtml('hero', baseData);
    expect(html).toContain('Produto Teste 1');
    // Hero template highlights the first product
    expect(html).toContain('APROVEITAR OFERTA');
  });

  it('should generate valid HTML for minimal template', () => {
    const html = generateEmailHtml('minimal', baseData);
    expect(html).toContain('Produto Teste 1');
    // Minimal uses list structure
    expect(html).toContain('<ul');
    expect(html).toContain('<li');
  });

  it('should handle empty product list gracefully', () => {
    const html = generateEmailHtml('grid', { ...baseData, products: [] });
    expect(html).toContain('Mensagem de teste');
    // Shouldn't crash
  });

  it('should format message newlines to <br/>', () => {
    const html = generateEmailHtml('grid', { ...baseData, message: 'Line 1\nLine 2' });
    expect(html).toContain('Line 1<br/>Line 2');
  });
});
