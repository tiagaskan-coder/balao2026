"use client";

import { useEffect, useState } from "react";
import { Save, Award, DollarSign, UserPlus } from "lucide-react";

export default function RankingAdminPanel() {
  const [sellers, setSellers] = useState<{ id: string; name: string }[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>("");
  const [saleValue, setSaleValue] = useState<number>(0);
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

  useEffect(() => {
    fetch("/api/ranking")
      .then(res => res.json())
      .then(data => {
        const sellers = (data.sellers || []).map((s: any) => s.seller);
        setSellers(sellers);
        if (sellers.length > 0) setSelectedSeller(sellers[0].id);
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
  }, []);

  const submitSale = async () => {
    if (!selectedSeller || saleValue <= 0) return;
    await fetch("/api/ranking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "record_sale", sellerId: selectedSeller, value: saleValue })
    });
    setSaleValue(0);
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
    <div className="space-y-8">
      <section className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><DollarSign className="text-[#E60012]" /> Lançamento de Vendas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={selectedSeller} onChange={(e) => setSelectedSeller(e.target.value)} className="border rounded p-2">
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="number" value={saleValue} onChange={(e) => setSaleValue(Number(e.target.value))} placeholder="Valor da venda (R$)" className="border rounded p-2" />
          <button onClick={submitSale} className="bg-[#E60012] text-white px-4 py-2 rounded font-medium">Registrar Venda</button>
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Award className="text-[#E60012]" /> Avaliações Google</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={selectedSeller} onChange={(e) => setSelectedSeller(e.target.value)} className="border rounded p-2">
            {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="number" value={bonusValue} onChange={(e) => setBonusValue(Number(e.target.value))} placeholder="Bônus (R$)" className="border rounded p-2" />
          <button onClick={submitReview} className="bg-[#E60012] text-white px-4 py-2 rounded font-medium">Nova Avaliação Google</button>
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Save className="text-[#E60012]" /> Configuração de Metas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border rounded">
            <div className="font-semibold mb-2">Meta do Dia</div>
            <div className="flex gap-2">
              <input type="number" value={goals.dayTarget} onChange={(e) => setGoals({ ...goals, dayTarget: Number(e.target.value) })} className="border rounded p-2 w-32" />
              <input type="text" value={goals.dayPrize} onChange={(e) => setGoals({ ...goals, dayPrize: e.target.value })} className="border rounded p-2 flex-1" />
            </div>
          </div>
          <div className="p-3 border rounded">
            <div className="font-semibold mb-2">Meta da Semana</div>
            <div className="flex gap-2">
              <input type="number" value={goals.weekTarget} onChange={(e) => setGoals({ ...goals, weekTarget: Number(e.target.value) })} className="border rounded p-2 w-32" />
              <input type="text" value={goals.weekPrize} onChange={(e) => setGoals({ ...goals, weekPrize: e.target.value })} className="border rounded p-2 flex-1" />
            </div>
          </div>
          <div className="p-3 border rounded">
            <div className="font-semibold mb-2">Meta do Mês</div>
            <div className="flex gap-2">
              <input type="number" value={goals.monthTarget} onChange={(e) => setGoals({ ...goals, monthTarget: Number(e.target.value) })} className="border rounded p-2 w-32" />
              <input type="text" value={goals.monthPrize} onChange={(e) => setGoals({ ...goals, monthPrize: e.target.value })} className="border rounded p-2 flex-1" />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button onClick={saveGoals} className="bg-[#E60012] text-white px-4 py-2 rounded font-medium">Salvar Metas</button>
        </div>
      </section>

      <section className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><UserPlus className="text-[#E60012]" /> Gestão de Vendedores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" value={newSeller.name} onChange={(e) => setNewSeller({ ...newSeller, name: e.target.value })} placeholder="Nome" className="border rounded p-2" />
          <input type="text" value={newSeller.photo} onChange={(e) => setNewSeller({ ...newSeller, photo: e.target.value })} placeholder="URL da Foto (opcional)" className="border rounded p-2" />
          <input type="date" value={newSeller.hired_at} onChange={(e) => setNewSeller({ ...newSeller, hired_at: e.target.value })} className="border rounded p-2" />
        </div>
        <div className="mt-3">
          <button onClick={createSeller} className="bg-[#E60012] text-white px-4 py-2 rounded font-medium">Cadastrar Vendedor</button>
        </div>
      </section>
    </div>
  );
}
