import { NextResponse } from "next/server";
import { createOrder } from "@/lib/db";
import { sendEmail, sendSystemNotification } from "@/lib/mail";
import { getOrderConfirmationTemplate } from "@/lib/mail-templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, items, total, couponCode, discountValue } = body;

    if (!customer || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Save to Database
    const orderData = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_whatsapp: customer.phone,
      address: {
        street: customer.address,
        cep: customer.cep,
        city: customer.city,
        state: customer.state,
        number: customer.number,
        complement: customer.complement
      },
      total: total,
      status: 'pending' as const,
      coupon_code: couponCode || null,
      discount_value: discountValue || 0
    };

    const orderItems = items.map((item: any) => ({
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      price: item.price
    }));

    const order = await createOrder(orderData, orderItems);

    // 2. Send Emails (Customer + Admin Notification)
    
    // E-mail para o Cliente usando Template
    const emailHtml = getOrderConfirmationTemplate({ ...orderData, id: order.id }, orderItems);

    // Envio assíncrono para não bloquear resposta (ou síncrono se crítico)
    // Aqui fazemos síncrono para garantir
    await sendEmail({
        to: customer.email,
        subject: `Confirmação de Pedido #${order.id.slice(0, 8)}`,
        html: emailHtml,
        eventType: 'order_confirmation'
    });

    // Notificação para Admin
    await sendSystemNotification('Novo Pedido Realizado', {
        orderId: order.id,
        customer: customer.name,
        total: total,
        email: customer.email
    });

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
        { 
            error: "Failed to process order", 
            details: error.message || JSON.stringify(error),
            hint: "Verifique se as tabelas 'orders' e 'order_items' existem no Supabase e se a chave de serviço (SERVICE_ROLE_KEY) está configurada."
        }, 
        { status: 500 }
    );
  }
}
