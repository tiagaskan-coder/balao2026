"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Zap, Swords, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Seller = {
  id: string;
  nome: string;
  avatar_url: string | null;
  meta_valor: number | null;
  criado_em: string;
};

type Sale = {
  id: string;
  vendedor_id: string;
  valor: number;
  is_google_bonus: boolean;
  criado_em: string;
};

type Challenge = {
  id: string;
  premio_semana: string;
  meta_global: number;
  premio_top1: string | null;
  premio_top2: string | null;
  premio_top3: string | null;
  premio_google: string | null;
  premio_ultrapassagem: string | null;
  criado_em: string;
};

type FeedItem = {
  id: string;
  message: string;
  isGoogle: boolean;
  createdAt: string;
};

const getDelta = (sale: Sale) => Number(sale.valor || 0) + (sale.is_google_bonus ? 100 : 0);

export default function ArenaPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [salesFeed, setSalesFeed] = useState<FeedItem[]>([]);
  const [turboIds, setTurboIds] = useState<string[]>([]);
  const [zapId, setZapId] = useState<string | null>(null);
  const sellersRef = useRef<Seller[]>([]);
  const prevRankRef = useRef<Record<string, number>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const battleLoopRef = useRef<number | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [salePulse, setSalePulse] = useState(0);
  const [overtakePulse, setOvertakePulse] = useState(0);
  const [battlePulse, setBattlePulse] = useState(0);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    sellersRef.current = sellers;
  }, [sellers]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      if (battleLoopRef.current) window.clearInterval(battleLoopRef.current);
      ambientSourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  const ensureAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      if (!audioEnabled) setAudioEnabled(true);
      return audioContextRef.current;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const unlock = async () => {
      await ensureAudio();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const refreshData = async () => {
    const res = await fetch("/api/arena", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const fetchedSellers = data.sellers || [];
      sellersRef.current = fetchedSellers;
      setSellers(fetchedSellers);
      setTotals(data.totals || {});
      setActiveChallenge(data.activeChallenge || null);
      const initialFeed = (data.salesFeed || []).map((sale: Sale) => ({
        id: sale.id,
        message: buildFeedMessage(sale),
        isGoogle: sale.is_google_bonus,
        createdAt: sale.criado_em
      }));
      setSalesFeed(initialFeed.slice(0, 5));
      updateRanks(data.totals || {});
    }
  };

  const refreshSellers = async () => {
    const res = await fetch("/api/arena", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const fetchedSellers = data.sellers || [];
      sellersRef.current = fetchedSellers;
      setSellers(fetchedSellers);
      setActiveChallenge(data.activeChallenge || null);
    }
  };

  const refreshChallenges = async () => {
    const res = await fetch("/api/arena", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setActiveChallenge(data.activeChallenge || null);
    }
  };

  const buildFeedMessage = (sale: Sale) => {
    const seller = sellersRef.current.find((s) => s.id === sale.vendedor_id);
    const base = formatCurrency(Number(sale.valor || 0));
    const total = formatCurrency(getDelta(sale));
    if (sale.is_google_bonus) {
      return `${seller?.nome || "Vendedor"} ativou Google: ${base} + 100 = ${total}`;
    }
    return `${seller?.nome || "Vendedor"} lançou venda de ${base}`;
  };

  const triggerTurbo = (ids: string[]) => {
    setTurboIds((prev) => Array.from(new Set([...prev, ...ids])));
    ids.forEach((id) => {
      setTimeout(() => {
        setTurboIds((prev) => prev.filter((entry) => entry !== id));
      }, 1200);
    });
  };

  const updateRanks = (nextTotals: Record<string, number>) => {
    const list = [...sellersRef.current].sort(
      (a, b) => (nextTotals[b.id] || 0) - (nextTotals[a.id] || 0)
    );
    const nextRank: Record<string, number> = {};
    list.forEach((seller, index) => {
      nextRank[seller.id] = index + 1;
    });
    const prevRank = prevRankRef.current;
    const boosts = Object.keys(nextRank).filter((id) => prevRank[id] && nextRank[id] < prevRank[id]);
    if (boosts.length) {
      triggerTurbo(boosts);
      setOvertakePulse(Date.now());
      playOvertake(boosts.length);
    }
    prevRankRef.current = nextRank;
  };

  const playTone = (freq: number, duration: number, type: OscillatorType, gainValue: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = gainValue;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start();
    osc.stop(now + duration);
  };

  const playSale = async () => {
    const ctx = await ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const playGoogleZap = async () => {
    const ctx = await ensureAudio();
    if (!ctx) return;
    playTone(1200, 0.12, "sawtooth", 0.08);
    playTone(800, 0.18, "square", 0.05);
  };

  const playOvertake = async (count: number) => {
    const ctx = await ensureAudio();
    if (!ctx) return;
    const base = 320 + count * 40;
    playTone(base, 0.18, "square", 0.06);
    playTone(base + 180, 0.22, "triangle", 0.05);
  };

  const startBattleAmbience = async () => {
    const ctx = await ensureAudio();
    if (!ctx || ambientSourceRef.current) return;

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    ambientSourceRef.current = source;
    ambientGainRef.current = gain;

    if (battleLoopRef.current) window.clearInterval(battleLoopRef.current);
    battleLoopRef.current = window.setInterval(() => {
      setBattlePulse(Date.now());
      playTone(90, 0.08, "sine", 0.08);
      playTone(140, 0.06, "triangle", 0.05);
    }, 1800);
  };

  useEffect(() => {
    refreshData();
    const refreshInterval = window.setInterval(() => refreshData(), 20000);
    const channel = supabase
      .channel("arena_vendas")
      .on("postgres_changes", { event: "*", schema: "public", table: "vendas" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const sale = payload.new as Sale;
          setTotals((prev) => {
            const next = { ...prev };
            next[sale.vendedor_id] = (next[sale.vendedor_id] || 0) + getDelta(sale);
            updateRanks(next);
            return next;
          });
          const message = buildFeedMessage(sale);
          setSalesFeed((prev) => [{ id: sale.id, message, isGoogle: sale.is_google_bonus, createdAt: sale.criado_em }, ...prev].slice(0, 5));
          if (sale.is_google_bonus) {
            setZapId(sale.vendedor_id);
            setTimeout(() => setZapId(null), 1200);
            playGoogleZap();
          }
          setSalePulse(Date.now());
          playSale();
        }
        if (payload.eventType === "UPDATE") {
          const oldSale = payload.old as Sale;
          const newSale = payload.new as Sale;
          setTotals((prev) => {
            const next = { ...prev };
            next[oldSale.vendedor_id] = (next[oldSale.vendedor_id] || 0) - getDelta(oldSale);
            next[newSale.vendedor_id] = (next[newSale.vendedor_id] || 0) + getDelta(newSale);
            updateRanks(next);
            return next;
          });
        }
        if (payload.eventType === "DELETE") {
          const oldSale = payload.old as Sale;
          setTotals((prev) => {
            const next = { ...prev };
            next[oldSale.vendedor_id] = (next[oldSale.vendedor_id] || 0) - getDelta(oldSale);
            updateRanks(next);
            return next;
          });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "vendedores" }, () => {
        refreshSellers();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "arena_desafios" }, () => {
        refreshChallenges();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(refreshInterval);
    };
  }, [supabase]);

  const rankedSellers = useMemo(() => {
    return [...sellers].sort((a, b) => (totals[b.id] || 0) - (totals[a.id] || 0));
  }, [sellers, totals]);

  const topThree = rankedSellers.slice(0, 3);
  const globalTotal = useMemo(
    () => Object.values(totals).reduce((acc, value) => acc + Number(value || 0), 0),
    [totals]
  );
  const globalProgress = activeChallenge?.meta_global
    ? Math.min((globalTotal / Number(activeChallenge.meta_global || 1)) * 100, 100)
    : 0;
  const rewardCards = useMemo(
    () => [
      { label: "Top 1", value: activeChallenge?.premio_top1 || "—", icon: "👑" },
      { label: "Top 2", value: activeChallenge?.premio_top2 || "—", icon: "🥈" },
      { label: "Top 3", value: activeChallenge?.premio_top3 || "—", icon: "🥉" },
      { label: "Google Bonus", value: activeChallenge?.premio_google || "—", icon: "⚡️" },
      { label: "Ultrapassagem", value: activeChallenge?.premio_ultrapassagem || "—", icon: "🔥" }
    ],
    [activeChallenge]
  );

  useEffect(() => {
    if (audioEnabled) startBattleAmbience();
  }, [audioEnabled]);

  const ambientParticles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, index) => ({
        id: index,
        x: 5 + Math.random() * 90,
        size: 24 + Math.random() * 48,
        delay: Math.random() * 3
      })),
    []
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-white">
      <motion.div
        key={battlePulse}
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#fbbf24,transparent_65%)]" />
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2b1a55,transparent_55%)] opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#3b2a10,transparent_55%)] opacity-70" />
      <div className="absolute inset-0 pointer-events-none">
        {ambientParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-amber-300/10 blur-xl"
            style={{ left: `${particle.x}%`, width: particle.size, height: particle.size }}
            animate={{ y: [0, -40, 0], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 6 + particle.delay, repeat: Infinity, delay: particle.delay }}
          />
        ))}
      </div>
      <div className="relative z-10 h-full w-full grid grid-cols-[1.6fr_0.7fr] gap-6 p-6">
        <motion.div
          className="flex flex-col gap-6"
          animate={overtakePulse ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/40 rounded-2xl px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Swords className="w-8 h-8 text-amber-300" />
              <div>
                <div className="text-sm uppercase tracking-[0.3em] text-amber-200">Arena Royale</div>
                <h1 className="text-3xl font-['Bangers'] tracking-wide">Corrida de Vendas</h1>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-amber-200">Desafio da Semana</div>
              <div className="text-lg font-semibold">{activeChallenge?.premio_semana || "Defina o prêmio"}</div>
              <div className="text-sm text-purple-200">
                Meta global: {activeChallenge ? formatCurrency(activeChallenge.meta_global) : "—"}
              </div>
              <div className="text-xs text-amber-100 mt-2">
                Total na arena: {formatCurrency(globalTotal)}
              </div>
              <div className="mt-2 h-2 w-56 bg-white/10 rounded-full overflow-hidden ml-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-fuchsia-400"
                  animate={{ width: `${globalProgress}%` }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                />
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {rankedSellers.map((seller, index) => {
              const total = totals[seller.id] || 0;
              const meta = activeChallenge?.meta_global || seller.meta_valor || 1;
              const progress = Math.min(Math.max((total / meta) * 100, 0), 100);
              const isTurbo = turboIds.includes(seller.id);
              const isZap = zapId === seller.id;
              const isPodium = index < 3;
              return (
                <motion.div
                  key={seller.id}
                  className={`relative h-20 rounded-2xl border overflow-hidden ${
                    isPodium ? "border-amber-400/60 bg-slate-900/80 shadow-[0_0_25px_rgba(251,191,36,0.15)]" : "border-amber-500/30 bg-slate-900/60"
                  }`}
                  animate={salePulse ? { boxShadow: ["0 0 0 rgba(251,191,36,0)", "0 0 22px rgba(251,191,36,0.35)", "0 0 0 rgba(251,191,36,0)"] } : {}}
                  transition={{ duration: 0.8 }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(251,191,36,0.08),transparent)]" />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-800 flex items-center justify-center">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold">{seller.nome.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{seller.nome}</div>
                      <div className="text-xs text-amber-200">
                        {formatCurrency(total)} • {Math.round(progress)}%
                      </div>
                    </div>
                    {isPodium && (
                      <div className="text-xs px-2 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-100">
                        #{index + 1}
                      </div>
                    )}
                  </div>
                  <div className="absolute right-6 top-0 bottom-0 w-1 bg-amber-400/70 rounded-full" />
                  <motion.div
                    animate={{ left: `${progress}%`, scale: isTurbo ? 1.12 : 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: `${progress}%` }}
                  >
                    <div className="relative">
                      {isTurbo && (
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-amber-400/40 blur-xl rounded-full animate-pulse" />
                      )}
                      {isZap && (
                        <div className="absolute inset-0 -m-2 rounded-full bg-blue-500/40 blur-lg animate-pulse" />
                      )}
                      <div className="w-12 h-12 rounded-full border-4 border-amber-300 bg-slate-800 flex items-center justify-center shadow-xl">
                        <Trophy className="w-5 h-5 text-amber-200" />
                      </div>
                    </div>
                  </motion.div>
                  <div className="absolute right-6 top-2 text-xs text-amber-200">🏁</div>
                  <div className="absolute left-5 bottom-2 text-xs text-purple-200">Lane {index + 1}</div>
                </motion.div>
              );
            })}
            {rankedSellers.length === 0 && (
              <div className="h-full flex items-center justify-center text-amber-200">
                Cadastre vendedores para começar a corrida
              </div>
            )}
          </div>
        </motion.div>

        <aside className="flex flex-col gap-6">
          <div className="bg-slate-900/70 border border-amber-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-amber-200 uppercase tracking-[0.3em] text-xs mb-4">
              <Crown className="w-4 h-4" />
              Top 3
            </div>
            <div className="space-y-3">
              {topThree.map((seller, index) => (
                <div key={seller.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-300 overflow-hidden bg-slate-800 flex items-center justify-center">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold">{seller.nome.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{seller.nome}</div>
                      <div className="text-xs text-amber-200">{formatCurrency(totals[seller.id] || 0)}</div>
                    </div>
                  </div>
                  <div className="text-2xl">
                    {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
                  </div>
                </div>
              ))}
              {topThree.length === 0 && (
                <div className="text-amber-200">Sem ranking ainda</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-fuchsia-500/30 rounded-2xl p-5">
            <div className="flex items-center justify-between text-fuchsia-200 uppercase tracking-[0.3em] text-xs mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Premiações da Arena
              </div>
              <span className="text-[10px] text-fuchsia-300">Atualizável no admin</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {rewardCards.map((reward) => (
                <motion.div
                  key={reward.label}
                  className="rounded-xl border border-fuchsia-500/20 bg-slate-800/70 px-3 py-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xs text-fuchsia-200 flex items-center gap-2">
                    <span>{reward.icon}</span>
                    {reward.label}
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">{reward.value}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-purple-500/30 rounded-2xl p-5 flex-1">
            <div className="flex items-center gap-2 text-purple-200 uppercase tracking-[0.3em] text-xs mb-4">
              <Zap className="w-4 h-4" />
              Kill Feed
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {salesFeed.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-xl px-4 py-3 text-sm border ${
                      item.isGoogle ? "border-blue-400/50 bg-blue-500/10" : "border-amber-400/30 bg-slate-800/60"
                    }`}
                  >
                    {item.message}
                  </motion.div>
                ))}
              </AnimatePresence>
              {salesFeed.length === 0 && (
                <div className="text-purple-200 text-sm">Aguardando novas vendas...</div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
