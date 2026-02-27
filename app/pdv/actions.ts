"use server";

import { createClient } from "@/lib/supabase/server";
import { PdvCartItem, PdvCustomer } from "./store";
import { adicionarVenda } from "@/app/arena/actions";

export async function createOrder({
  customer,
  items,
  total,
  paymentMethod,
  origin,
  sellerId
}: {
  customer: PdvCustomer;
  items: PdvCartItem[];
  total: number;
  paymentMethod: string;
  origin: string;
  sellerId: string | null;
}) {
  const supabase = await createClient();

  try {
    // 1. Criar Pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_whatsapp: customer.phone,
        address: customer.address,
        total,
        status: "paid", // Assumindo pago via Pix no PDV
        origin: "pdv",
        seller_id: sellerId,
        cpf_cnpj: customer.cpf_cnpj,
        payment_method: paymentMethod,
        payment_status: "paid"
      })
      .select("id")
      .single();

    if (orderError) throw new Error("Erro ao criar pedido: " + orderError.message);

    // 2. Criar Itens
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image_url,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw new Error("Erro ao criar itens: " + itemsError.message);

    // 3. Atualizar Arena (Vendedor)
    if (sellerId) {
      try {
        await adicionarVenda(sellerId, total);
      } catch (arenaError) {
        console.error("Erro ao atualizar Arena:", arenaError);
        // Não falhar o pedido se a arena falhar, apenas logar
      }
    }

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return { success: false, error: error.message };
  }
}
