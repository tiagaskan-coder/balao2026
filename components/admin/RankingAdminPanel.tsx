'use client';

import { useEffect, useState } from "react";
import { Save, Award, DollarSign, UserPlus, ExternalLink, Trophy, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function RankingAdminPanel() {
  const [sellers, setSellers] = useState<{ id: string; name: string; badge_key?: string | null }[]>([]);
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

  const [newSeller, setNewSeller] = useState<{ name: string; photo?: string }>({
    name: "",
    photo: ""
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [flashChallenge, setFlashChallenge] = useState<{ id?: string; title: string; prize_value: number; active?: boolean } | null>(null);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengePrize, setChallengePrize] = useState<number | ''>('');

  const badgeOptions = [
    { key: 'shield-ruby', label: 'Rubi', colors: ['#E60012', '#8B0B14'] },
    { key: 'shield-emerald', label: 'Esmeralda', colors: ['#19C37D', '#0B6B45'] },
    { key: 'shield-sapphire', label: 'Safira', colors: ['#3B82F6', '#1E3A8A'] },
    { key: 'shield-amber', label: 'Âmbar', colors: ['#F59E0B', '#92400E'] },
    { key: 'shield-onyx', label: 'Ônix', colors: ['#111827', '#4B5563'] }
  ];

  const renderBadge = (badgeKey: string, size = 36) => {
    const badge = badgeOptions.find(b => b.key === badgeKey);
    if (!badge) return null;
    return (
      <svg width={size} height={size} viewBox="0 0 64 64">
        <defs>
          <linearGradient id={`${badgeKey}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={badge.colors[0]} />
            <stop offset="100%" stopColor={badge.colors[1]} />
          </linearGradient>
        </defs>
        <path
          d="M32 4L54 12V30C54 43 45 54 32 60C19 54 10 43 10 30V12L32 4Z"
          fill={`url(#${badgeKey}-g)`}
          stroke="#0B0B0B"
          strokeWidth="2"
        />
        <circle cx="32" cy="30" r="10" fill="#0B0B0B" opacity="0.35" />
        <path d="M32 16L36 26L46 26L38 32L41 42L32 36L23 42L26 32L18 26L28 26Z" fill="#F8FAFC" opacity="0.9" />
      </svg>
    );
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = () => {
    fetch("/api/ranking")
      .then(res => res.json())
      .then(data => {
        const sellers = (data.sellers || []).map((s: any) => s.seller ?? s);
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
        setFlashChallenge(data.flashChallenge || null);
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
    if (!newSeller.name) return;
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_seller", ...newSeller })
    });
    setNewSeller({ name: "", photo: "" });
  };

  const setBadge = async (badgeKey: string | null) => {
    if (!selectedSeller) return;
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_badge", sellerId: selectedSeller, badgeKey })
    });
  };

  const submitFlashChallenge = async () => {
    if (!challengeTitle || !challengePrize) return;
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_flash_challenge", title: challengeTitle, prizeValue: Number(challengePrize) })
    });
    setChallengeTitle("");
    setChallengePrize("");
  };

  const clearFlash = async () => {
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear_flash_challenge" })
    });
    setChallengeTitle("");
    setChallengePrize("");
  };

  const selectedSellerData = sellers.find(s => s.id === selectedSeller);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciadores do Ranking</h2>
          <p className="text-gray-500">Metas, desafios e vendedores centralizados em um só lugar.</p>
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

      <div className="flex flex-wrap gap-3">
        <a href="#gerenciador-metas" className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          Gerenciador de Metas
        </a>
        <a href="#gerenciador-desafios" className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          Gerenciador de Desafios
        </a>
        <a href="#gerenciador-vendedores" className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          Gerenciador de Vendedores
        </a>
      </div>

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
      <section id="gerenciador-metas" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Trophy className="text-yellow-600" />
          <h3 className="font-bold text-gray-800">Gerenciador de Metas</h3>
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

      <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Award className="text-[#E60012]" />
          <h3 className="font-bold text-gray-800">Escudos dos Vendedores</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-[#E60012] focus:border-[#E60012] p-2.5 bg-gray-50"
            >
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-center">
            <button
              onClick={() => handleAction(() => setBadge(null), 'Escudo removido com sucesso!')}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sem escudo
            </button>
            {badgeOptions.map(badge => {
              const isActive = selectedSellerData?.badge_key === badge.key;
              return (
                <button
                  key={badge.key}
                  onClick={() => handleAction(() => setBadge(badge.key), 'Escudo atualizado com sucesso!')}
                  className={`border rounded-lg p-2 flex items-center justify-center transition-colors ${isActive ? 'border-[#E60012] bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  {renderBadge(badge.key, 40)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="gerenciador-desafios" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Trophy className="text-red-600" />
          <h3 className="font-bold text-gray-800">Gerenciador de Desafios</h3>
        </div>
        <div className="p-6 space-y-6">
          {flashChallenge?.active && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="font-semibold">Ativo agora</div>
              <div className="text-sm">{flashChallenge.title} • R$ {flashChallenge.prize_value}</div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Descrição do desafio</label>
              <input
                type="text"
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-[#E60012] focus:border-[#E60012]"
                placeholder="Ex: 5 vendas em 1 hora"
              />
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Prêmio (R$)</label>
              <input
                type="number"
                value={challengePrize}
                onChange={(e) => setChallengePrize(Number(e.target.value))}
                className="w-full border-gray-300 rounded-lg p-2.5 focus:ring-[#E60012] focus:border-[#E60012]"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAction(submitFlashChallenge, 'Desafio flash publicado!')}
              disabled={loading || !challengeTitle || !challengePrize}
              className="bg-[#E60012] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Ativar Desafio
            </button>
            <button
              onClick={() => handleAction(clearFlash, 'Desafio flash encerrado!')}
              disabled={loading || !flashChallenge?.active}
              className="bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              Encerrar Desafio
            </button>
          </div>
        </div>
      </section>

      {/* Seller Management */}
      <section id="gerenciador-vendedores" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <Users className="text-gray-600" />
          <h3 className="font-bold text-gray-800">Gerenciador de Vendedores</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
