'use client';

import { useEffect, useState } from "react";
import { Save, Award, DollarSign, UserPlus, ExternalLink, Trophy, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function RankingAdminPanel() {
  const [sellers, setSellers] = useState<{ id: string; name: string }[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>("");
  const [saleValue, setSaleValue] = useState<number | ''>('');
  const [bonusValue, setBonusValue] = useState<number>(50);

  const [goals, setGoals] = useState<{ dayTarget: number; dayPrize: string; weekTarget: number; weekPrize: string; monthTarget: number; monthPrize: string }>({
    dayTarget: 500,
    dayPrize: "Guloseimas",
    weekTarget: 5000,
    weekPrize: "Vale Compras",
    monthTarget: 20000,
    monthPrize: "Grande Prêmio",
  });

  const [newSeller, setNewSeller] = useState<{ name: string; photo?: string; hired_at: string }>({
    name: "",
    photo: "",
    hired_at: new Date().toISOString().slice(0, 10),
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = () => {
    fetch("/api/ranking")
      .then(res => res.json())
      .then(data => {
        const sellers = (data.sellers || []).map((s: any) => s.seller);
        setSellers(sellers);
        if (sellers.length > 0 && !selectedSeller) setSelectedSeller(sellers[0].id);
        const g = data.goals || {};
        setGoals({
          dayTarget: Number(g.day?.target ?? 500),
          dayPrize: g.day?.prize ?? "Guloseimas",
          weekTarget: Number(g.week?.target ?? 5000),
          weekPrize: g.week?.prize ?? "Vale Compras",
          monthTarget: Number(g.month?.target ?? 20000),
          monthPrize: g.month?.prize ?? "Grande Prêmio",
        });
      })
      .catch(() => {});
  };

  const handleAction = async (action: () => Promise<void>, msg: string) => {
    setLoading(true);
    try {
      await action();
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchSellers(); // Refresh data
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitSale = async () => {
    if (!selectedSeller || !saleValue || Number(saleValue) <= 0) return;
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "record_sale", sellerId: selectedSeller, value: Number(saleValue) })
    });
    setSaleValue('');
  };

  const submitReview = async () => {
    if (!selectedSeller) return;
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_review", sellerId: selectedSeller, bonusValue })
    });
    setBonusValue(50);
  };

  const saveGoals = async () => {
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set_goals",
        goals: [
          { type: "day", target: goals.dayTarget, prize: goals.dayPrize },
          { type: "week", target: goals.weekTarget, prize: goals.weekPrize },
          { type: "month", target: goals.monthTarget, prize: goals.monthPrize },
        ]
      })
    });
  };

  const createSeller = async () => {
    if (!newSeller.name || !newSeller.hired_at) return;
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_seller", ...newSeller })
    });
    setNewSeller({ name: "", photo: "", hired_at: new Date().toISOString().slice(0, 10) });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Painel de Controle do Ranking</h2>
          <p className="text-gray-500">Gerencie vendas, metas e vendedores para a gamificação.</p>
        </div>
        <Link 
          href="/ranking" 
          target="_blank" 
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-lg shadow-gray-200"
        >
          <ExternalLink size={18} />
          Abrir Ranking (TV)
        </Link>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Award size={18} />
          {successMsg}
        </div>
      )}

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Record Sale Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-[#E60012] to-red-600 p-4 text-white flex items-center gap-3">
            <DollarSign className="w-6 h-6" />
            <h3 className="font-bold text-lg">Lançar Venda</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
              <select 
                value={selectedSeller} 
                onChange={(e) => setSelectedSeller(e.target.value)} 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#E60012] focus:border-[#E60012] p-2.5 bg-gray-50"
              >
                {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor da Venda (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                <input 
                  type="number" 
                  value={saleValue} 
                  onChange={(e) => setSaleValue(Number(e.target.value))} 
                  placeholder="0,00" 
                  className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-[#E60012] focus:border-[#E60012] p-2.5" 
                />
              </div>
            </div>
            <button 
              onClick={() => handleAction(submitSale, 'Venda registrada com sucesso!')}
              disabled={loading || !saleValue}
              className="w-full bg-[#E60012] text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              Registrar Venda
            </button>
          </div>
        </div>

        {/* Google Review Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex items-center gap-3">
            <Award className="w-6 h-6" />
            <h3 className="font-bold text-lg">Avaliação Google</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor Premiado</label>
              <select 
                value={selectedSeller} 
                onChange={(e) => setSelectedSeller(e.target.value)} 
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 bg-gray-50"
              >
                {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Bônus (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                <input 
                  type="number" 
                  value={bonusValue} 
                  onChange={(e) => setBonusValue(Number(e.target.value))} 
                  className="w-full pl-10 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5" 
                />
              </div>
            </div>
            <button 
              onClick={() => handleAction(submitReview, 'Bônus de avaliação aplicado!')}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Award size={20} />
              Aplicar Bônus
            </button>
          </div>
        </div>
      </div>

      {/* Goals Configuration */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Trophy className="text-yellow-600" />
          <h3 className="font-bold text-gray-800">Configuração de Metas e Prêmios</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Daily Goal */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Meta Diária</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Alvo (R$)</label>
                  <input 
                    type="number" 
                    value={goals.dayTarget} 
                    onChange={(e) => setGoals({ ...goals, dayTarget: Number(e.target.value) })} 
                    className="w-full border-gray-300 rounded p-2 focus:ring-[#E60012] focus:border-[#E60012]" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Prêmio</label>
                  <input 
                    type="text" 
                    value={goals.dayPrize} 
                    onChange={(e) => setGoals({ ...goals, dayPrize: e.target.value })} 
                    className="w-full border-gray-300 rounded p-2 focus:ring-[#E60012] focus:border-[#E60012]" 
                  />
                </div>
              </div>
            </div>

            {/* Weekly Goal */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Meta Semanal</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Alvo (R$)</label>
                  <input 
                    type="number" 
                    value={goals.weekTarget} 
                    onChange={(e) => setGoals({ ...goals, weekTarget: Number(e.target.value) })} 
                    className="w-full border-gray-300 rounded p-2 focus:ring-[#E60012] focus:border-[#E60012]" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Prêmio</label>
                  <input 
                    type="text" 
                    value={goals.weekPrize} 
                    onChange={(e) => setGoals({ ...goals, weekPrize: e.target.value })} 
                    className="w-full border-gray-300 rounded p-2 focus:ring-[#E60012] focus:border-[#E60012]" 
                  />
                </div>
              </div>
            </div>

            {/* Monthly Goal */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3 uppercase text-xs tracking-wider">Meta Mensal</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Alvo (R$)</label>
                  <input 
                    type="number" 
                    value={goals.monthTarget} 
                    onChange={(e) => setGoals({ ...goals, monthTarget: Number(e.target.value) })} 
                    className="w-full border-gray-300 rounded p-2 focus:ring-[#E60012] focus:border-[#E60012]" 
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Prêmio</label>
                  <input 
                    type="text" 
                    value={goals.monthPrize} 
                    onChange={(e) => setGoals({ ...goals, monthPrize: e.target.value })} 
                    className="w-full border-gray-300 rounded p-2 focus:ring-[#E60012] focus:border-[#E60012]" 
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => handleAction(saveGoals, 'Metas atualizadas com sucesso!')}
              disabled={loading}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              Salvar Alterações
            </button>
          </div>
        </div>
      </section>

      {/* Seller Management */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Users className="text-gray-600" />
          <h3 className="font-bold text-gray-800">Cadastro de Vendedores</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                value={newSeller.name} 
                onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })} 
                className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-[#E60012] focus:border-[#E60012]" 
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">URL da Foto</label>
              <input 
                type="text" 
                value={newSeller.photo} 
                onChange={(e) => setNewSeller({ ...newSeller, photo: e.target.value })} 
                className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-[#E60012] focus:border-[#E60012]" 
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Data Contratação</label>
              <input 
                type="date" 
                value={newSeller.hired_at} 
                onChange={(e) => setNewSeller({ ...newSeller, hired_at: e.target.value })} 
                className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-[#E60012] focus:border-[#E60012]" 
              />
            </div>
            <div className="md:col-span-1">
              <button 
                onClick={() => handleAction(createSeller, 'Vendedor cadastrado com sucesso!')}
                disabled={loading || !newSeller.name}
                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}