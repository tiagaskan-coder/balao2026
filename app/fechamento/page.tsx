"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, TrendingUp, TrendingDown, DollarSign, 
  PieChart, Share2, FileDown, BrainCircuit, Printer, AlertTriangle, Minus
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { analyzeWeeklyClosing, WeeklyAnalysis } from "@/lib/ai-service-specific";

// --- Types ---
interface ServiceOrder {
  id: string;
  osNumber: string;
  status: "Entrada" | "Reparo" | "Concluída";
  
  // Entradas (Receitas)
  laborIncome: number;
  partsIncome: number;
  
  // Saídas (Custos diretos)
  laborExpense: number; 
  partsExpense: number;

  paymentMethod: "PIX" | "Cartão" | "Dinheiro";
}

interface OperationalExpense {
  id: string;
  description: string;
  value: number;
  category: "Salário" | "Insumo" | "Aluguel" | "Imposto" | "Outro";
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
  operationalExpensesTotal: number;
  directCostsTotal: number;
}

// --- Component ---
export default function WeeklyClosing() {
  const { showToast } = useToast();
  
  // State
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [expenses, setExpenses] = useState<OperationalExpense[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<WeeklyAnalysis | null>(null);
  
  // Form State - OS
  const [newOrder, setNewOrder] = useState<Partial<ServiceOrder>>({
    status: "Entrada",
    paymentMethod: "PIX",
    laborIncome: 0,
    partsIncome: 0,
    laborExpense: 0,
    partsExpense: 0,
  });

  // Form State - Expense
  const [newExpense, setNewExpense] = useState<Partial<OperationalExpense>>({
    category: "Outro",
    value: 0,
    description: ""
  });

  // Load from LocalStorage / URL on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const data = params.get("data");
      if (data) {
        try {
          const decoded = JSON.parse(atob(data));
          if (decoded.orders) setOrders(decoded.orders);
          if (decoded.expenses) setExpenses(decoded.expenses);
          if (decoded.aiAnalysis) setAiAnalysis(decoded.aiAnalysis);
          showToast("Dados carregados do link compartilhado!");
          window.history.replaceState({}, "", "/fechamento");
          return;
        } catch (e) {
          console.error("Erro ao decodificar URL", e);
        }
      }

      const savedOrders = localStorage.getItem("techflow_orders_v2");
      const savedExpenses = localStorage.getItem("techflow_expenses");
      const savedAnalysis = localStorage.getItem("techflow_analysis_v2");
      
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedAnalysis) setAiAnalysis(JSON.parse(savedAnalysis));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("techflow_orders_v2", JSON.stringify(orders));
      localStorage.setItem("techflow_expenses", JSON.stringify(expenses));
      if (aiAnalysis) {
        localStorage.setItem("techflow_analysis_v2", JSON.stringify(aiAnalysis));
      }
    }
  }, [orders, expenses, aiAnalysis]);

  // Calculations
  const summary: FinancialSummary = React.useMemo(() => {
    const directCosts = orders.reduce((sum, o) => sum + (o.laborExpense || 0) + (o.partsExpense || 0), 0);
    const revenue = orders.reduce((sum, o) => sum + (o.laborIncome || 0) + (o.partsIncome || 0), 0);
    const opExpenses = expenses.reduce((sum, e) => sum + (e.value || 0), 0);
    
    const paymentMix = orders.reduce((acc, order) => {
      const orderTotal = (order.laborIncome || 0) + (order.partsIncome || 0);
      if (order.paymentMethod === "PIX") acc.PIX += orderTotal;
      if (order.paymentMethod === "Cartão") acc.Cartao += orderTotal;
      if (order.paymentMethod === "Dinheiro") acc.Dinheiro += orderTotal;
      return acc;
    }, { PIX: 0, Cartao: 0, Dinheiro: 0 });

    return {
      grossRevenue: revenue,
      totalExpenses: directCosts + opExpenses,
      netProfit: revenue - (directCosts + opExpenses),
      paymentMix,
      directCostsTotal: directCosts,
      operationalExpensesTotal: opExpenses
    };
  }, [orders, expenses]);

  // Handlers - Orders
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
      laborIncome: Number(newOrder.laborIncome) || 0,
      partsIncome: Number(newOrder.partsIncome) || 0,
      laborExpense: Number(newOrder.laborExpense) || 0,
      partsExpense: Number(newOrder.partsExpense) || 0,
    };

    setOrders([...orders, order]);
    setNewOrder({
      status: "Entrada",
      paymentMethod: "PIX",
      laborIncome: 0,
      partsIncome: 0,
      laborExpense: 0,
      partsExpense: 0,
      osNumber: ""
    });
    showToast("OS Adicionada!");
  };

  const removeOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    showToast("OS Removida.");
  };

  // Handlers - Expenses
  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.value) {
      showToast("Descrição e valor são obrigatórios!");
      return;
    }

    const expense: OperationalExpense = {
      id: crypto.randomUUID(),
      description: newExpense.description,
      value: Number(newExpense.value),
      category: newExpense.category as any || "Outro"
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ category: "Outro", value: 0, description: "" });
    showToast("Despesa adicionada!");
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
    showToast("Despesa removida.");
  };

  // AI & Export
  const handleAIAnalysis = async () => {
    setLoadingAI(true);
    try {
      const result = await analyzeWeeklyClosing({
        totalRevenue: summary.grossRevenue,
        totalExpenses: summary.totalExpenses,
        netProfit: summary.netProfit,
        ordersCount: orders.length,
        paymentMix: summary.paymentMix,
        topExpenses: orders.map(o => ({
          name: `OS ${o.osNumber} (Custos)`,
          value: (o.laborExpense || 0) + (o.partsExpense || 0)
        })).filter(x => x.value > 0).sort((a,b) => b.value - a.value).slice(0, 5),
        otherExpenses: expenses
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
    const state = { orders, expenses, aiAnalysis };
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    navigator.clipboard.writeText(url);
    showToast("Link copiado!");
  };

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

        {/* --- INPUT SECTIONS (No Print) --- */}
        <div className="grid md:grid-cols-3 gap-6 no-print">
          
          {/* OS Input */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="text-blue-500" /> Nova Ordem de Serviço
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input 
                type="text" 
                placeholder="Nº OS"
                value={newOrder.osNumber}
                onChange={e => setNewOrder({...newOrder, osNumber: e.target.value})}
                className="col-span-1 p-2 border rounded text-sm"
              />
              <select 
                value={newOrder.status}
                onChange={e => setNewOrder({...newOrder, status: e.target.value as any})}
                className="col-span-1 p-2 border rounded text-sm"
              >
                <option>Entrada</option>
                <option>Reparo</option>
                <option>Concluída</option>
              </select>
              <select 
                value={newOrder.paymentMethod}
                onChange={e => setNewOrder({...newOrder, paymentMethod: e.target.value as any})}
                className="col-span-2 p-2 border rounded text-sm"
              >
                <option>PIX</option>
                <option>Cartão</option>
                <option>Dinheiro</option>
              </select>
              
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-green-600">Entrada MO</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newOrder.laborIncome || ""}
                    onChange={e => setNewOrder({...newOrder, laborIncome: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-green-200 rounded text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-green-600">Entrada Peça</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newOrder.partsIncome || ""}
                    onChange={e => setNewOrder({...newOrder, partsIncome: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-green-200 rounded text-sm"
                  />
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-red-500">Saída MO</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newOrder.laborExpense || ""}
                    onChange={e => setNewOrder({...newOrder, laborExpense: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-red-200 rounded text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-red-500">Saída Peça</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={newOrder.partsExpense || ""}
                    onChange={e => setNewOrder({...newOrder, partsExpense: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-red-200 rounded text-sm"
                  />
                </div>
              </div>

              <button 
                onClick={handleAddOrder}
                className="col-span-4 mt-2 bg-slate-900 text-white p-2 rounded hover:bg-slate-800 text-sm font-medium"
              >
                Adicionar OS
              </button>
            </div>
          </div>

          {/* Expenses Input */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Minus className="text-red-500" /> Despesa Avulsa
            </h2>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Descrição (ex: Aluguel)"
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                className="w-full p-2 border rounded text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                  className="p-2 border rounded text-sm"
                >
                  <option>Salário</option>
                  <option>Insumo</option>
                  <option>Aluguel</option>
                  <option>Imposto</option>
                  <option>Outro</option>
                </select>
                <input 
                  type="number" 
                  placeholder="R$ 0.00"
                  value={newExpense.value || ""}
                  onChange={e => setNewExpense({...newExpense, value: parseFloat(e.target.value)})}
                  className="p-2 border rounded text-sm"
                />
              </div>
              <button 
                onClick={handleAddExpense}
                className="w-full bg-red-50 text-red-600 border border-red-200 p-2 rounded hover:bg-red-100 text-sm font-medium"
              >
                Lançar Despesa
              </button>
            </div>
          </div>

        </div>

        {/* --- REPORT CONTENT (Printable) --- */}
        <div id="report-content" className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 space-y-8">
          
          <div className="border-b pb-4 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Relatório de Fechamento</h2>
              <p className="text-slate-500 text-sm">Gerado em {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">TechFlow System</p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <TrendingUp size={18} /> <span className="text-sm font-bold uppercase">Receita Bruta</span>
              </div>
              <p className="text-2xl font-bold text-green-800">{fmt(summary.grossRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">{orders.length} ordens de serviço</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <TrendingDown size={18} /> <span className="text-sm font-bold uppercase">Despesas Totais</span>
              </div>
              <p className="text-2xl font-bold text-red-800">{fmt(summary.totalExpenses)}</p>
              <div className="flex justify-between text-xs text-red-600 mt-1">
                <span>Diretas: {fmt(summary.directCostsTotal)}</span>
                <span>Op.: {fmt(summary.operationalExpensesTotal)}</span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${summary.netProfit >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className={`flex items-center gap-2 mb-1 ${summary.netProfit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                <DollarSign size={18} /> <span className="text-sm font-bold uppercase">Lucro Líquido</span>
              </div>
              <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                {fmt(summary.netProfit)}
              </p>
              <p className={`text-xs mt-1 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Margem: {summary.grossRevenue ? ((summary.netProfit / summary.grossRevenue) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>

          {/* Tables Section */}
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Orders Table */}
            <div>
              <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 border-b pb-2">Detalhamento de OS</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                    <tr>
                      <th className="px-2 py-2">OS</th>
                      <th className="px-2 py-2">Rec.</th>
                      <th className="px-2 py-2">Custo</th>
                      <th className="px-2 py-2">Lucro</th>
                      <th className="px-2 py-2 text-right no-print">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(order => {
                      const rev = (order.laborIncome || 0) + (order.partsIncome || 0);
                      const cost = (order.laborExpense || 0) + (order.partsExpense || 0);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-2 py-2 font-medium">{order.osNumber}</td>
                          <td className="px-2 py-2 text-green-600">{fmt(rev)}</td>
                          <td className="px-2 py-2 text-red-500">{fmt(cost)}</td>
                          <td className="px-2 py-2 font-bold">{fmt(rev - cost)}</td>
                          <td className="px-2 py-2 text-right no-print">
                            <button onClick={() => removeOrder(order.id)} className="text-slate-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-4 text-slate-400">Nenhuma OS lançada.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses & Mix Table */}
            <div className="space-y-6">
              
              {/* Operational Expenses */}
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 border-b pb-2">Despesas Operacionais</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                      <tr>
                        <th className="px-2 py-2">Desc.</th>
                        <th className="px-2 py-2">Cat.</th>
                        <th className="px-2 py-2 text-right">Valor</th>
                        <th className="px-2 py-2 text-right no-print"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.map(exp => (
                        <tr key={exp.id}>
                          <td className="px-2 py-2">{exp.description}</td>
                          <td className="px-2 py-2 text-xs text-slate-500">{exp.category}</td>
                          <td className="px-2 py-2 text-right text-red-600">{fmt(exp.value)}</td>
                          <td className="px-2 py-2 text-right no-print">
                            <button onClick={() => removeExpense(exp.id)} className="text-slate-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {expenses.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-4 text-slate-400">Nenhuma despesa extra.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Mix */}
              <div>
                <h3 className="text-sm font-bold uppercase text-slate-500 mb-3 border-b pb-2">Formas de Pagamento</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">PIX</div>
                    <div className="font-bold text-slate-700">{fmt(summary.paymentMix.PIX)}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">Cartão</div>
                    <div className="font-bold text-slate-700">{fmt(summary.paymentMix.Cartao)}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">Dinheiro</div>
                    <div className="font-bold text-slate-700">{fmt(summary.paymentMix.Dinheiro)}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <div className="mt-8 border-t pt-6 bg-indigo-50/50 p-6 rounded-xl border-indigo-100">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="text-indigo-600" />
                <h3 className="text-lg font-bold text-indigo-900">Análise Inteligente (Gemini)</h3>
              </div>
              
              <div className="space-y-4 text-sm text-slate-700">
                <p className="italic text-lg font-medium text-slate-800">"{aiAnalysis.summary}"</p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                    <strong className="block text-green-700 mb-2 uppercase text-xs">Pontos Positivos</strong>
                    <ul className="list-disc pl-4 space-y-1">
                      {aiAnalysis.positives.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                    <strong className="block text-orange-700 mb-2 uppercase text-xs">Alertas</strong>
                    <ul className="list-disc pl-4 space-y-1">
                      {aiAnalysis.alerts.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <strong className="block text-blue-700 mb-2 uppercase text-xs">Dicas Estratégicas</strong>
                    <ul className="list-disc pl-4 space-y-1">
                      {aiAnalysis.tips.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* AI Trigger Action (No Print) */}
        <div className="flex justify-center no-print pb-12">
          <button 
            onClick={handleAIAnalysis}
            disabled={loadingAI || orders.length === 0}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingAI ? (
              <>Calculando...</>
            ) : (
              <>
                <BrainCircuit size={24} /> 
                <span className="text-lg font-medium">Gerar Análise Financeira com IA</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}