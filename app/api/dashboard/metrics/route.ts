import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // --- Queries Base ---
    
    // 1. Pedidos
    let ordersQuery = supabaseAdmin
      .from('orders')
      .select('id, total, created_at, status, payment_method, seller_id, order_items(product_name, quantity)')
      .neq('status', 'cancelled')
      .neq('status', 'pending');

    if (startDate) ordersQuery = ordersQuery.gte('created_at', startDate);
    if (endDate) ordersQuery = ordersQuery.lte('created_at', endDate);

    const { data: ordersData, error: ordersError } = await ordersQuery;

    if (ordersError) {
       console.error("Erro ao buscar pedidos:", ordersError);
    }

    const orders = (ordersData || []) as any[];
    
    // Métricas de Pedidos
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // 24h (Comparativo - sempre pega as últimas 24h reais para mostrar tendência, 
    // ou se tiver filtro, poderíamos comparar com o período anterior, mas vamos manter simples)
    // Se houver filtro de data, as métricas "24h" podem não fazer sentido no contexto de "dentro do filtro",
    // mas o card espera um valor. Vamos manter o calculo de 24h fixo (real-time) para os cards de "Hoje",
    // ou calcular 24h DENTRO do período? O padrão de dashboards é: Cards principais mostram o período selecionado.
    // O subtexto "+ X nas últimas 24h" geralmente é sobre "agora".
    // Vamos calcular 24h independentemente do filtro para os indicadores de "tendência recente".
    
    const { data: recentOrdersData } = await supabaseAdmin
      .from('orders')
      .select('id, total')
      .neq('status', 'cancelled')
      .neq('status', 'pending')
      .gte('created_at', oneDayAgo);
      
    const orders24h = (recentOrdersData || []).length;
    const revenue24h = (recentOrdersData || []).reduce((sum, o) => sum + (Number(o.total) || 0), 0);


    // 2. Visitantes
    let visitsQuery = supabaseAdmin.from('site_visits').select('*', { count: 'exact', head: true });
    if (startDate) visitsQuery = visitsQuery.gte('created_at', startDate);
    if (endDate) visitsQuery = visitsQuery.lte('created_at', endDate);

    const { count: totalVisitsCount, error: vError } = await visitsQuery;
    const totalVisits = totalVisitsCount || 0;

    const { count: visits24hCount } = await supabaseAdmin
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo);
    const visits24h = visits24hCount || 0;


    // 3. Service Orders (Fechamento)
    let serviceQuery = supabaseAdmin.from('weekly_orders').select('labor_income, parts_income, created_at');
    if (startDate) serviceQuery = serviceQuery.gte('created_at', startDate);
    if (endDate) serviceQuery = serviceQuery.lte('created_at', endDate);

    const { data: serviceOrdersData } = await serviceQuery;
    const serviceOrdersList = serviceOrdersData || [];
    const serviceOrdersTotal = serviceOrdersList.length;
    const serviceOrdersRevenue = serviceOrdersList.reduce((sum, o) => sum + (Number(o.labor_income || 0) + Number(o.parts_income || 0)), 0);


    // 4. Processamento de Dados Agregados (baseado nos orders filtrados)

    // Top Produtos
    const productMap = new Map<string, number>();
    orders.forEach(o => {
      if (o.order_items) {
        o.order_items.forEach((item: any) => {
          const current = productMap.get(item.product_name) || 0;
          productMap.set(item.product_name, current + (item.quantity || 1));
        });
      }
    });

    const topProducts = Array.from(productMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Vendas por Vendedor (Agregado dos pedidos + Metas do banco)
    const sellerSalesMap = new Map<string, number>();
    orders.forEach(o => {
      if (o.seller_id) {
        const current = sellerSalesMap.get(o.seller_id) || 0;
        sellerSalesMap.set(o.seller_id, current + (Number(o.total) || 0));
      }
    });

    // Buscar info dos vendedores para nomes e metas
    const { data: sellersData } = await supabaseAdmin
      .from('arena_vendedores')
      .select('id, nome, meta_valor');
    
    const salesBySeller = (sellersData || []).map((s: any) => ({
      name: s.nome,
      value: sellerSalesMap.get(s.id) || 0,
      goal: s.meta_valor || 0
    })).sort((a: any, b: any) => b.value - a.value);


    // Métodos de Pagamento
    const paymentMap = new Map<string, number>();
    orders.forEach(o => {
      const method = o.payment_method || 'Outros';
      const current = paymentMap.get(method) || 0;
      paymentMap.set(method, current + (Number(o.total) || 0));
    });

    const paymentMethods = Array.from(paymentMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);


    // Vendas por Hora (Se o filtro for de 1 dia, faz sentido mostrar por hora. Se for longo, talvez por dia?)
    // Por simplicidade, se o filtro for curto (< 2 dias) ou hoje, mostramos por hora.
    // Se for longo, poderíamos agrupar por dia. Mas o gráfico atual é "Sales by Hour".
    // Vamos manter "Sales by Hour" como "Horário de Pico" (acumulado do período).
    // Ex: Soma de vendas as 10:00 de todos os dias do período.
    const salesByHourMap = new Map<number, number>();
    for(let i=0; i<24; i++) salesByHourMap.set(i, 0);

    orders.forEach(o => {
      const hour = new Date(o.created_at).getHours();
      const current = salesByHourMap.get(hour) || 0;
      salesByHourMap.set(hour, current + (Number(o.total) || 0));
    });

    const salesByHour = Array.from(salesByHourMap.entries())
      .map(([hour, value]) => ({ 
        hour: `${hour.toString().padStart(2, '0')}:00`, 
        value 
      }))
      .sort((a: any, b: any) => parseInt(a.hour) - parseInt(b.hour));


    // KPI extras
    const ticketAverage = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalVisits > 0 ? (totalOrders / totalVisits) * 100 : 0;

    return NextResponse.json({
      totalOrders,
      orders24h,
      ordersGrowth: 0, 
      totalRevenue,
      revenue24h,
      revenueGrowth: 0,
      totalVisits,
      visits24h,
      visitsGrowth: 0,
      conversionRate,
      ticketAverage,
      topProducts,
      salesBySeller,
      paymentMethods,
      salesByHour,
      serviceOrders: { 
        total: serviceOrdersTotal, 
        revenue: serviceOrdersRevenue 
      }
    });

  } catch (error: any) {
    console.error("Dashboard Metrics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
