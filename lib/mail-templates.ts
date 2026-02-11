
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

const getUnsubscribeLink = (email?: string) => {
  if (!email) return "#";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://balaocastelo.com.br";
  return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
};

export const getBaseTemplate = (content: string, title: string = "Balão Castelo", email?: string) => `
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
      ${email ? `<p><a href="${getUnsubscribeLink(email)}" style="color: #888; text-decoration: underline;">Descadastrar-se</a></p>` : ''}
    </div>
  </div>
</body>
</html>
`;

export const getOrderStatusUpdateTemplate = (order: any, status: string) => {
  const statusMap: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago / Em Separação",
    shipped: "Enviado / Pronto para Retirada",
    delivered: "Entregue",
    canceled: "Cancelado"
  };

  const statusColor: Record<string, string> = {
    pending: "#f59e0b",
    paid: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    canceled: "#ef4444"
  };

  const statusLabel = statusMap[status] || status;
  const color = statusColor[status] || "#333";

  const content = `
    <h2>Atualização do Pedido #${order.id.slice(0, 8)}</h2>
    <p>Olá, ${order.customer_name}!</p>
    <p>O status do seu pedido foi atualizado.</p>
    
    <div class="info-box" style="border-left-color: ${color};">
      <strong>Novo Status:</strong> <span style="color: ${color}; font-weight: bold; text-transform: uppercase;">${statusLabel}</span>
    </div>

    <p>Se você tiver alguma dúvida, entre em contato conosco.</p>

    <p style="text-align: center;">
      <a href="https://balaocastelo.com.br/meus-pedidos" class="button">Ver Detalhes do Pedido</a>
    </p>
  `;

  return getBaseTemplate(content, `Atualização de Pedido #${order.id.slice(0, 8)}`, order.customer_email);
};

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
      <td style="text-align: right;">
        R$ ${Number(item.price).toFixed(2).replace('.', ',')}
      </td>
    </tr>
  `).join('');

  const discountHtml = order.discount_value > 0 
    ? `<p style="text-align: right; color: #10b981;">Desconto: - R$ ${Number(order.discount_value).toFixed(2).replace('.', ',')}</p>`
    : '';

  const content = `
    <h2>Pedido Confirmado! #${order.id.slice(0, 8)}</h2>
    <p>Olá, ${order.customer_name}!</p>
    <p>Obrigado por comprar na Balão Castelo. Recebemos seu pedido e ele já está sendo processado.</p>
    
    <h3>Resumo do Pedido</h3>
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

    ${discountHtml}
    <div class="total">
      Total: R$ ${Number(order.total).toFixed(2).replace('.', ',')}
    </div>

    <div class="info-box">
      <strong>Endereço de Entrega:</strong><br>
      ${order.address.street}, ${order.address.number} ${order.address.complement ? `- ${order.address.complement}` : ''}<br>
      ${order.address.cep} - ${order.address.city}/${order.address.state}
    </div>

    <p>Você receberá novos e-mails assim que o status do seu pedido mudar.</p>
  `;

  return getBaseTemplate(content, `Pedido Confirmado #${order.id.slice(0, 8)}`, order.customer_email);
};

export const getWelcomeTemplate = (name: string, email: string) => {
  const content = `
    <h2>Bem-vindo(a) à Balão Castelo!</h2>
    <p>Olá, ${name}!</p>
    <p>Estamos muito felizes em ter você conosco. Sua conta foi criada com sucesso.</p>
    <p>Agora você pode:</p>
    <ul>
      <li>Fazer pedidos de forma mais rápida</li>
      <li>Acompanhar seu histórico de compras</li>
      <li>Receber ofertas exclusivas</li>
    </ul>
    <p>Aproveite nossas ofertas!</p>
    <p style="text-align: center;">
      <a href="https://balaocastelo.com.br" class="button">Ir para a Loja</a>
    </p>
  `;
  return getBaseTemplate(content, "Bem-vindo à Balão Castelo", email);
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
