'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Flag, Trophy, Star } from 'lucide-react';

// --- Types ---
type Seller = {
  id: string;
  name: string;
  photo_url: string | null;
  total_sales: number;
  hire_date: string;
  google_reviews_count: number;
};

type Goals = {
  daily?: { target_amount: number; prize_description: string };
  weekly?: { target_amount: number; prize_description: string };
  monthly?: { target_amount: number; prize_description: string };
};

// --- Sound Helpers ---
const playSound = (type: 'levelup' | 'overtake') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'levelup') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export default function RankingPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [goals, setGoals] = useState<Goals>({});
  const [loading, setLoading] = useState(true);
  const prevSellersRef = useRef<Seller[]>([]);

  // Polling Data
  const fetchData = async () => {
    try {
      const res = await fetch('/api/ranking');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      
      if (!data || !data.sellers) {
        setSellers([]);
        return;
      }

      const rawSellers = Array.isArray(data.sellers) ? data.sellers : [];
      const normalized: Seller[] = rawSellers.map((entry: any, index: number) => {
        const sellerData = entry?.seller ?? entry ?? {};
        const totalSales = Number(entry?.month_total ?? entry?.total_sales ?? sellerData?.total_sales ?? 0);
        const reviewsCount = Number(entry?.google_reviews_count ?? sellerData?.google_reviews_count ?? 0);
        const name = typeof sellerData?.name === 'string' && sellerData.name.trim().length > 0
          ? sellerData.name
          : `Vendedor ${index + 1}`;
        const id = typeof sellerData?.id === 'string' && sellerData.id.length > 0
          ? sellerData.id
          : `${index}-${name}`;
        return {
          id,
          name,
          photo_url: typeof sellerData?.photo_url === 'string'
            ? sellerData.photo_url
            : typeof sellerData?.photo === 'string'
              ? sellerData.photo
              : null,
          total_sales: Number.isFinite(totalSales) ? totalSales : 0,
          hire_date: typeof sellerData?.hire_date === 'string'
            ? sellerData.hire_date
            : typeof sellerData?.hired_at === 'string'
              ? sellerData.hired_at
              : '',
          google_reviews_count: Number.isFinite(reviewsCount) ? reviewsCount : 0
        };
      });

      const sorted = normalized.sort((a, b) => b.total_sales - a.total_sales);

      // Sound triggers
      if (prevSellersRef.current.length > 0) {
        const hasNewSales = sorted.some(s => {
          const prev = prevSellersRef.current.find(p => p.id === s.id);
          return prev && s.total_sales > prev.total_sales;
        });
        const hasOvertaken = sorted.some((s, i) => {
          const prevIndex = prevSellersRef.current.findIndex(p => p.id === s.id);
          return prevIndex !== -1 && prevIndex !== i;
        });

        if (hasNewSales) playSound('levelup');
        if (hasOvertaken) playSound('overtake');
      }

      setSellers(sorted);
      const goalsData = data.goals || {};
      const normalizeGoal = (goal: any) => {
        if (!goal) return undefined;
        return {
          target_amount: Number(goal.target ?? goal.target_amount ?? 0),
          prize_description: goal.prize ?? goal.prize_description ?? ''
        };
      };
      setGoals({
        daily: normalizeGoal(goalsData.daily ?? goalsData.day),
        weekly: normalizeGoal(goalsData.weekly ?? goalsData.week),
        monthly: normalizeGoal(goalsData.monthly ?? goalsData.month)
      });
      prevSellersRef.current = sorted;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate track scale
  // Max scale is usually the Monthly Goal. If someone exceeds it, we scale up to their sales + buffer.
  const monthlyGoal = goals?.monthly?.target_amount || 20000; // default fallback
  const maxSales = sellers.length > 0 ? Math.max(...sellers.map(s => s.total_sales), 0) : 0;
  const trackMax = Math.max(monthlyGoal, maxSales * 1.1); // Add 10% buffer if goal exceeded

  const getPositionPercentage = (value: number) => {
    return Math.min((value / trackMax) * 100, 100);
  };

  if (loading && sellers.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-[#E60012]">
        <div className="animate-pulse text-2xl font-black uppercase tracking-widest">
          Carregando Pista...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden relative selection:bg-[#E60012] selection:text-white flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="flex-none h-24 bg-gradient-to-b from-black/90 to-transparent z-20 flex items-center justify-between px-8 border-b border-[#E60012]/20">
        <div className="flex items-center gap-4">
          <div className="bg-[#E60012] p-2 rounded transform -skew-x-12 shadow-[0_0_15px_#E60012]">
            <Trophy className="w-8 h-8 text-white transform skew-x-12" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Corrida de Vendas
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-[#E60012] animate-pulse">
              <div className="w-2 h-2 bg-[#E60012] rounded-full" />
              LIVE TIMING
            </div>
          </div>
        </div>

        {/* Goals Legend */}
        <div className="flex gap-6">
          {[
            { label: 'Dia', val: goals.daily, color: 'text-blue-400', border: 'border-blue-500' },
            { label: 'Semana', val: goals.weekly, color: 'text-yellow-400', border: 'border-yellow-500' },
            { label: 'Mês', val: goals.monthly, color: 'text-[#E60012]', border: 'border-[#E60012]' }
          ].map((g) => (
            <div key={g.label} className={`flex flex-col items-end border-r-4 ${g.border} pr-3 bg-black/50 p-2 rounded`}>
              <span className={`text-xs font-bold uppercase ${g.color}`}>{g.label}</span>
              <span className="font-mono text-xl font-bold">
                R$ {g.val?.target_amount?.toLocaleString('pt-BR', { notation: 'compact' }) || '0'}
              </span>
              <span className="text-[10px] text-gray-500 max-w-[100px] truncate">{g.val?.prize_description}</span>
            </div>
          ))}
        </div>
      </header>

      {/* --- TRACK AREA --- */}
      <main className="flex-grow relative overflow-y-auto overflow-x-hidden p-8 perspective-1000">
        
        {/* Track Background Grid */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px), linear-gradient(#333 1px, transparent 1px)',
               backgroundSize: '100px 100px',
               transform: 'perspective(500px) rotateX(20deg) scale(1.5)'
             }} 
        />

        {/* Goal Lines (Vertical) */}
        <div className="absolute top-0 bottom-0 left-8 right-8 z-0 pointer-events-none">
          {goals.daily && (
            <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-blue-500/50 flex flex-col justify-end pb-2"
                 style={{ left: `${getPositionPercentage(goals.daily.target_amount)}%` }}>
              <span className="bg-blue-900/80 text-blue-200 text-[10px] px-1 rounded -ml-4 mb-1">DIA</span>
            </div>
          )}
          {goals.weekly && (
            <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-yellow-500/50 flex flex-col justify-end pb-2"
                 style={{ left: `${getPositionPercentage(goals.weekly.target_amount)}%` }}>
              <span className="bg-yellow-900/80 text-yellow-200 text-[10px] px-1 rounded -ml-4 mb-1">SEM</span>
            </div>
          )}
          {goals.monthly && (
            <div className="absolute top-0 bottom-0 border-l-4 border-[#E60012] flex flex-col justify-end pb-2 shadow-[0_0_20px_rgba(230,0,18,0.4)]"
                 style={{ left: `${getPositionPercentage(goals.monthly.target_amount)}%` }}>
              <div className="absolute -top-4 -ml-3">
                <Flag className="w-6 h-6 text-[#E60012] fill-current" />
              </div>
              <span className="bg-[#E60012] text-white text-[10px] font-bold px-1 rounded -ml-5 mb-1">META</span>
            </div>
          )}
        </div>

        {/* Lanes */}
        <div className="relative z-10 space-y-6 mt-4">
          <AnimatePresence>
            {sellers.map((seller, index) => {
              const progress = getPositionPercentage(seller.total_sales);
              const isLead = index === 0;
              
              return (
                <motion.div
                  key={seller.id}
                  layout
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative h-20 bg-gray-900/80 rounded-r-full border-l-4 border-gray-700 flex items-center overflow-visible group"
                  style={{
                    borderColor: isLead ? '#E60012' : '#333',
                    boxShadow: isLead ? '0 0 20px rgba(230,0,18,0.1)' : 'none'
                  }}
                >
                  {/* Lane Markings */}
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                  
                  {/* Start Line Info */}
                  <div className="absolute left-0 w-48 pl-4 flex items-center gap-3 z-20 bg-gradient-to-r from-black via-black to-transparent">
                    <div className="text-2xl font-black italic text-gray-600 w-8">#{index + 1}</div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white truncate max-w-[120px]">{seller.name}</span>
                      <span className="text-xs text-gray-400 font-mono">
                        {seller.google_reviews_count > 0 && (
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Star size={10} fill="currentColor" /> {seller.google_reviews_count}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* The Racer (Progress Bar + Avatar) */}
                  <div className="absolute left-0 top-0 bottom-0 right-8 flex items-center">
                    {/* Progress Track (Empty) */}
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden absolute"></div>
                    
                    {/* Active Progress */}
                    <motion.div 
                      className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-[#E60012]/50 to-[#E60012]"
                      style={{ width: `${progress}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    >
                      {/* Particles Trail */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2">
                        <div className="w-24 h-8 bg-[#E60012] blur-xl opacity-40 rounded-full" />
                      </div>
                    </motion.div>

                    {/* Avatar Head (The Car) */}
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 z-30"
                      style={{ left: `${progress}%` }}
                      initial={{ left: 0 }}
                      animate={{ left: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    >
                      <div className="relative -ml-8 group-hover:scale-110 transition-transform duration-300">
                        <div className={`w-16 h-16 rounded-full border-4 overflow-hidden bg-gray-800 relative z-10 ${isLead ? 'border-[#E60012] shadow-[0_0_15px_#E60012]' : 'border-gray-500'}`}>
                          {seller.photo_url ? (
                            <img src={seller.photo_url} alt={seller.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xl">{seller.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-semibold py-1 px-2 rounded border border-gray-700 whitespace-nowrap max-w-[140px] truncate">
                          {seller.name}
                        </div>
                        
                        {/* Current Value Tooltip (Always visible or hover?) Let's make it always visible above */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs font-mono py-1 px-2 rounded border border-gray-700 whitespace-nowrap">
                          R$ {seller.total_sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="h-12 bg-black border-t border-gray-800 flex items-center justify-between px-8 text-xs text-gray-500 font-mono">
        <div>
          <span className="text-[#E60012]">BALÃO DA INFORMÁTICA</span> • SISTEMA DE RANKING
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E60012]"></div> LÍDER
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-dashed border-blue-500"></div> META DIÁRIA
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-[#E60012]"></div> META MENSAL
          </div>
        </div>
      </footer>

    </div>
  );
}
