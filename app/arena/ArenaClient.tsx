'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vendedor, ArenaConfig } from './types';
import { supabase } from '@/utils/supabase'; // Cliente client-side para Realtime
import { Trophy, Flag, AlertCircle } from 'lucide-react';

export default function ArenaClient({
  vendedoresIniciais,
  configInicial
}: {
  vendedoresIniciais: Vendedor[],
  configInicial: ArenaConfig | null
}) {
  const [vendedores, setVendedores] = useState<Vendedor[]>(vendedoresIniciais);
  const [config, setConfig] = useState<ArenaConfig | null>(configInicial);

  // Ordenar vendedores por vendas (Leaderboard dinâmico)
  const vendedoresOrdenados = [...vendedores].sort((a, b) => {
    const progressoA = a.meta_valor > 0 ? a.vendas_atual / a.meta_valor : 0;
    const progressoB = b.meta_valor > 0 ? b.vendas_atual / b.meta_valor : 0;
    // Critério: Maior % de meta ou maior valor absoluto? 
    // Geralmente em vendas ganha quem vendeu mais ou quem bateu mais meta.
    // Vamos priorizar % da meta para ser justo com metas diferentes,
    // ou valor absoluto se preferir. O prompt diz "Visualização de Corrida".
    // Vamos usar % da meta como critério principal de "distância percorrida".
    return progressoB - progressoA;
  });

  useEffect(() => {
    // Inscrever no canal Realtime
    const channel = supabase
      .channel('arena-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arena_vendedores' },
        (payload) => {
          console.log('Mudança em vendedores:', payload);
          if (payload.eventType === 'INSERT') {
            setVendedores(prev => [...prev, payload.new as Vendedor]);
          } else if (payload.eventType === 'UPDATE') {
            setVendedores(prev => prev.map(v => v.id === payload.new.id ? payload.new as Vendedor : v));
          } else if (payload.eventType === 'DELETE') {
            setVendedores(prev => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arena_config' },
        (payload) => {
          console.log('Mudança em config:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setConfig(payload.new as ArenaConfig);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!config?.ativo) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-yellow-500/50">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {config?.titulo || 'Arena de Vendas'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light">
            Aguardando início da corrida...
          </p>
          <div className="mt-8 flex justify-center gap-2">
             {[0, 1, 2].map(i => (
               <motion.div
                 key={i}
                 animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                 transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                 className="w-3 h-3 bg-white rounded-full"
               />
             ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <header className="flex-none p-6 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 z-10 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg shadow-blue-900/20">
            <Flag className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {config.titulo}
            </h1>
            <p className="text-blue-200 text-sm font-medium tracking-wide uppercase">Em tempo real</p>
          </div>
        </div>
        
        {/* Top 3 Mini Leaderboard (Opcional, mas legal) */}
        <div className="flex gap-4">
          {vendedoresOrdenados.slice(0, 3).map((v, i) => (
             <div key={v.id} className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
               <span className={`font-bold text-lg ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-400'}`}>
                 #{i + 1}
               </span>
               <span className="text-sm font-medium">{v.nome.split(' ')[0]}</span>
             </div>
          ))}
        </div>
      </header>

      {/* Pista de Corrida */}
      <main className="flex-1 relative p-6 overflow-y-auto custom-scrollbar">
        {/* Linhas de marcação de % no fundo */}
        <div className="absolute inset-0 pointer-events-none flex px-6 pb-6 pt-0">
          <div className="w-full h-full relative border-r-4 border-dashed border-white/10 ml-[200px]">
             {[25, 50, 75, 100].map(pct => (
               <div key={pct} className="absolute top-0 bottom-0 border-l border-white/5 flex flex-col justify-end pb-2 pl-2" style={{ left: `${pct}%` }}>
                 <span className="text-xs font-mono text-white/20">{pct}%</span>
               </div>
             ))}
             <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-yellow-500/0 via-yellow-500/50 to-yellow-500/0" />
             <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-yellow-500 text-black font-bold text-xs py-1 px-2 rounded rotate-90 origin-center">
               META
             </div>
          </div>
        </div>

        <div className="space-y-6 relative z-0">
          <AnimatePresence>
            {vendedoresOrdenados.map((v) => {
              const progresso = v.meta_valor > 0 ? (v.vendas_atual / v.meta_valor) * 100 : 0;
              const progressoLimitado = Math.min(Math.max(progresso, 0), 100);
              const bateuMeta = progresso >= 100;

              return (
                <motion.div
                  key={v.id}
                  layoutId={v.id} // Permite reordenação animada
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="relative group"
                >
                  {/* Container da Raia */}
                  <div className="flex items-center gap-4">
                    {/* Info do Piloto (Fixo à esquerda) */}
                    <div className="w-48 flex-shrink-0 flex items-center gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm relative z-10">
                       <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 relative">
                         {v.avatar_url ? (
                           <img src={v.avatar_url} alt={v.nome} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                             {v.nome.charAt(0)}
                           </div>
                         )}
                         {bateuMeta && (
                           <motion.div 
                             initial={{ scale: 0 }} animate={{ scale: 1 }} 
                             className="absolute inset-0 bg-yellow-500/30 flex items-center justify-center"
                           >
                             <Trophy className="w-6 h-6 text-yellow-300 drop-shadow-md" />
                           </motion.div>
                         )}
                       </div>
                       <div className="min-w-0">
                         <h3 className="font-bold text-white truncate text-sm">{v.nome}</h3>
                         <div className="flex items-baseline gap-1">
                           <span className="text-xs text-blue-300 font-mono">R$ {v.vendas_atual.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                           <span className="text-[10px] text-slate-500">/ {v.meta_valor.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                         </div>
                       </div>
                    </div>

                    {/* Área da Pista */}
                    <div className="flex-1 relative h-14 flex items-center">
                      {/* Barra de Progresso (Rastro) */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-slate-800 rounded-full w-full overflow-hidden">
                        <motion.div 
                          className={`h-full relative ${bateuMeta ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressoLimitado}%` }}
                          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                        >
                          {/* Partículas/Brilho no rastro se bater meta */}
                          {bateuMeta && (
                            <motion.div 
                              className="absolute inset-0 bg-white/20"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            />
                          )}
                        </motion.div>
                      </div>

                      {/* Veículo (Carro) */}
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                        initial={{ left: 0 }}
                        animate={{ left: `${progressoLimitado}%` }}
                        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                        style={{ x: '-50%' }} // Centraliza o carro no ponto final da barra
                      >
                        {/* Efeito de Rastro de Vento/Velocidade */}
                        <motion.div
                          className="absolute right-full mr-2 flex gap-1"
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <div className="w-4 h-0.5 bg-white/20 rounded-full" />
                          <div className="w-2 h-0.5 bg-white/10 rounded-full mt-1" />
                        </motion.div>

                        {/* O Veículo em si */}
                        <motion.div
                          animate={{ 
                            y: [0, -2, 0], // Trepidação do motor
                            rotate: [0, 1, -1, 0] 
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.5, // Mais rápido = mais velocidade? Poderia ser dinâmico
                            ease: "linear" 
                          }}
                          className="text-4xl filter drop-shadow-lg relative transform transition-transform hover:scale-125 cursor-pointer"
                        >
                          {v.veiculo_emoji}
                          
                          {/* Fumaça/Fogo se bateu meta */}
                          {bateuMeta && (
                            <motion.div 
                              className="absolute -right-2 top-1/2 text-sm"
                              animate={{ x: [0, 10], opacity: [1, 0], scale: [1, 2] }}
                              transition={{ repeat: Infinity, duration: 0.4 }}
                            >
                              💨
                            </motion.div>
                          )}
                        </motion.div>

                        {/* Percentual Flutuante */}
                        <div className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-md backdrop-blur-md border ${
                          bateuMeta 
                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' 
                            : 'bg-slate-900/50 border-slate-600 text-slate-300'
                        }`}>
                          {progresso.toFixed(0)}%
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {vendedores.length === 0 && (
             <div className="text-center py-20 text-slate-500">
               <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p>Nenhum piloto na pista.</p>
               <p className="text-sm">Acesse /arena/admin para adicionar competidores.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
