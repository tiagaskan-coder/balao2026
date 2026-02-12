'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// Web Audio API helper for sound generation
const playLevelUpSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const playOvertakeSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export default function RankingPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [goals, setGoals] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const prevSellersRef = useRef<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ranking');
      const data = await res.json();
      
      // Sort sellers by sales amount descending
      const sortedSellers = (data.sellers || []).sort((a: any, b: any) => b.total_sales - a.total_sales);
      
      // Check for changes to trigger sounds
      if (prevSellersRef.current.length > 0) {
        // Check for sales increase
        const hasNewSales = sortedSellers.some((seller: any) => {
          const prev = prevSellersRef.current.find(p => p.id === seller.id);
          return prev && seller.total_sales > prev.total_sales;
        });

        // Check for rank change (overtake)
        const hasOvertaken = sortedSellers.some((seller: any, index: number) => {
          const prevIndex = prevSellersRef.current.findIndex(p => p.id === seller.id);
          return prevIndex !== -1 && prevIndex !== index;
        });

        if (hasNewSales) playLevelUpSound();
        if (hasOvertaken) playOvertakeSound();
      }

      setSellers(sortedSellers);
      setGoals(data.goals || {});
      prevSellersRef.current = sortedSellers;
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Particle effect
  const particles = Array.from({ length: 20 });

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden relative selection:bg-[#E60012] selection:text-white">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-[#E60012] rounded-full opacity-20"
            initial={{
              x: Math.random() * 100 + "vw",
              y: Math.random() * 100 + "vh",
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * -100 + "vh"],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-[0_0_10px_rgba(230,0,18,0.5)]">
            Ranking de Vendas
          </h1>
          <p className="text-[#E60012] font-mono text-lg tracking-widest mt-2 animate-pulse">
            LIVE UPDATES ENABLED
          </p>
        </div>
        
        {/* Goals Display */}
        <div className="flex gap-6">
          {['Dia', 'Semana', 'Mês'].map((period) => (
            <div key={period} className="bg-gray-900/80 backdrop-blur border border-[#E60012]/30 p-4 rounded-lg min-w-[150px] text-center shadow-[0_0_15px_rgba(230,0,18,0.1)]">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Meta do {period}</div>
              <div className="text-xl font-bold text-white">
                R$ {goals[period === 'Dia' ? 'daily' : period === 'Semana' ? 'weekly' : 'monthly']?.target_amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </div>
              <div className="text-xs text-[#E60012] mt-1 truncate">
                {goals[period === 'Dia' ? 'daily' : period === 'Semana' ? 'weekly' : 'monthly']?.prize_description || 'Sem prêmio'}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Main Race Track */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-4">
        {loading && sellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#E60012] animate-pulse">
            <div className="text-2xl font-black uppercase tracking-widest mb-2">Carregando Pilotos...</div>
            <div className="w-64 h-2 bg-gray-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-[#E60012]"
                animate={{ x: [-256, 256] }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sellers.map((seller, index) => {
              const maxSales = Math.max(...sellers.map(s => s.total_sales), 1); // Avoid division by zero
              const percentage = Math.min((seller.total_sales / (goals.monthly?.target_amount || maxSales * 1.2)) * 100, 100);
              
              return (
                <motion.div
                  key={seller.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative group"
                >
                  {/* Rank Number */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-8 text-right font-black text-2xl text-gray-600 italic">
                    #{index + 1}
                  </div>

                  {/* Card */}
                  <div className="bg-gray-900/90 border-l-4 border-[#E60012] rounded-r-xl p-4 flex items-center gap-6 shadow-lg hover:shadow-[0_0_20px_rgba(230,0,18,0.2)] transition-shadow">
                    
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-[#E60012] overflow-hidden">
                        {seller.photo_url ? (
                          <img src={seller.photo_url} alt={seller.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                            {seller.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {/* Risk Indicator */}
                      {seller.risk_alert && (
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-black shadow-lg"
                        >
                          RISCO
                        </motion.div>
                      )}
                    </div>

                    {/* Info & Progress */}
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-wide">{seller.name}</h3>
                        <div className="text-right">
                          <span className="text-sm text-gray-400 mr-2">Total Vendas</span>
                          <span className="text-2xl font-mono font-bold text-[#E60012]">
                            R$ {seller.total_sales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="h-4 bg-gray-800 rounded-full overflow-hidden relative">
                        {/* Bar */}
                        <motion.div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#E60012] to-red-500 shadow-[0_0_10px_#E60012]"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                        
                        {/* Milestones / Grid lines */}
                        <div className="absolute inset-0 flex justify-between px-2">
                          {[25, 50, 75].map(p => (
                            <div key={p} className="h-full w-px bg-black/30" />
                          ))}
                        </div>
                      </div>
                      
                      {/* Stats Footer */}
                      <div className="flex gap-4 mt-2 text-xs font-mono text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          Google Reviews: {seller.google_reviews_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Contratado em: {new Date(seller.hire_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          </div>
        )}
      </main>
      
      {/* Footer Info */}
      <footer className="fixed bottom-4 right-4 text-xs text-gray-600 font-mono">
        Atualizado a cada 5s • Balão da Informática
      </footer>
    </div>
  );
}
