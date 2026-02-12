"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Zap, Swords, Trophy, X } from "lucide-react";
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

type Achievement = {
  id: string;
  nome: string;
  descricao: string;
  icone_url: string;
  xp_valor: number;
  tipo: "automatico" | "manual";
};

type SellerAchievement = {
  id: string;
  vendedor_id: string;
  conquista_id: string;
  data_conquista: string;
  status: "pendente" | "aprovado";
};

const getDelta = (sale: Sale) => Number(sale.valor || 0) + (sale.is_google_bonus ? 100 : 0);

export default function ArenaPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [salesFeed, setSalesFeed] = useState<FeedItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sellerAchievements, setSellerAchievements] = useState<SellerAchievement[]>([]);
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
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({
    sellerId: "",
    achievementId: "",
    justification: "",
    evidenceUrl: ""
  });
  const [celebration, setCelebration] = useState<{ type: "leader" | "overtake" | "sale" | "google"; seller: Seller } | null>(null);
  const lastRankingsRef = useRef<Record<string, number>>({});

  const supabase = useMemo(() => createClient(), []);

  const handleSubmitRequest = async () => {
    if (!requestForm.sellerId || !requestForm.achievementId) {
      alert("Selecione vendedor e conquista");
      return;
    }
    setLoadingRequest(true);
    try {
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_achievement",
          vendedor_id: requestForm.sellerId,
          conquista_id: requestForm.achievementId,
          status: "pendente",
          justificativa: requestForm.justification,
          evidencia_url: requestForm.evidenceUrl
        })
      });
      if (res.ok) {
        alert("Solicitação enviada com sucesso! Aguarde aprovação.");
        setShowRequestModal(false);
        setRequestForm({ sellerId: "", achievementId: "", justification: "", evidenceUrl: "" });
        refreshData();
      } else {
        const data = await res.json();
        alert("Erro: " + (data.message || "Falha ao enviar"));
      }
    } catch (err) {
      alert("Erro ao enviar solicitação");
    } finally {
      setLoadingRequest(false);
    }
  };


  useEffect(() => {
    sellersRef.current = sellers;
  }, [sellers]);

  useEffect(() => {
    return () => {
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
      setAchievements(data.achievements || []);
      setSellerAchievements(data.sellerAchievements || []);
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
      setAchievements(data.achievements || []);
      setSellerAchievements(data.sellerAchievements || []);
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
    
    // Detect Leader Change
    const newLeader = list[0];
    const oldLeaderId = Object.keys(prevRank).find(id => prevRank[id] === 1);
    
    // Only trigger if we had a previous leader (not first load) and it changed
    if (oldLeaderId && newLeader && newLeader.id !== oldLeaderId) {
      setCelebration(prev => {
        // If there is already a sale/google celebration, don't overwrite it with leader celebration
        // unless you want leader to take precedence. Here we prioritize sale/google events.
        if (prev?.type === 'sale' || prev?.type === 'google') return prev;
        return { type: "leader", seller: newLeader };
      });
    }

    const boosts = Object.keys(nextRank).filter((id) => prevRank[id] && nextRank[id] < prevRank[id]);
    if (boosts.length) {
      triggerTurbo(boosts);
      setOvertakePulse(Date.now());
      playOvertake(boosts.length);
    }
    prevRankRef.current = nextRank;
  };

  // Effect to update ranks when totals change
  useEffect(() => {
    updateRanks(totals);
  }, [totals]);

  // Effect to handle celebration timeouts
  useEffect(() => {
    if (!celebration) return;

    let duration = 3000; // Default 3s (sale/google)
    if (celebration.type === 'leader') duration = 8000;
    
    const timer = setTimeout(() => {
      setCelebration(null);
    }, duration);

    return () => clearTimeout(timer);
  }, [celebration]);

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
        console.log("Realtime Event Received:", payload); // DEBUG LOG
        if (payload.eventType === "INSERT") {
          const sale = payload.new as Sale;
          console.log("New Sale Detected:", sale); // DEBUG LOG
          setTotals((prev) => {
            const next = { ...prev };
            next[sale.vendedor_id] = (next[sale.vendedor_id] || 0) + getDelta(sale);
            return next;
          });
          const message = buildFeedMessage(sale);
          setSalesFeed((prev) => [{ id: sale.id, message, isGoogle: sale.is_google_bonus, createdAt: sale.criado_em }, ...prev].slice(0, 5));
          
          // Trigger Celebration
          const seller = sellersRef.current.find(s => String(s.id) === String(sale.vendedor_id));
          
          if (seller) {
            console.log("Celebration Triggered for:", seller.nome);
            if (sale.is_google_bonus) {
              setCelebration({ type: "google", seller });
            } else {
              setCelebration({ type: "sale", seller });
            }
          } else {
            console.warn("Seller not found for celebration:", sale.vendedor_id);
            // Fallback para não perder o evento visualmente
            setCelebration({ 
              type: sale.is_google_bonus ? "google" : "sale", 
              seller: { 
                id: String(sale.vendedor_id), 
                nome: "Vendedor", 
                avatar_url: "", 
                meta_valor: 0, 
                criado_em: ""
              } 
            });
          }

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
            return next;
          });
        }
        if (payload.eventType === "DELETE") {
          const oldSale = payload.old as Sale;
          setTotals((prev) => {
            const next = { ...prev };
            next[oldSale.vendedor_id] = (next[oldSale.vendedor_id] || 0) - getDelta(oldSale);
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
    <div className="flex flex-col min-h-screen w-full lg:h-screen lg:overflow-hidden overflow-y-auto bg-slate-950 text-white">
      <motion.div
        key={battlePulse}
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#E60012,transparent_65%)]" />
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#450a0a,transparent_55%)] opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#450a0a,transparent_55%)] opacity-70" />
      <div className="absolute inset-0 pointer-events-none">
        {ambientParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-red-500/10 blur-xl"
            style={{ left: `${particle.x}%`, width: particle.size, height: particle.size }}
            animate={{ y: [0, -40, 0], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 6 + particle.delay, repeat: Infinity, delay: particle.delay }}
          />
        ))}
      </div>
      <div className="relative z-10 w-full lg:h-full grid grid-cols-1 lg:grid-cols-[1.6fr_0.7fr] gap-4 lg:gap-6 p-4 sm:p-6 pb-12 lg:pb-6 overflow-hidden">
        <motion.div
          className="flex flex-col gap-6 lg:h-full lg:overflow-hidden"
          animate={overtakePulse ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-red-600/20 to-red-900/20 border border-red-500/40 rounded-2xl px-4 sm:px-6 py-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Swords className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
              <div>
                <div className="text-xs sm:text-sm uppercase tracking-[0.3em] text-red-200">Arena Royale</div>
                <h1 className="text-2xl sm:text-3xl font-['Bangers'] tracking-wide">Corrida de Vendas</h1>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-xs uppercase tracking-widest text-red-200">Desafio da Semana</div>
              <div className="text-base sm:text-lg font-semibold">{activeChallenge?.premio_semana || "Defina o prêmio"}</div>
              <div className="text-xs sm:text-sm text-red-300">
                Meta global: {activeChallenge ? formatCurrency(activeChallenge.meta_global) : "—"}
              </div>
              <div className="text-xs text-red-100 mt-2">
                Total na arena: {formatCurrency(globalTotal)}
              </div>
              <div className="mt-2 h-2 w-full sm:w-56 bg-white/10 rounded-full overflow-hidden sm:ml-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400"
                  animate={{ width: `${globalProgress}%` }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                />
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {rankedSellers.map((seller, index) => {
              const total = totals[seller.id] || 0;
              const meta = activeChallenge?.meta_global || seller.meta_valor || 1;
              const progress = Math.min(Math.max((total / meta) * 100, 0), 100);
              const visualProgress = 30 + (progress * 0.7);
              const isTurbo = turboIds.includes(seller.id);
              const isZap = zapId === seller.id;
              const isPodium = index < 3;
              return (
                <motion.div
                  key={seller.id}
                  className={`relative min-h-[6rem] sm:min-h-[7rem] h-auto py-3 rounded-2xl border overflow-hidden flex flex-col justify-center ${
                    isPodium ? "border-red-500/60 bg-slate-900/90 shadow-[0_0_25px_rgba(230,0,18,0.15)]" : "border-red-500/30 bg-slate-900/80"
                  }`}
                  animate={salePulse ? { boxShadow: ["0 0 0 rgba(230,0,18,0)", "0 0 22px rgba(230,0,18,0.35)", "0 0 0 rgba(230,0,18,0)"] } : {}}
                  transition={{ duration: 0.8 }}
                >
                  {/* Pista de corrida background */}
                  <div className="absolute inset-0 z-0 animate-stars opacity-40" />
                  <div className="absolute top-1/2 left-0 right-0 h-0 border-t-2 border-dashed border-slate-600/30 transform -translate-y-1/2" />
                  
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(230,0,18,0.08),transparent)]" />
                  <div className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 relative z-20 w-full pr-[15%]">
                    <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-red-400 overflow-hidden bg-slate-800 flex items-center justify-center">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold">{seller.nome.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="bg-slate-900/60 px-2 py-1 rounded-lg backdrop-blur-sm flex flex-col gap-1 z-30 max-w-full overflow-hidden">
                      <div>
                        <div className="text-sm sm:text-base font-semibold truncate">{seller.nome}</div>
                        <div className="text-[11px] sm:text-xs text-red-200">
                          {formatCurrency(total)} • {Math.round(progress)}%
                        </div>
                      </div>
                      {/* Emblemas */}
                      <div className="flex flex-wrap gap-1">
                        {achievements.map((ach) => {
                            const hasAchievement = sellerAchievements.some(
                            (sa) => sa.vendedor_id === seller.id && sa.conquista_id === ach.id && sa.status === "aprovado"
                            );
                            return (
                            <div
                                key={ach.id}
                                title={hasAchievement ? `${ach.nome}: ${ach.descricao}` : `${ach.nome} (Bloqueado)`}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-help transition-all ${
                                hasAchievement
                                    ? "bg-red-600/20 text-red-100 border border-red-500/50 shadow-[0_0_5px_rgba(230,0,18,0.3)] scale-100"
                                    : "bg-slate-800 text-slate-600 border border-slate-700 grayscale opacity-30 scale-90"
                                }`}
                            >
                                <span>{ach.icone_url}</span>
                            </div>
                            );
                        })}
                      </div>
                    </div>
                    {isPodium && (
                      <div className="text-xs px-2 py-1 rounded-full bg-red-600/20 border border-red-400/40 text-red-100">
                        #{index + 1}
                      </div>
                    )}
                  </div>
                  <div className="absolute right-4 sm:right-6 top-0 bottom-0 w-1 bg-red-500/70 rounded-full" />
                  <motion.div
                    animate={{ left: `${visualProgress}%`, scale: isTurbo ? 1.12 : 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className="absolute top-1/2 -translate-y-1/2 z-[100]"
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Efeitos de Fogo e Fumaça */}
                      <div className="absolute right-full mr-[-10px] top-1/2 -translate-y-1/2 flex items-center flex-row-reverse">
                         {/* Fogo principal */}
                         <motion.div 
                           className="w-6 h-3 bg-gradient-to-l from-orange-400 via-red-500 to-transparent rounded-l-full blur-[2px]"
                           animate={{ scaleX: [1, 1.3, 0.9], opacity: [0.8, 1, 0.7] }}
                           transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
                         />
                         {/* Fumaça */}
                         <motion.div
                           className="absolute right-2 w-8 h-6 bg-slate-400/40 rounded-full blur-md"
                           animate={{ x: [-5, -25], opacity: [0.6, 0], scale: [0.5, 1.5] }}
                           transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
                         />
                         {/* Partículas extras de fumaça */}
                         <motion.div
                           className="absolute right-1 w-4 h-4 bg-white/30 rounded-full blur-sm"
                           animate={{ x: [-2, -15], y: [-2, 5], opacity: [0.5, 0] }}
                           transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                         />
                      </div>

                      {isTurbo && (
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-red-500/40 blur-xl rounded-full animate-pulse" />
                      )}
                      {isZap && (
                        <div className="absolute inset-0 -m-2 rounded-full bg-blue-500/40 blur-lg animate-pulse" />
                      )}
                      
                      <div className="text-4xl sm:text-5xl transform rotate-45 filter drop-shadow-lg z-[100] relative">
                        🚀
                      </div>
                    </div>
                  </motion.div>
                  <div className="absolute right-4 sm:right-6 top-0 bottom-0 flex items-center justify-center">
                    <motion.div
                      className="h-full w-6 sm:w-8 flex flex-col overflow-hidden shadow-lg"
                      initial={{ skewY: -5 }}
                      animate={{ skewY: 5 }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatType: "mirror", 
                        ease: "easeInOut" 
                      }}
                    >
                      <div 
                        className="w-full h-full opacity-80"
                        style={{
                          backgroundColor: '#fff',
                          backgroundImage: `
                            linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
                            linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)
                          `,
                          backgroundPosition: '0 0, 10px 10px',
                          backgroundSize: '20px 20px'
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
            {rankedSellers.length === 0 && (
              <div className="h-full flex items-center justify-center text-red-200">
                Cadastre vendedores para começar a corrida
              </div>
            )}
          </div>
        </motion.div>

        <aside className="flex flex-col gap-4 sm:gap-6 lg:h-full lg:overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="bg-slate-900/70 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-red-200 uppercase tracking-[0.3em] text-xs mb-4">
              <Crown className="w-4 h-4" />
              Top 3
            </div>
            <div className="space-y-3">
              {topThree.map((seller, index) => (
                <div key={seller.id} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-3 sm:px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-red-400 overflow-hidden bg-slate-800 flex items-center justify-center">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold">{seller.nome.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{seller.nome}</div>
                      <div className="text-xs text-red-200">{formatCurrency(totals[seller.id] || 0)}</div>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl">
                    {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
                  </div>
                </div>
              ))}
              {topThree.length === 0 && (
                <div className="text-red-200">Sem ranking ainda</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-red-500/30 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-red-200 uppercase tracking-[0.3em] text-xs mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Premiações da Arena
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rewardCards.map((reward) => (
                <motion.div
                  key={reward.label}
                  className="rounded-xl border border-red-500/20 bg-slate-800/70 px-3 py-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xs text-red-200 flex items-center gap-2">
                    <span>{reward.icon}</span>
                    {reward.label}
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">{reward.value}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-red-500/30 rounded-2xl p-4 sm:p-5 flex-1">
            <div className="flex items-center gap-2 text-red-200 uppercase tracking-[0.3em] text-xs mb-4">
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
                      item.isGoogle ? "border-blue-400/50 bg-blue-500/10" : "border-red-500/30 bg-slate-800/60"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span>{item.message}</span>
                      <span className="text-[10px] text-slate-400 text-right">
                        {new Date(item.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {salesFeed.length === 0 && (
                <div className="text-red-200 text-sm">Aguardando novas vendas...</div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-slate-400 hover:text-white py-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <Trophy size={14} />
            Solicitar Conquista
          </button>
          
          {/* Debug Button - Remover em produção se necessário */}
          <button
            onClick={() => {
              console.log("Simulando Venda...");
              const fakeSeller = sellers[0] || { id: "test", nome: "Teste Vendedor", avatar_url: "", meta_valor: 0, criado_em: "" };
              setCelebration({ type: "sale", seller: fakeSeller });
            }}
            className="w-full mt-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 text-red-500/50 hover:text-red-500 py-1 rounded-lg text-[10px] uppercase tracking-wider transition-colors"
          >
            Simular Venda (Teste)
          </button>
        </aside>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md relative">
            <button 
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="text-red-500" />
              Solicitar Conquista
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Vendedor</label>
                <select 
                  value={requestForm.sellerId}
                  onChange={(e) => setRequestForm({...requestForm, sellerId: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">Selecione...</option>
                  {sellers.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Conquista</label>
                <select 
                  value={requestForm.achievementId}
                  onChange={(e) => setRequestForm({...requestForm, achievementId: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">Selecione...</option>
                  {achievements
                    .filter(a => a.tipo === 'manual')
                    .map(a => <option key={a.id} value={a.id}>{a.nome}</option>)
                  }
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Justificativa</label>
                <textarea 
                  value={requestForm.justification}
                  onChange={(e) => setRequestForm({...requestForm, justification: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 min-h-[80px]"
                  placeholder="Descreva por que você merece esta conquista..."
                />
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1 block">Link da Evidência (Opcional)</label>
                <input 
                  type="text"
                  value={requestForm.evidenceUrl}
                  onChange={(e) => setRequestForm({...requestForm, evidenceUrl: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="https://..."
                />
              </div>

              <button
                onClick={handleSubmitRequest}
                disabled={loadingRequest}
                className="w-full bg-red-600 hover:bg-red-700 text-slate-900 font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingRequest ? "Enviando..." : "Enviar Solicitação"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Celebration Popup */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            key="celebration-modal"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setCelebration(null)}
          >
            <div className="relative flex flex-col items-center justify-center max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-6xl font-['Bangers'] text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] tracking-wider mb-4 text-center"
              >
                {celebration.type === 'google' ? 'REI DO GOOGLE!' : (celebration.type === 'sale' ? 'NOVO PEDIDO DETECTADO!' : 'NOVO LÍDER!')}
              </motion.div>
              
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-yellow-400/50 shadow-[0_0_50px_rgba(250,204,21,0.4)] overflow-hidden bg-slate-900 mb-6 flex items-center justify-center">
                 <img 
                   src={
                     celebration.type === 'google' 
                       ? "https://i.giphy.com/QtvEouZBOE8nPn7yFx.webp" 
                       : (celebration.type === 'sale' 
                           ? "https://i.pinimg.com/originals/3d/27/11/3d271128514d50a47c22e5f1beecb4fc.gif" 
                           : "https://i.pinimg.com/originals/a4/d3/ce/a4d3ce7ff09e24bbc4cf265686e9becc.gif")
                   }
                   alt="Celebration" 
                   className={`w-full h-full ${(celebration.type === 'sale' || celebration.type === 'google') ? 'object-contain' : 'object-cover'}`}
                   onError={(e) => {
                     // Fallback se a imagem falhar
                     e.currentTarget.style.display = 'none';
                   }}
                 />
                 {/* Overlay do Avatar do Vendedor */}
                 <div className="absolute bottom-4 right-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-800">
                    {celebration.seller.avatar_url ? (
                      <img src={celebration.seller.avatar_url} alt={celebration.seller.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-white bg-slate-700">
                        {celebration.seller.nome.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                 </div>
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-3xl sm:text-5xl font-bold text-white text-center drop-shadow-lg"
              >
                {celebration.seller.nome}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 text-yellow-200 text-lg sm:text-xl font-medium"
              >
                {celebration.type === 'google' ? 'Dominou o Google! 🚀' : (celebration.type === 'sale' ? 'Parabéns pela venda! 🎉' : 'Assumiu a 1ª Posição! 👑')}
              </motion.div>

              <button 
                onClick={() => setCelebration(null)}
                className="absolute top-0 right-0 p-2 text-white/50 hover:text-white transition-colors"
              >
                <X size={32} />
              </button>
            </div>
            
            {/* Confetes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               {[...Array(20)].map((_, i) => (
                 <motion.div
                   key={i}
                   className={`absolute w-3 h-3 rounded-sm ${
                      celebration.type === 'google' 
                      ? ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'][i % 4] 
                      : 'bg-yellow-400'
                   }`}
                   initial={{ 
                     x: Math.random() * window.innerWidth, 
                     y: -20, 
                     rotate: 0 
                   }}
                   animate={{ 
                     y: window.innerHeight + 20, 
                     rotate: 360 * 2 + Math.random() * 360 
                   }}
                   transition={{ 
                     duration: 2 + Math.random() * 2, 
                     repeat: Infinity, 
                     ease: "linear",
                     delay: Math.random() * 2
                   }}
                 />
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
