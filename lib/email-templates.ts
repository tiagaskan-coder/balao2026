
export interface EmailTemplateProduct {
  id: string;
  name: string;
  price: string;
  image: string;
  link: string;
  description?: string;
}

export type TemplateType = 'grid' | 'list' | 'hero' | 'minimal';

export const EMAIL_TEMPLATES: { id: TemplateType; name: string; description: string }[] = [
  { id: 'grid', name: 'Grade de Ofertas', description: 'Ideal para muitos produtos. Exibe em grade de 2 colunas.' },
  { id: 'list', name: 'Lista Detalhada', description: 'Imagem à esquerda, detalhes à direita. Ótimo para descrições longas.' },
  { id: 'hero', name: 'Destaque Único', description: 'Um produto grande em destaque seguido por outros menores.' },
  { id: 'minimal', name: 'Minimalista', description: 'Foco no texto, produtos discretos.' },
];

export function generateEmailHtml(
  template: TemplateType,
  data: {
    subject: string;
    message: string;
    products: EmailTemplateProduct[];
    logoUrl?: string;
    primaryColor?: string;
    companyName?: string;
    address?: string;
  }
): string {
  const {
    message,
    products,
    logoUrl = "https://www.balao.info/logo-red.png", // Fallback
    primaryColor = "#E60012",
    companyName = "Balão da Informática",
    address = "Campinas - SP"
  } = data;

  const styles = `
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: ${primaryColor}; padding: 20px; text-align: center; }
    .header img { height: 40px; }
    .content { padding: 30px 20px; }
    .message { font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 30px; }
    .btn { display: inline-block; padding: 10px 20px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
    .footer { background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; }
    .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .product-card { border: 1px solid #eee; border-radius: 8px; overflow: hidden; text-align: center; padding-bottom: 15px; background: white; }
    .product-img { width: 100%; height: 200px; object-fit: contain; background: #fff; }
    .product-title { font-size: 14px; margin: 10px 0; padding: 0 10px; height: 40px; overflow: hidden; }
    .product-price { font-size: 18px; font-weight: bold; color: ${primaryColor}; margin-bottom: 10px; }
    
    /* List Template Specific */
    .product-list-item { display: flex; gap: 15px; border-bottom: 1px solid #eee; padding: 15px 0; align-items: center; }
    .product-list-img { width: 120px; height: 120px; object-fit: contain; border: 1px solid #eee; border-radius: 4px; }
    .product-list-info { flex: 1; text-align: left; }

    /* Hero Template */
    .hero-product { text-align: center; background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 2px solid ${primaryColor}; }
    .hero-img { max-width: 100%; height: 300px; object-fit: contain; margin-bottom: 15px; }
    .hero-title { font-size: 24px; margin: 10px 0; }
    .hero-price { font-size: 28px; color: ${primaryColor}; font-weight: bold; margin: 15px 0; }
  `;

  let productsHtml = '';

  if (template === 'grid') {
    // Para email clients antigos que não suportam grid, usamos tabelas
    // Mas para simplificar aqui, vou usar display: inline-block com width 48%
    productsHtml = `
      <div style="text-align: center;">
        ${products.map(p => `
          <div style="display: inline-block; width: 46%; vertical-align: top; margin: 1.5%; border: 1px solid #eee; border-radius: 8px; padding-bottom: 15px; background: white; text-align: center;">
            <a href="${p.link}" style="text-decoration: none; color: inherit;">
              <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 180px; object-fit: contain; border-bottom: 1px solid #eee; margin-bottom: 10px;" />
              <div style="padding: 0 10px;">
                <h3 style="font-size: 14px; margin: 5px 0; color: #333; height: 38px; overflow: hidden;">${p.name}</h3>
                <p style="font-size: 18px; font-weight: bold; color: ${primaryColor}; margin: 8px 0;">${p.price}</p>
                <span style="background: ${primaryColor}; color: white; padding: 8px 15px; border-radius: 4px; font-size: 12px; text-decoration: none; display: inline-block;">Ver Oferta</span>
              </div>
            </a>
          </div>
        `).join('')}
      </div>
    `;
  } else if (template === 'list') {
    productsHtml = `
      <div>
        ${products.map(p => `
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-bottom: 1px solid #eee; margin-bottom: 20px; padding-bottom: 20px;">
            <tr>
              <td width="130" valign="top">
                <a href="${p.link}">
                  <img src="${p.image}" alt="${p.name}" style="width: 120px; height: 120px; object-fit: contain; border: 1px solid #eee; border-radius: 4px;" />
                </a>
              </td>
              <td valign="top" style="padding-left: 15px;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px;"><a href="${p.link}" style="color: #333; text-decoration: none;">${p.name}</a></h3>
                <p style="font-size: 20px; font-weight: bold; color: ${primaryColor}; margin: 0 0 15px 0;">${p.price}</p>
                <a href="${p.link}" style="background: ${primaryColor}; color: white; padding: 8px 20px; border-radius: 4px; text-decoration: none; font-size: 14px;">Comprar Agora</a>
              </td>
            </tr>
          </table>
        `).join('')}
      </div>
    `;
  } else if (template === 'hero') {
    const hero = products[0];
    const others = products.slice(1);
    
    productsHtml = '';
    
    if (hero) {
      productsHtml += `
        <div style="background: #fff; border: 2px solid ${primaryColor}; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
          <a href="${hero.link}" style="text-decoration: none; color: inherit;">
            <img src="${hero.image}" alt="${hero.name}" style="max-width: 100%; height: 300px; object-fit: contain; margin-bottom: 15px;" />
            <h2 style="font-size: 22px; margin: 10px 0; color: #333;">${hero.name}</h2>
            <p style="font-size: 32px; font-weight: bold; color: ${primaryColor}; margin: 15px 0;">${hero.price}</p>
            <span style="background: ${primaryColor}; color: white; padding: 12px 30px; border-radius: 6px; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block;">APROVEITAR OFERTA</span>
          </a>
        </div>
      `;
    }
    
    if (others.length > 0) {
      productsHtml += `
        <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; color: #555;">Outras Ofertas</h3>
        <div style="text-align: center;">
          ${others.map(p => `
            <div style="display: inline-block; width: 30%; vertical-align: top; margin: 1%; border: 1px solid #eee; border-radius: 6px; padding: 10px; background: white;">
              <a href="${p.link}" style="text-decoration: none; color: inherit;">
                <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 120px; object-fit: contain; margin-bottom: 10px;" />
                <h4 style="font-size: 12px; margin: 5px 0; height: 32px; overflow: hidden; color: #333;">${p.name}</h4>
                <p style="font-size: 14px; font-weight: bold; color: ${primaryColor}; margin: 5px 0;">${p.price}</p>
              </a>
            </div>
          `).join('')}
        </div>
      `;
    }
  } else { // minimal
    productsHtml = `
      <ul style="list-style: none; padding: 0;">
        ${products.map(p => `
          <li style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
            <a href="${p.link}" style="text-decoration: none; color: #333; display: block;">
              <span style="font-weight: bold; font-size: 16px;">${p.name}</span>
              <span style="float: right; color: ${primaryColor}; font-weight: bold;">${p.price}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    `;
  }

  // Tratamento de quebras de linha na mensagem
  const formattedMessage = message ? message.replace(/\n/g, '<br/>') : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.subject}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div class="header" style="background-color: ${primaryColor}; padding: 20px; text-align: center;">
      <img src="${logoUrl}" alt="${companyName}" style="height: 40px; filter: brightness(0) invert(1);" />
    </div>
    
    <div class="content" style="padding: 30px 20px;">
      ${formattedMessage ? `<div class="message" style="font-size: 16px; line-height: 1.6; color: #555; margin-bottom: 30px;">${formattedMessage}</div>` : ''}
      
      ${productsHtml}
    </div>
    
    <div class="footer" style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
      <p>&copy; ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.</p>
      <p>${address}</p>
      <p><a href="#" style="color: #999; text-decoration: underline;">Descadastrar</a></p>
    </div>
  </div>
</body>
</html>
  `;
}
