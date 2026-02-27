"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  DollarSign, ShoppingBag, Users, TrendingUp, TrendingDown, 
  Calendar, CreditCard, Award, Package, Clock, Filter, Printer, Wrench
} from "lucide-react";

// --- Types ---
interface DashboardMetrics {
  totalOrders: number;
  orders24h: number;
  ordersGrowth: number;
  totalRevenue: number;
  revenue24h: number;
  revenueGrowth: number;
  totalVisits: number;
  visits24h: number;
  visitsGrowth: number;
  conversionRate: number;
  ticketAverage: number;
  topProducts: { name: string; quantity: number }[];
  salesBySeller: { name: string; value: number; goal: number }[];
  paymentMethods: { name: string; value: number }[];
  salesByHour: { hour: string; value: number }[];
  serviceOrders: { total: number; revenue: number };
}

// --- Components ---
const MetricCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:border print:border-gray-300 print:shadow-none">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg print:hidden ${trend === 'up' ? 'bg-green-50 text-green-600' : trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
        <Icon size={24} />
      </div>
    </div>
    {subtext && (
      <div className="flex items-center gap-2 text-sm print:hidden">
        {trend === 'up' ? <TrendingUp size={16} className="text-green-500" /> : trend === 'down' ? <TrendingDown size={16} className="text-red-500" /> : null}
        <span className={trend === 'up' ? 'text-green-600 font-medium' : trend === 'down' ? 'text-red-600 font-medium' : 'text-gray-500'}>
          {subtext}
        </span>
      </div>
    )}
  </div>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [period, setPeriod] = useState('today'); // 'today', 'week', 'month', 'year', 'custom'

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      let url = '/api/dashboard/metrics';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', new Date(startDate).toISOString());
      if (endDate) {
         const end = new Date(endDate);
         end.setHours(23, 59, 59, 999);
         params.append('endDate', end.toISOString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch based on default period (Today)
    handlePeriodChange('today');
    
    const interval = setInterval(() => {
        // Only poll if no custom date is set to avoid overwriting user interaction
        if (period === 'today') fetchMetrics();
    }, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Update dates when period changes
  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (p === 'today') {
      start = now; // Start of day logic handled in API if only start provided? API expects ISO.
      // Actually API uses gte. If I send now(), it will be from now.
      // I should send start of day.
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (p === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
    } else if (p === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (p === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    } else if (p === 'custom') {
        // Keep existing start/end or clear them
        return; 
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    
    // Trigger fetch in useEffect? No, easier to trigger here but state updates are async.
    // Use useEffect on startDate/endDate?
  };

  // Trigger fetch when dates change
  useEffect(() => {
    if (startDate && endDate) {
        fetchMetrics();
    }
  }, [startDate, endDate]);


  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = () => {
    if (!metrics) return;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    csvContent += "Métrica,Valor,Detalhe\n";
    
    // General Metrics
    csvContent += `Faturamento Total,${metrics.totalRevenue.toFixed(2)},+${metrics.revenue24h.toFixed(2)} (24h)\n`;
    csvContent += `Pedidos,${metrics.totalOrders},+${metrics.orders24h} (24h)\n`;
    csvContent += `Visitantes,${metrics.totalVisits},+${metrics.visits24h} (24h)\n`;
    csvContent += `Ticket Médio,${metrics.ticketAverage.toFixed(2)},\n`;
    csvContent += `Taxa de Conversão,${metrics.conversionRate.toFixed(2)}%,\n`;
    
    // Sales by Seller
    csvContent += "\nVendas por Vendedor\n";
    csvContent += "Vendedor,Valor,Meta\n";
    metrics.salesBySeller.forEach(seller => {
      csvContent += `${seller.name},${seller.value.toFixed(2)},${seller.goal.toFixed(2)}\n`;
    });

    // Top Products
    csvContent += "\nProdutos Mais Vendidos\n";
    csvContent += "Produto,Quantidade\n";
    metrics.topProducts.forEach(product => {
      csvContent += `${product.name},${product.quantity}\n`;
    });

    // Payment Methods
    csvContent += "\nMétodos de Pagamento\n";
    csvContent += "Método,Quantidade\n";
    metrics.paymentMethods.forEach(method => {
      csvContent += `${method.name},${method.value}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_dashboard_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!metrics) return <div className="p-8 text-center">Erro ao carregar dados.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 font-sans print:bg-white print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard Executivo</h1>
          <p className="text-gray-500 mt-1">Visão geral em tempo real do Balão da Informática</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                <button 
                    onClick={() => handlePeriodChange('today')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'today' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Hoje
                </button>
                <button 
                    onClick={() => handlePeriodChange('week')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'week' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Semana
                </button>
                <button 
                    onClick={() => handlePeriodChange('month')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'month' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Mês
                </button>
                <button 
                    onClick={() => handlePeriodChange('year')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${period === 'year' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    Ano
                </button>
            </div>

            <div className="flex items-center gap-2">
                 <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => { setPeriod('custom'); setStartDate(e.target.value); }}
                    className="px-2 py-1 border rounded text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => { setPeriod('custom'); setEndDate(e.target.value); }}
                    className="px-2 py-1 border rounded text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                 <button 
                    onClick={handlePrint}
                    className="ml-2 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Imprimir Relatório"
                >
                    <Printer size={18} />
                </button>
                <button 
                    onClick={downloadCSV}
                    className="ml-2 p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Exportar CSV"
                >
                    <Filter size={18} />
                </button>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                <Clock size={12} />
                Atualizado: {lastUpdated.toLocaleTimeString()}
            </div>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">Relatório Executivo - Balão da Informática</h1>
        <p className="text-gray-600">Período: {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}</p>
        <p className="text-xs text-gray-400 mt-1">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 print:grid-cols-4 print:gap-4">
        <MetricCard 
          title="Faturamento Total" 
          value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtext={`+ R$ ${metrics.revenue24h.toLocaleString('pt-BR')} (24h)`}
          icon={DollarSign}
          trend="up"
        />
        <MetricCard 
          title="Pedidos Realizados" 
          value={metrics.totalOrders}
          subtext={`+ ${metrics.orders24h} novos (24h)`}
          icon={ShoppingBag}
          trend={metrics.orders24h > 0 ? 'up' : 'neutral'}
        />
         <MetricCard 
          title="Ordens de Serviço" 
          value={metrics.serviceOrders.total}
          subtext={`R$ ${metrics.serviceOrders.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Wrench}
          trend="neutral"
        />
        <MetricCard 
          title="Visitantes Únicos" 
          value={metrics.totalVisits.toLocaleString()}
          subtext={`+ ${metrics.visits24h} hoje`}
          icon={Users}
          trend="up"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 print:grid-cols-2 print:gap-4 print:break-inside-avoid">
        {/* Vendas por Vendedor */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="text-yellow-500" />
            Performance de Vendas
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.salesBySeller} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Bar dataKey="value" name="Vendas" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                {/* Meta might be irrelevant for specific periods if goal is monthly, but let's keep it */}
                <Bar dataKey="goal" name="Meta" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendas nas últimas 24h (Simulado hourly distribution) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-blue-500" />
            Vendas por Horário
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.salesByHour}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4 print:break-inside-avoid">
        {/* Top Produtos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 print:col-span-2 print:border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Package className="text-purple-500" />
            Produtos Mais Vendidos
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.topProducts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" name="Qtd" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print:border-gray-300">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CreditCard className="text-green-500" />
            Métodos de Pagamento
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.paymentMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-400 print:hidden">
        Dados atualizados em tempo real do banco de dados principal.
      </div>
    </div>
  );
}
