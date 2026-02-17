'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vendedor, ArenaConfig } from './types';
import { supabase } from '@/utils/supabase';
import { Trophy, Flag, Zap, Target, Crown, Flame, AlertCircle, RefreshCw } from 'lucide-react';

// Cores e Temas para os Corredores
const RANK_COLORS = [
  'from-yellow-400 via-orange-500 to-red-500', // 1º - Gold/Fire
  'from-slate-300 via-slate-400 to-slate-500', // 2º - Silver
  'from-amber-600 via-amber-700 to-amber-800', // 3º - Bronze
  'from-blue-500 via-indigo-500 to-purple-500', // Outros
];

export default function ArenaClient({
  vendedoresIniciais,
  configInicial
}: {
  vendedoresIniciais: Vendedor[],
  configInicial: ArenaConfig | null
}) {
  const [vendedores, setVendedores] = useState<Vendedor[]>(vendedoresIniciais || []);
  const [config, setConfig] = useState<ArenaConfig | null>(configInicial);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('CONNECTING');

  // Logs de Debug
  useEffect(() => {
    console.log('--- ARENA DEBUG ---');
    console.log('Vendedores Iniciais:', vendedoresIniciais);
    console.log('Config Inicial:', configInicial);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Definido' : 'Indefinido');
  }, [vendedoresIniciais, configInicial]);

  // Ordenação e Estatísticas
  const { sortedVendedores, totalVendas, totalMeta, progressoGeral } = useMemo(() => {
    if (!vendedores || vendedores.length === 0) {
        return { sortedVendedores: [], totalVendas: 0, totalMeta: 0, progressoGeral: 0 };
    }

    const sorted = [...vendedores].sort((a, b) => {
      const progA = a.meta_valor > 0 ? a.vendas_atual / a.meta_valor : 0;
      const progB = b.meta_valor > 0 ? b.vendas_atual / b.meta_valor : 0;
      return progB - progA; // Maior % primeiro
    });

    const totalVendas = vendedores.reduce((acc, v) => acc + v.vendas_atual, 0);
    const totalMeta = vendedores.reduce((acc, v) => acc + v.meta_valor, 0);
    const progressoGeral = totalMeta > 0 ? (totalVendas / totalMeta) * 100 : 0;

    return { sortedVendedores: sorted, totalVendas, totalMeta, progressoGeral };
  }, [vendedores]);

  // Realtime Subscription
  useEffect(() => {
    console.log('Iniciando conexão Realtime...');
    const channel = supabase
      .channel('arena-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arena_vendedores' },
        (payload) => {
          console.log('⚡ Realtime Event (Vendedores):', payload);
          setLastUpdate(new Date().toLocaleTimeString());
          
          if (payload.eventType === 'INSERT') {
            setVendedores(prev => {
                const exists = prev.some(v => v.id === payload.new.id);
                if (exists) return prev;
                return [...prev, payload.new as Vendedor];
            });
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
          console.log('⚡ Realtime Event (Config):', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setConfig(payload.new as ArenaConfig);
          }
        }
      )
      .subscribe((status) => {
        console.log('Status da Conexão:', status);
        setConnectionStatus(status);
      });

    return () => {
      console.log('Limpando canais...');
      supabase.removeChannel(channel);
    };
  }, []);

  if (!config?.ativo) {
    return <WaitingScreen title={config?.titulo} status={connectionStatus} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden flex flex-col font-sans relative">
      {/* Camada de Debug (Visível apenas se houver erro crítico ou status estranho) */}
      {connectionStatus !== 'SUBSCRIBED' && (
         <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 z-[100]">
            Status: {connectionStatus}
         </div>
      )}

      {/* Background Effects (Z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-slate-900/50" /> {/* Fallback background */}
      </div>

      {/* Header (Z-50) */}
      <header className="relative z-50 p-6 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Título e Status */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-lg opacity-50 rounded-xl" />
              <div className="relative bg-slate-900 p-3 rounded-xl border border-white/10 shadow-inner">
                <Flag className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-blue-100 to-slate-400 bg-clip-text text-transparent uppercase italic">
                {config.titulo || 'Arena de Vendas'}
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-300/80">
                <span className={`relative flex h-2 w-2`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectionStatus === 'SUBSCRIBED' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${connectionStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                {connectionStatus === 'SUBSCRIBED' ? 'AO VIVO' : 'CONECTANDO...'} {lastUpdate && `• ${lastUpdate}`}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4">
            <StatCard 
              icon={<Zap className="w-4 h-4 text-yellow-400" />}
              label="Vendas Totais"
              value={`R$ ${totalVendas.toLocaleString('pt-BR', { notation: 'compact' })}`}
              subtext={`${progressoGeral.toFixed(1)}% da Meta Global`}
            />
            <StatCard 
              icon={<Target className="w-4 h-4 text-red-400" />}
              label="Meta Equipe"
              value={`R$ ${totalMeta.toLocaleString('pt-BR', { notation: 'compact' })}`}
            />
          </div>
        </div>
      </header>

      {/* Pista de Corrida (Z-10) */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar p-4 md:p-8 z-10">
        <div className="max-w-[1800px] mx-auto space-y-4 pb-20 relative">
          
          {/* Grid Lines Background */}
          <div className="absolute inset-0 z-[-1] pointer-events-none opacity-10" 
               style={{ 
                 backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                 backgroundSize: '100px 100px',
               }} 
          />

          <AnimatePresence initial={false}>
            {sortedVendedores.map((v, index) => (
              <RacerRow 
                key={v.id} 
                data={v} 
                rank={index + 1} 
                isLeader={index === 0}
              />
            ))}
          </AnimatePresence>

          {(!sortedVendedores || sortedVendedores.length === 0) && (
            <div className="text-center py-32 relative z-20 flex flex-col items-center">
              <div className="inline-block p-6 rounded-full bg-slate-800/50 mb-4 border border-white/5 animate-pulse">
                <AlertCircle className="w-12 h-12 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg font-light mb-4">Nenhum competidor encontrado.</p>
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar Página
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- Componentes Auxiliares ---

function StatCard({ icon, label, value, subtext }: { icon: any, label: string, value: string, subtext?: string }) {
  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-xl min-w-[160px] shadow-lg">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      {subtext && <div className="text-[10px] text-slate-500 font-mono mt-1">{subtext}</div>}
    </div>
  );
}

function RacerRow({ data, rank, isLeader }: { data: Vendedor, rank: number, isLeader: boolean }) {
  const progresso = data.meta_valor > 0 ? (data.vendas_atual / data.meta_valor) * 100 : 0;
  const progressoLimitado = Math.min(Math.max(progresso, 0), 100);
  const bateuMeta = progresso >= 100;

  // Cores dinâmicas baseadas no Rank
  const rankColor = rank <= 3 ? RANK_COLORS[rank - 1] : RANK_COLORS[3];
  
  return (
    <motion.div
      layoutId={data.id} // Reordenação automática
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className={`relative group ${isLeader ? 'mb-8' : 'mb-3'}`}
      style={{ zIndex: 100 - rank }} // Garante que cards superiores fiquem por cima em sobreposições
    >
      {/* Efeito de destaque para o líder */}
      {isLeader && (
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 to-transparent blur-xl rounded-lg opacity-75 animate-pulse" />
      )}

      <div className="relative flex items-center gap-4 bg-slate-900/80 backdrop-blur-md border border-white/10 p-2 rounded-2xl pr-6 shadow-xl hover:border-white/20 transition-all hover:bg-slate-800/80">
        
        {/* Info Card (Esquerda) */}
        <div className="w-56 md:w-64 flex-shrink-0 flex items-center gap-4 bg-slate-800/90 p-3 rounded-xl border border-white/5 relative overflow-hidden z-20">
          {/* Rank Badge */}
          <div className={`absolute top-0 left-0 px-2 py-0.5 text-[10px] font-black italic text-white rounded-br-lg z-20 bg-gradient-to-br ${rankColor} shadow-sm`}>
            #{rank}
          </div>

          <div className="relative">
            <div className={`w-14 h-14 rounded-xl overflow-hidden border-2 ${bateuMeta ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'border-slate-600'} relative z-10 bg-slate-700`}>
              {data.avatar_url ? (
                <img src={data.avatar_url} alt={data.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400 bg-slate-800">
                  {data.nome.charAt(0)}
                </div>
              )}
            </div>
            {bateuMeta && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 z-20 bg-yellow-400 text-black p-1 rounded-full shadow-lg border-2 border-slate-900"
              >
                <Trophy className="w-3 h-3" />
              </motion.div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-white truncate text-sm leading-tight">{data.nome}</h3>
            <div className="flex flex-col mt-1">
              <span className="text-xs font-mono text-blue-300">R$ {data.vendas_atual.toLocaleString('pt-BR', { notation: 'compact' })}</span>
              <div className="w-full h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${bateuMeta ? 'bg-yellow-400' : 'bg-blue-500'}`} 
                  style={{ width: `${Math.min(progresso, 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pista */}
        <div className="flex-1 relative h-16 flex items-center mx-4 z-10">
          {/* Trilho de fundo */}
          <div className="absolute inset-x-0 h-3 bg-slate-800/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
            {/* Marcadores de Distância */}
            {[25, 50, 75].map(m => (
              <div key={m} className="absolute top-0 bottom-0 w-[1px] bg-white/10" style={{ left: `${m}%` }} />
            ))}
          </div>

          {/* Barra de Progresso Ativa */}
          <motion.div 
            className="absolute left-0 h-3 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${progressoLimitado}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
          >
            <div className={`w-full h-full bg-gradient-to-r ${
              bateuMeta 
                ? 'from-yellow-600 via-yellow-400 to-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.4)]' 
                : 'from-blue-900 via-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
            }`} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] w-1/2 h-full -skew-x-12 animate-shimmer" />
          </motion.div>

          {/* Veículo */}
          <motion.div
            className="absolute z-20 flex flex-col items-center"
            initial={{ left: 0 }}
            animate={{ left: `${progressoLimitado}%` }}
            transition={{ type: 'spring', stiffness: 40, damping: 20 }}
            style={{ x: '-50%', y: '-15%' }}
          >
            {/* Balão de Fala / Percentual */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-1 px-2 py-0.5 rounded-lg text-[10px] font-bold backdrop-blur-md border shadow-lg whitespace-nowrap ${
                bateuMeta 
                  ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' 
                  : 'bg-slate-800/90 border-slate-600 text-slate-300'
              }`}
            >
              {progresso.toFixed(0)}%
            </motion.div>

            {/* O Carro */}
            <div className="relative group cursor-pointer">
              <motion.div
                animate={{ 
                  y: [0, -2, 0],
                  rotate: isLeader ? [0, -1, 1, 0] : 0
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: isLeader ? 0.3 : 2, 
                  ease: "easeInOut" 
                }}
                className="text-4xl filter drop-shadow-2xl transform transition-transform hover:scale-110"
              >
                {data.veiculo_emoji || '🏎️'}
              </motion.div>
              
              {/* Efeitos Especiais (Fogo/Nitro) */}
              {isLeader && (
                <motion.div 
                  className="absolute top-1/2 -left-4 -translate-y-1/2 text-orange-500 text-lg mix-blend-screen"
                  animate={{ opacity: [0, 1, 0], x: [-5, -15], scale: [0.5, 1.5] }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                >
                  <Flame className="w-6 h-6 rotate-90" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Meta Flag */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col items-center gap-1 z-0">
            <div className="h-16 w-1 bg-white/10" />
            <div className="absolute top-0 transform -translate-y-full text-xs font-black text-white/20 uppercase tracking-widest rotate-90 origin-bottom-left ml-3">
              Finish
            </div>
          </div>
        </div>

        {/* Info Meta (Direita) */}
        <div className="w-24 text-right hidden md:block z-20">
          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Meta</div>
          <div className="text-sm font-bold text-slate-300">
            {data.meta_valor > 0 ? (data.meta_valor / 1000).toFixed(0) + 'k' : '-'}
          </div>
        </div>

      </div>
    </motion.div>
  );
}

function WaitingScreen({ title, status }: { title?: string, status: string }) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0f172a] to-[#0f172a]" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-8 relative z-10 max-w-2xl"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-32 h-32 mx-auto bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.3)] p-1"
        >
          <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-yellow-500/50">
            <Trophy className="w-14 h-14 text-yellow-500" />
          </div>
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
            {title || 'ARENA'}
          </h1>
          <p className="text-xl text-blue-300/80 font-light tracking-widest uppercase">
            Aguardando Início da Temporada
          </p>
          <div className="text-sm text-slate-500 font-mono">
            Status: {status}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
