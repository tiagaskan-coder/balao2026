
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, 
  PieChart, Share2, FileDown, BrainCircuit, Printer, AlertTriangle
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { analyzeWeeklyClosing, WeeklyAnalysis } from "@/lib/ai-service-specific";

// --- Types ---
interface ServiceOrder {
  id: string;
  osNumber: string;
  status: "Entrada" | "Reparo" | "Concluída";
  laborCost: number; // Mão de Obra
  partsSaleValue: number; // Valor Venda Peças
  partsCostValue: number; // Custo Peças (Saída)
  thirdPartyCost: number; // Custo Terceiros
  paymentMethod: "PIX" | "Cartão" | "Dinheiro";
}

interface FinancialSummary {
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  paymentMix: {
    PIX: number;
    Cartao: number;
    Dinheiro: number;
  };
}

// --- Component ---
export default function WeeklyClosing() {
  const { showToast } = useToast();
  
  // State
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<WeeklyAnalysis | null>(null);
  
  // Form State
  const [newOrder, setNewOrder] = useState<Partial<ServiceOrder>>({
    status: "Entrada",
    paymentMethod: "PIX",
    laborCost: 0,
    partsSaleValue: 0,
    partsCostValue: 0,
    thirdPartyCost: 0
  });

  // Load from LocalStorage / URL on Mount
  useEffect(() => {
    // Check URL params first for shared state
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const data = params.get("data");
      if (data) {
        try {
          const decoded = JSON.parse(atob(data));
          if (decoded.orders) setOrders(decoded.orders);
          if (decoded.aiAnalysis) setAiAnalysis(decoded.aiAnalysis);
          showToast("Dados carregados do link compartilhado!");
          // Clean URL
          window.history.replaceState({}, "", "/fechamento");
          return;
        } catch (e) {
          console.error("Erro ao decodificar URL", e);
        }
      }

      // Fallback to LocalStorage
      const savedOrders = localStorage.getItem("techflow_orders");
      const savedAnalysis = localStorage.getItem("techflow_analysis");
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedAnalysis) setAiAnalysis(JSON.parse(savedAnalysis));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("techflow_orders", JSON.stringify(orders));
      if (aiAnalysis) {
        localStorage.setItem("techflow_analysis", JSON.stringify(aiAnalysis));
      }
    }
  }, [orders, aiAnalysis]);

  // Calculations
  const summary: FinancialSummary = orders.reduce(
    (acc, order) => {
      const revenue = (order.laborCost || 0) + (order.partsSaleValue || 0);
      const expenses = (order.partsCostValue || 0) + (order.thirdPartyCost || 0);
      
      acc.grossRevenue += revenue;
      acc.totalExpenses += expenses;
      acc.netProfit += revenue - expenses;
      
      if (order.paymentMethod === "PIX") acc.paymentMix.PIX += revenue;
      if (order.paymentMethod === "Cartão") acc.paymentMix.Cartao += revenue;
      if (order.paymentMethod === "Dinheiro") acc.paymentMix.Dinheiro += revenue;
      
      return acc;
    },
    { grossRevenue: 0, totalExpenses: 0, netProfit: 0, paymentMix: { PIX: 0, Cartao: 0, Dinheiro: 0 } }
  );

  // Handlers
  const handleAddOrder = () => {
    if (!newOrder.osNumber) {
      showToast("Número da OS é obrigatório!");
      return;
    }
    
    const order: ServiceOrder = {
      id: crypto.randomUUID(),
      osNumber: newOrder.osNumber,
      status: newOrder.status as any || "Entrada",
      paymentMethod: newOrder.paymentMethod as any || "PIX",
      laborCost: Number(newOrder.laborCost) || 0,
      partsSaleValue: Number(newOrder.partsSaleValue) || 0,
      partsCostValue: Number(newOrder.partsCostValue) || 0,
      thirdPartyCost: Number(newOrder.thirdPartyCost) || 0,
    };

    setOrders([...orders, order]);
    setNewOrder({
      status: "Entrada",
      paymentMethod: "PIX",
      laborCost: 0,
      partsSaleValue: 0,
      partsCostValue: 0,
      thirdPartyCost: 0,
      osNumber: ""
    });
    showToast("OS Adicionada!");
  };

  const removeOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    showToast("OS Removida.");
  };

  const handleAIAnalysis = async () => {
    setLoadingAI(true);
    try {
      const result = await analyzeWeeklyClosing({
        totalRevenue: summary.grossRevenue,
        totalExpenses: summary.totalExpenses,
        netProfit: summary.netProfit,
        ordersCount: orders.length,
        paymentMix: summary.paymentMix,
        topExpenses: [] // TODO: Refinar se necessário
      });
      setAiAnalysis(result);
      showToast("Análise de IA Concluída!");
    } catch (error) {
      console.error(error);
      showToast("Erro ao analisar com IA.");
    } finally {
      setLoadingAI(false);
    }
  };

  const generatePDF = async () => {
    if (typeof window === "undefined") return;
    const html2pdf = (await import("html2pdf.js")).default;
    
    const element = document.getElementById("report-content");
    if (!element) {
      showToast("Elemento do relatório não encontrado.");
      return;
    }

    const opt = {
      margin: 10,
      filename: `fechamento-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    } as any;
    
    html2pdf().set(opt).from(element).save();
    showToast("Gerando PDF...");
  };

  const generateShareLink = () => {
    const state = { orders, aiAnalysis };
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    navigator.clipboard.writeText(url);
    showToast("Link copiado para a área de transferência!");
  };

  // Helper for currency
  const fmt = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">TechFlow Assist</h1>
            <p className="text-slate-500">Fechamento Semanal Inteligente</p>
          </div>
          <div className="flex gap-2">
            <button onClick={generateShareLink} className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 text-slate-600 flex items-center gap-2">
              <Share2 size={18} /> <span className="hidden md:inline">Compartilhar</span>
            </button>
            <button onClick={generatePDF} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
              <FileDown size={18} /> <span className="hidden md:inline">Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* --- INPUT SECTION (No Print) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="text-blue-500" /> Nova Ordem de Serviço
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-slate-500">Nº OS</label>
              <input 
                type="text" 
                value={newOrder.osNumber}
                onChange={e => setNewOrder({...newOrder, osNumber: e.target.value})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-100 outline-none"
                placeholder="0001"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-slate-500">Status</label>
              <select 
                value={newOrder.status}
                onChange={e => setNewOrder({...newOrder, status: e.target.value as any})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option>Entrada</option>
                <option>Reparo</option>
                <option>Concluída</option>
              </select>
            </div>
             <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-slate-500">Pagamento</label>
              <select 
                value={newOrder.paymentMethod}
                onChange={e => setNewOrder({...newOrder, paymentMethod: e.target.value as any})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-100 outline-none"
              >
                <option>PIX</option>
                <option>Cartão</option>
                <option>Dinheiro</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="text-xs font-medium text-slate-500 text-green-600">Mão de Obra (R$)</label>
              <input 
                type="number" 
                value={newOrder.laborCost || ""}
                onChange={e => setNewOrder({...newOrder, laborCost: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-100 outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-medium text-slate-500 text-green-600">Venda Peças (R$)</label>
              <input 
                type="number" 
                value={newOrder.partsSaleValue || ""}
                onChange={e => setNewOrder({...newOrder, partsSaleValue: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-100 outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-medium text-slate-500 text-red-500">Custo Peças (R$)</label>
              <input 
                type="number" 
                value={newOrder.partsCostValue || ""}
                onChange={e => setNewOrder({...newOrder, partsCostValue: parseFloat(e.target.value)})}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-100 outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="col-span-1 flex items-end">
              <button 
                onClick={handleAddOrder}
                className="w-full bg-slate-900 text-white p-2 rounded hover:bg-slate-800 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* --- REPORT AREA (To be printed) --- */}
        <div id="report-content" className="space-y-8 bg-white p-8 shadow-sm">
          
          {/* AI Analysis Section (Page 1 in PDF logic) */}
          {aiAnalysis && (
            <div className="mb-8 break-after-page">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg">
                    <BrainCircuit size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-indigo-900">Análise Inteligente Semanal</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-2">Resumo Executivo</h3>
                    <p className="text-slate-700 leading-relaxed">{aiAnalysis.summary}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                      <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                        <TrendingUp size={16} /> Pontos Positivos
                      </h3>
                      <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        {aiAnalysis.positives.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                      <h3 className="font-bold text-amber-700 mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} /> Alertas & Riscos
                      </h3>
                       <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        {aiAnalysis.alerts.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                      <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                        <DollarSign size={16} /> Dicas de Lucratividade
                      </h3>
                       <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        {aiAnalysis.tips.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Dashboard (Page 2+) */}
          <div>
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Relatório Financeiro & Operacional</h2>
                <span className="text-slate-400 text-sm">{new Date().toLocaleDateString()}</span>
             </div>

             {/* KPIs */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Receita Bruta</p>
                  <p className="text-3xl font-bold text-slate-900">{fmt(summary.grossRevenue)}</p>
                </div>
                <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm text-red-500 mb-1">Despesas Totais</p>
                  <p className="text-3xl font-bold text-red-700">{fmt(summary.totalExpenses)}</p>
                </div>
                <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-sm text-green-600 mb-1">Lucro Líquido</p>
                  <p className="text-3xl font-bold text-green-700">{fmt(summary.netProfit)}</p>
                </div>
             </div>

             {/* Charts & Mix */}
             <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-slate-700">Mix de Recebimento</h3>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                  {summary.grossRevenue > 0 && (
                    <>
                      <div style={{ width: `${(summary.paymentMix.PIX / summary.grossRevenue) * 100}%` }} className="bg-green-500 h-full" title="PIX"></div>
                      <div style={{ width: `${(summary.paymentMix.Cartao / summary.grossRevenue) * 100}%` }} className="bg-blue-500 h-full" title="Cartão"></div>
                      <div style={{ width: `${(summary.paymentMix.Dinheiro / summary.grossRevenue) * 100}%` }} className="bg-amber-500 h-full" title="Dinheiro"></div>
                    </>
                  )}
                </div>
                <div className="flex gap-6 mt-2 text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> PIX: {fmt(summary.paymentMix.PIX)}</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Cartão: {fmt(summary.paymentMix.Cartao)}</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div> Dinheiro: {fmt(summary.paymentMix.Dinheiro)}</div>
                </div>
             </div>

             {/* Table */}
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                   <tr>
                     <th className="px-4 py-3">OS</th>
                     <th className="px-4 py-3">Status</th>
                     <th className="px-4 py-3 text-right text-green-600">Mão de Obra</th>
                     <th className="px-4 py-3 text-right text-green-600">Peças (Venda)</th>
                     <th className="px-4 py-3 text-right text-red-500">Peças (Custo)</th>
                     <th className="px-4 py-3 text-right font-bold">Resultado</th>
                     <th className="px-4 py-3 text-center no-print">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {orders.map(order => {
                     const orderRevenue = order.laborCost + order.partsSaleValue;
                     const orderCost = order.partsCostValue + order.thirdPartyCost;
                     const orderProfit = orderRevenue - orderCost;
                     
                     return (
                       <tr key={order.id} className="hover:bg-slate-50">
                         <td className="px-4 py-3 font-medium text-slate-900">{order.osNumber}</td>
                         <td className="px-4 py-3">
                           <span className={`px-2 py-1 rounded-full text-xs ${
                             order.status === 'Concluída' ? 'bg-green-100 text-green-700' :
                             order.status === 'Reparo' ? 'bg-amber-100 text-amber-700' :
                             'bg-slate-100 text-slate-600'
                           }`}>
                             {order.status}
                           </span>
                         </td>
                         <td className="px-4 py-3 text-right">{fmt(order.laborCost)}</td>
                         <td className="px-4 py-3 text-right">{fmt(order.partsSaleValue)}</td>
                         <td className="px-4 py-3 text-right text-red-400">{fmt(order.partsCostValue)}</td>
                         <td className="px-4 py-3 text-right font-bold text-slate-700">{fmt(orderProfit)}</td>
                         <td className="px-4 py-3 text-center no-print">
                           <button onClick={() => removeOrder(order.id)} className="text-red-400 hover:text-red-600">
                             <Trash2 size={16} />
                           </button>
                         </td>
                       </tr>
                     );
                   })}
                   {orders.length === 0 && (
                     <tr>
                       <td colSpan={7} className="text-center py-8 text-slate-400">
                         Nenhuma ordem de serviço registrada nesta semana.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* --- AI Trigger Button (No Print) --- */}
        <div className="flex justify-center pb-12 no-print">
          <button 
            onClick={handleAIAnalysis}
            disabled={loadingAI || orders.length === 0}
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {loadingAI ? (
              <span className="flex items-center gap-2"><BrainCircuit className="animate-pulse" /> Analisando Dados...</span>
            ) : (
              <span className="flex items-center gap-2"><BrainCircuit /> Gerar Análise com IA</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
