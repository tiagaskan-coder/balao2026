"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, AlertTriangle } from "lucide-react";

type SellerProgress = {
  seller: { id: string; name: string; photo?: string };
  month_total: number;
  progress_percent: number;
  risk_zone: boolean;
};

type Goals = {
  day?: { target: number; prize: string };
  week?: { target: number; prize: string };
  month?: { target: number; prize: string };
};

export default function RankingPage() {
  const [sellers, setSellers] = useState<SellerProgress[]>([]);
  const [goals, setGoals] = useState<Goals>({});
  const [stats, setStats] = useState<{ google_reviews_this_month: number; sales_this_month: number }>({ google_reviews_this_month: 0, sales_this_month: 0 });

  useEffect(() => {
    fetch("/api/ranking")
      .then(res => res.json())
      .then(data => {
        setSellers(data.sellers || []);
        setGoals(data.goals || {});
        setStats(data.stats || { google_reviews_this_month: 0, sales_this_month: 0 });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white font-sans">
      <header className="border-b border-[#1f2a44] bg-[#0b0f19]/90 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-wide">
            Ranking de Vendas
          </h1>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#38bdf8]">Avaliações Google (mês):</span>
              <span className="font-bold">{stats.google_reviews_this_month}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#a78bfa]">Vendas (mês):</span>
              <span className="font-bold">{stats.sales_this_month}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#22c55e] font-bold">
              <Trophy size={18} />
              Prêmio do Dia
            </div>
            <div className="mt-2 text-sm text-gray-300">
              Meta: R$ {goals.day?.target ?? 0} — {goals.day?.prize ?? "-"}
            </div>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#38bdf8] font-bold">
              <Trophy size={18} />
              Prêmio da Semana
            </div>
            <div className="mt-2 text-sm text-gray-300">
              Meta: R$ {goals.week?.target ?? 0} — {goals.week?.prize ?? "-"}
            </div>
          </div>
          <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[#a78bfa] font-bold">
              <Trophy size={18} />
              Grande Prêmio do Mês
            </div>
            <div className="mt-2 text-sm text-gray-300">
              Meta: R$ {goals.month?.target ?? 0} — {goals.month?.prize ?? "-"}
            </div>
          </div>
        </section>

        <section className="bg-[#0f172a] border border-[#1e293b] rounded-lg p-6">
          <div className="mb-4 text-sm text-gray-400">
            Passe o mouse sobre o avatar para ver quanto falta para a meta mensal.
          </div>
          <div className="space-y-6">
            {sellers.map((s, idx) => {
              const percent = s.progress_percent;
              const remaining = Math.max(0, (goals.month?.target ?? 0) - s.month_total);
              return (
                <div key={s.seller.id} className="relative">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <img
                        src={s.seller.photo || "/avatar.png"}
                        alt={s.seller.name}
                        className="w-12 h-12 rounded-full border border-[#334155] object-cover"
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/70 text-xs text-white rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                        Falta R$ {remaining.toFixed(2)} para a meta
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold tracking-wide">{idx + 1}. {s.seller.name}</div>
                        {s.risk_zone && (
                          <div className="flex items-center gap-1 text-[#f59e0b]">
                            <AlertTriangle size={16} />
                            Zona de Risco (3 meses sem bater meta)
                          </div>
                        )}
                      </div>
                      <div className="w-full h-4 bg-[#1f2937] rounded overflow-hidden">
                        <motion.div
                          className="h-4 bg-gradient-to-r from-[#22c55e] via-[#38bdf8] to-[#a78bfa]"
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Progresso mensal: {percent}% — Total com bônus: R$ {s.month_total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
