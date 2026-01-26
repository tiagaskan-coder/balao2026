
export const emailStyles = `
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .header { background-color: #E60012; padding: 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .footer { background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #888; }
    .button { display: inline-block; background-color: #E60012; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
    .product-list { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .product-list th { text-align: left; border-bottom: 2px solid #eee; padding: 10px; color: #888; font-size: 12px; uppercase; }
    .product-list td { border-bottom: 1px solid #eee; padding: 10px; vertical-align: middle; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #E60012; }
    .info-box { background-color: #f8f9fa; border-left: 4px solid #E60012; padding: 15px; margin: 20px 0; }
  </style>
`;

export const getBaseTemplate = (content: string, title: string = "Balão Castelo") => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${emailStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Balão Castelo</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Balão Castelo. Todos os direitos reservados.</p>
      <p>Este e-mail foi enviado automaticamente. Por favor, não responda.</p>
    </div>
  </div>
</body>
</html>
`;

export const getOrderConfirmationTemplate = (order: any, items: any[]) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td width="60">
        ${item.product_image ? `<img src="${item.product_image}" width="50" style="border-radius: 4px;">` : ''}
      </td>
      <td>
        <strong>${item.product_name}</strong><br>
        <span style="font-size: 12px; color: #888;">Qtd: ${item.quantity}</span>
      </td>
      <td style="text-align: right;">${item.price}</td>
    </tr>
  `).join('');

  const content = `
    <h2>Obrigado pelo seu pedido, ${order.customer_name}!</h2>
    <p>Recebemos seu pedido com sucesso e já estamos processando. Abaixo estão os detalhes da sua compra.</p>
    
    <div class="info-box">
      <strong>Pedido #${order.id.slice(0, 8)}</strong><br>
      Status: <span style="color: #E60012; font-weight: bold;">Pendente</span>
    </div>

    <table class="product-list">
      <thead>
        <tr>
          <th colspan="2">Produto</th>
          <th style="text-align: right;">Preço</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="total">
      Total: R$ ${order.total.toFixed(2)}
    </div>

    <h3>Endereço de Entrega</h3>
    <p>
      ${order.address.street}, ${order.address.number}<br>
      ${order.address.complement ? `${order.address.complement}<br>` : ''}
      ${order.address.city} - ${order.address.state}<br>
      CEP: ${order.address.cep}
    </p>

    <p style="text-align: center;">
      <a href="https://balaocastelo.com.br/meus-pedidos" class="button">Acompanhar Pedido</a>
    </p>
  `;

  return getBaseTemplate(content, "Confirmação de Pedido");
};

export const getWelcomeTemplate = (name: string) => {
  const content = `
    <h2>Bem-vindo(a) à Balão Castelo, ${name}!</h2>
    <p>Estamos muito felizes em ter você conosco. Agora você faz parte da nossa comunidade e receberá ofertas exclusivas em primeira mão.</p>
    
    <p>Na Balão Castelo você encontra:</p>
    <ul>
      <li>Informática e PC Gamer</li>
      <li>Assistência Técnica Especializada</li>
      <li>Melhores preços da região</li>
    </ul>

    <p style="text-align: center;">
      <a href="https://balaocastelo.com.br" class="button">Explorar Loja</a>
    </p>
  `;

  return getBaseTemplate(content, "Bem-vindo!");
};

export const getAdminNotificationTemplate = (title: string, data: any) => {
  const dataHtml = Object.entries(data)
    .map(([key, value]) => `
      <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
        <strong style="color: #555; text-transform: uppercase; font-size: 10px;">${key}</strong><br>
        <span style="font-family: monospace;">${typeof value === 'object' ? JSON.stringify(value) : value}</span>
      </div>
    `).join('');

  const content = `
    <h2 style="color: #E60012;">${title}</h2>
    <p>Uma nova atividade requer sua atenção no sistema.</p>
    <div style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 4px;">
      ${dataHtml}
    </div>
    <p style="font-size: 12px; color: #888; margin-top: 20px;">
      Data: ${new Date().toLocaleString('pt-BR')}
    </p>
  `;

  return getBaseTemplate(content, "Notificação Admin");
};
