import { NextResponse } from "next/server";
import { createOrder } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789"); // Fallback to avoid crash if key missing, but will fail to send

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, items, total } = body;

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
      status: 'pending' as const
    };

    const orderItems = items.map((item: any) => ({
      product_name: item.name,
      product_image: item.image,
      quantity: item.quantity,
      price: item.price
    }));

    const order = await createOrder(orderData, orderItems);

    // 2. Send Email
    // If no API key is configured, this part might fail or needs a check.
    // We will attempt it and log error if it fails, but not block the response (or maybe we should?)
    // Ideally we want to confirm order placement even if email fails, but warn user.
    // For this task, we'll try to send.

    if (process.env.RESEND_API_KEY) {
        try {
            const emailContent = `
                <h1>Obrigado pelo seu pedido, ${customer.name}!</h1>
                <p>Recebemos seu pedido e ele está sendo processado.</p>
                
                <h2>Detalhes do Pedido #${order.id.slice(0, 8)}</h2>
                <ul>
                    ${items.map((item: any) => `
                        <li>${item.quantity}x ${item.name} - ${item.price}</li>
                    `).join('')}
                </ul>
                
                <p><strong>Total: R$ ${total.toFixed(2)}</strong></p>
                
                <h3>Dados de Entrega:</h3>
                <p>
                    ${customer.address}, ${customer.number}<br>
                    ${customer.complement ? customer.complement + '<br>' : ''}
                    ${customer.city} - ${customer.state}<br>
                    CEP: ${customer.cep}
                </p>
                
                <p>Entraremos em contato via WhatsApp (${customer.phone}) se necessário.</p>
            `;

            await resend.emails.send({
                from: 'Balão da Informática <onboarding@resend.dev>', // Default Resend testing domain or configured domain
                to: [customer.email],
                bcc: ['balaocastelo@gmail.com'],
                subject: `Confirmação de Pedido #${order.id.slice(0, 8)}`,
                html: emailContent,
            });
            console.log("Email sent successfully");
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // Continue execution, don't fail the request just because email failed
        }
    } else {
        console.warn("RESEND_API_KEY is missing. Email sending skipped.");
    }

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
