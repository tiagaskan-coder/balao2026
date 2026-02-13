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
  const [celebration, setCelebration] = useState<{ type: string; seller: Seller; customMessage?: string } | null>(null);
  const [celebrationQueue, setCelebrationQueue] = useState<{ type: string; seller: Seller; customMessage?: string }[]>([]);
  const [eventConfigs, setEventConfigs] = useState<Record<string, { title: string; message: string; gif_url: string; audio_url?: string; duration: number }>>({});
  const lastRankingsRef = useRef<Record<string, number>>({});
  const lastSaleTimeRef = useRef<Record<string, number>>({});
  const lastIceBreakRef = useRef<Record<string, number>>({});

  const supabase = useMemo(() => createClient(), []);

  // Configuração padrão dos GIFs e Mensagens
  const DEFAULT_EVENT_CONFIG: Record<string, { title: string; message: string; gif_url: string; audio_url?: string; duration: number }> = {
    leader: {
      title: "NOVO LÍDER!",
      message: "Assumiu a ponta! 👑",
      gif_url: "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif",
      audio_url: "https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3",
      duration: 8000
    }
  };

  const getEventConfig = (type: string) => {
      return eventConfigs[type] || DEFAULT_EVENT_CONFIG[type] || DEFAULT_EVENT_CONFIG['leader'];
  };

  const enqueueCelebration = (evt: { type: string; seller: Seller; customMessage?: string }) => {
    setCelebration((current) => {
      if (current) {
        setCelebrationQueue((q) => [...q, evt]);
        return current;
      }
      return evt;
    });
  };

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
      
      const loadedConfigs: Record<string, any> = {};
      (data.eventConfig || []).forEach((cfg: any) => {
          loadedConfigs[cfg.id] = cfg;
      });
      setEventConfigs(loadedConfigs);

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
      enqueueCelebration({ type: "leader", seller: newLeader });
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
    
    // Play audio logic
    const config = getEventConfig(celebration.type);
    const duration = config?.duration || 5000;
    
    let audio: HTMLAudioElement | null = null;
    
    // Se o contexto estiver suspenso (sem clique), tenta dar resume ou usa elemento HTMLAudioElement simples como fallback
    // HTMLAudioElement é mais confiável para autoplay simples se não precisar de efeitos complexos WebAudio
    if (audioEnabled && config?.audio_url) {
        audio = new Audio(config.audio_url);
        audio.volume = 0.5;
        audio.play().catch(e => console.error("[ARENA_DEBUG] Audio play error:", e));
    }

    const timer = setTimeout(() => {
      setCelebrationQueue((prev) => {
        if (prev.length === 0) {
            setCelebration(null);
            return [];
        }
        const [next, ...rest] = prev;
        setCelebration(next);
        return rest;
      });
      
      if (audio) {
          audio.pause();
          audio = null;
      }
    }, duration);

    return () => {
        clearTimeout(timer);
        if (audio) {
            audio.pause();
            audio = null;
        }
    };
  }, [celebration, audioEnabled]);

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
          
          let nextTotalsSnapshot: Record<string, number> = {};
          
          setTotals((prev) => {
            const next = { ...prev };
            next[sale.vendedor_id] = (next[sale.vendedor_id] || 0) + getDelta(sale);
            nextTotalsSnapshot = next;
            return next;
          });
          
          const message = buildFeedMessage(sale);
          setSalesFeed((prev) => [{ id: sale.id, message, isGoogle: sale.is_google_bonus, createdAt: sale.criado_em }, ...prev].slice(0, 5));
          
          // Trigger Celebration Logic
          const seller = sellersRef.current.find(s => String(s.id) === String(sale.vendedor_id));
          
          if (seller) {
            console.log("[ARENA_DEBUG] Celebration Triggered for:", seller.nome);
            
            // Recalculate ranking with new totals
            const ranked = [...sellersRef.current].sort(
              (a, b) => (nextTotalsSnapshot[b.id] || 0) - (nextTotalsSnapshot[a.id] || 0)
            );
            
            const newLeaderId = ranked[0]?.id;
            const oldLeaderId = Object.keys(prevRankRef.current).find(id => prevRankRef.current[id] === 1);
            const leaderChanged = oldLeaderId && newLeaderId && newLeaderId !== oldLeaderId;
            
            console.log(`[ARENA_DEBUG] Leader Changed: ${leaderChanged} (Old: ${oldLeaderId}, New: ${newLeaderId})`);

            // --- ANALYSIS VARIABLES ---
            const now = Date.now();
            const saleValue = Number(sale.valor || 0);
            const sellerTotalBefore = (totals[seller.id] || 0);
            const sellerTotalAfter = sellerTotalBefore + getDelta(sale);
            const sellerMeta = seller.meta_valor || 1;
            
            // Global totals
            const newGlobalTotal = Object.values(nextTotalsSnapshot).reduce((a, b) => a + b, 0);
            const globalMeta = Number(activeChallenge?.meta_global || 1);
            const oldGlobalTotal = newGlobalTotal - getDelta(sale);

            console.log(`[ARENA_DEBUG] Sale Analysis: Value=${saleValue}, TotalBefore=${sellerTotalBefore}, TotalAfter=${sellerTotalAfter}, Meta=${sellerMeta}`);

            // --- EVENT DETECTION QUEUE ---
            // We collect all valid events and then enqueue them
            const eventsToTrigger: Array<{ type: string; seller: Seller; customMessage?: string }> = [];

            if (leaderChanged && newLeaderId === seller.id) {
               console.log("[ARENA_DEBUG] Event Detected: LEADER");
               eventsToTrigger.push({ type: "leader", seller });
            }

            // Enqueue all detected events
            eventsToTrigger.forEach(evt => enqueueCelebration(evt));

          } else {
            console.warn("[ARENA_DEBUG] Seller not found for celebration:", sale.vendedor_id);
            // Fallback para não perder o evento visualmente
            enqueueCelebration({ 
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

  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const toggleDebug = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        setShowDebug(prev => !prev);
      }
    };
    window.addEventListener('keydown', toggleDebug);
    return () => window.removeEventListener('keydown', toggleDebug);
  }, []);

  const testCelebration = (type: string) => {
    const mockSeller = sellers[0] || {
      id: "mock",
      nome: "Vendedor Teste",
      avatar_url: null,
      meta_valor: 1000,
      criado_em: new Date().toISOString()
    };
    console.log(`[ARENA_DEBUG] Testando evento: ${type} com vendedor ${mockSeller.nome}`);
    enqueueCelebration({ type, seller: mockSeller });
  };

  return (
    <div className="flex flex-col min-h-screen w-full lg:h-screen lg:overflow-hidden overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      {showDebug && (
        <div className="fixed top-4 left-4 z-[10000] bg-slate-900/90 border border-red-500/50 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest">Debug Mode</h3>
            <button onClick={() => setShowDebug(false)} className="text-slate-400 hover:text-white"><X size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(DEFAULT_EVENT_CONFIG).map(type => (
              <button
                key={type}
                onClick={() => testCelebration(type)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 rounded border border-slate-700 transition-colors text-left"
              >
                ▶ {type}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-slate-500 font-mono">
            Queue: {celebrationQueue.length} | Current: {celebration?.type || 'None'}
          </div>
        </div>
      )}
      <motion.div
        key={battlePulse}
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#06b6d4,transparent_65%)]" />
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e3a8a,transparent_55%)] opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#1e3a8a,transparent_55%)] opacity-40" />
      <div className="absolute inset-0 pointer-events-none">
        {ambientParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-cyan-500/10 blur-xl"
            style={{ left: `${particle.x}%`, width: particle.size, height: particle.size }}
            animate={{ y: [0, -40, 0], opacity: [0.1, 0.25, 0.1] }}
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
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/80 to-blue-950/80 border border-cyan-500/30 rounded-2xl px-4 sm:px-6 py-4 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">Tech Arena</div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Dashboard de Performance</h1>
              </div>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">Meta Semanal</div>
              <div className="text-base sm:text-lg font-semibold text-white mb-1">{activeChallenge?.premio_semana || "Defina o prêmio"}</div>
              <div className="text-xs text-slate-300 mb-2">
                Meta: {activeChallenge ? formatCurrency(activeChallenge.meta_global) : "—"}
              </div>
              <div className="text-xs text-cyan-300 mb-2">
                Total: {formatCurrency(globalTotal)}
              </div>
              <div className="h-2 w-full sm:w-56 bg-slate-800 rounded-full overflow-hidden sm:ml-auto shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
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
                  className={`relative min-h-[6rem] sm:min-h-[7rem] h-auto py-3 rounded-2xl border overflow-hidden flex flex-col justify-center backdrop-blur-sm ${
                    isPodium ? "border-cyan-500/40 bg-slate-900/70 shadow-lg shadow-cyan-500/10" : "border-slate-700/50 bg-slate-900/60"
                  }`}
                  animate={salePulse ? { boxShadow: ["0 0 0 rgba(6,182,212,0)", "0 0 22px rgba(6,182,212,0.25)", "0 0 0 rgba(6,182,212,0)"] } : {}}
                  transition={{ duration: 0.8 }}
                >
                  {/* Tech grid background */}
                  <div className="absolute inset-0 z-0 opacity-20">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  </div>
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                  
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(6,182,212,0.05),transparent)]" />
                  <div className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 flex items-center gap-3 relative z-20 w-full pr-[15%]">
                    <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-cyan-500/30 overflow-hidden bg-slate-800/80 flex items-center justify-center shadow-lg">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-bold text-cyan-400">{seller.nome.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="bg-slate-800/60 px-3 py-2 rounded-xl backdrop-blur-sm flex flex-col gap-1 z-30 max-w-full overflow-hidden border border-slate-700/50">
                      <div>
                        <div className="text-sm sm:text-base font-semibold text-white truncate">{seller.nome}</div>
                        <div className="text-[11px] sm:text-xs text-cyan-300 font-medium">
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
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs cursor-help transition-all ${
                                hasAchievement
                                    ? "bg-cyan-500/20 text-cyan-100 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)] scale-100"
                                    : "bg-slate-800 text-slate-600 border border-slate-700 grayscale opacity-40 scale-90"
                                }`}
                            >
                                <span>{ach.icone_url}</span>
                            </div>
                            );
                        })}
                      </div>
                    </div>
                    
                  </div>
                  <div className="absolute right-4 sm:right-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />
                  <motion.div
                    animate={{ left: `${visualProgress}%`, scale: isTurbo ? 1.12 : 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className="absolute top-[calc(52%-19px)] -translate-y-1/2 z-[100]"
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Tech trail effects */}
                      <div className="absolute right-full mr-[-10px] top-1/2 -translate-y-1/2 flex items-center flex-row-reverse">
                         {/* Main trail */}
                         <motion.div 
                           className="w-6 h-2 bg-gradient-to-l from-cyan-400 via-blue-500 to-transparent rounded-l-full blur-[1px]"
                           animate={{ scaleX: [1, 1.3, 0.9], opacity: [0.8, 1, 0.7] }}
                           transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
                         />
                         {/* Data particles */}
                         <motion.div
                           className="absolute right-2 w-6 h-4 bg-cyan-400/20 rounded-full blur-sm"
                           animate={{ x: [-5, -25], opacity: [0.6, 0], scale: [0.5, 1.2] }}
                           transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
                         />
                         {/* Binary particles */}
                         <motion.div
                           className="absolute right-1 w-3 h-3 bg-cyan-300/40 rounded-full blur-xs"
                           animate={{ x: [-2, -15], y: [-2, 3], opacity: [0.5, 0] }}
                           transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }}
                         />
                      </div>

                      {isTurbo && (
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-cyan-500/30 blur-xl rounded-full animate-pulse" />
                      )}
                      {isZap && (
                        <div className="absolute inset-0 -m-2 rounded-full bg-blue-500/30 blur-lg animate-pulse" />
                      )}
                      
                      <div className="text-3xl sm:text-4xl transform rotate-45 filter drop-shadow-lg z-[100] relative text-cyan-400">
                        🚀
                      </div>
                    </div>
                  </motion.div>
                  <div className="absolute right-4 sm:right-6 top-0 bottom-0 flex items-center justify-center">
                    <motion.div
                      className="h-full w-6 sm:w-8 flex flex-col overflow-hidden shadow-lg rounded-lg"
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
                        className="w-full h-full opacity-60"
                        style={{
                          backgroundColor: '#0f172a',
                          backgroundImage: `
                            linear-gradient(45deg, rgba(6,182,212,0.1) 25%, transparent 25%, transparent 75%, rgba(6,182,212,0.1) 75%, rgba(6,182,212,0.1)),
                            linear-gradient(45deg, rgba(6,182,212,0.1) 25%, transparent 25%, transparent 75%, rgba(6,182,212,0.1) 75%, rgba(6,182,212,0.1))
                          `,
                          backgroundPosition: '0 0, 8px 8px',
                          backgroundSize: '16px 16px'
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
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 uppercase tracking-[0.2em] text-xs font-medium mb-3">
              <Crown className="w-4 h-4" />
              Top 3
            </div>
            <div className="space-y-3">
              {topThree.map((seller, index) => (
                <div key={seller.id} className="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-3 border border-slate-700/30 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border border-cyan-500/30 overflow-hidden bg-slate-800 flex items-center justify-center">
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.nome} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-cyan-400">{seller.nome.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{seller.nome}</div>
                      <div className="text-xs text-cyan-300 font-medium">{formatCurrency(totals[seller.id] || 0)}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                </div>
              ))}
              {topThree.length === 0 && (
                <div className="text-slate-400 text-sm text-center py-4">Aguardando participantes...</div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 uppercase tracking-[0.2em] text-xs font-medium mb-3">
              <Zap className="w-4 h-4" />
              Prêmios
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rewardCards.map((reward) => (
                <motion.div
                  key={reward.label}
                  className="rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2 hover:border-cyan-500/40 hover:bg-slate-800/60 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-xs text-cyan-300 flex items-center gap-2 font-medium">
                    <span className="text-sm">{reward.icon}</span>
                    {reward.label}
                  </div>
                  <div className="text-sm font-semibold text-white mt-1">{reward.value}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-4 sm:p-5 flex-1 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 uppercase tracking-[0.2em] text-xs font-medium mb-4">
              <Zap className="w-4 h-4" />
              Atividade
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {salesFeed.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-xl px-4 py-3 text-sm border backdrop-blur-sm ${
                      item.isGoogle ? "border-blue-400/30 bg-blue-500/10" : "border-slate-700/50 bg-slate-800/40"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-200">{item.message}</span>
                      <span className="text-xs text-slate-500 text-right font-mono">
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
                <div className="text-slate-500 text-sm text-center py-4">Aguardando novas vendas...</div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-500/50 text-white py-3 rounded-xl text-sm font-medium uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center justify-center gap-2"
          >
            <Trophy size={16} />
            Solicitar Conquista
          </button>
          
        </aside>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 w-full max-w-md relative backdrop-blur-lg shadow-2xl shadow-cyan-500/10">
            <button 
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              Solicitar Conquista
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">Vendedor</label>
                <select 
                  value={requestForm.sellerId}
                  onChange={(e) => setRequestForm({...requestForm, sellerId: e.target.value})}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                >
                  <option value="">Selecione...</option>
                  {sellers.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">Conquista</label>
                <select 
                  value={requestForm.achievementId}
                  onChange={(e) => setRequestForm({...requestForm, achievementId: e.target.value})}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                >
                  <option value="">Selecione...</option>
                  {achievements
                    .filter(a => a.tipo === 'manual')
                    .map(a => <option key={a.id} value={a.id}>{a.nome}</option>)
                  }
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">Justificativa</label>
                <textarea 
                  value={requestForm.justification}
                  onChange={(e) => setRequestForm({...requestForm, justification: e.target.value})}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors min-h-[80px] resize-none"
                  placeholder="Descreva por que você merece esta conquista..."
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block font-medium">Link da Evidência (Opcional)</label>
                <input 
                  type="text"
                  value={requestForm.evidenceUrl}
                  onChange={(e) => setRequestForm({...requestForm, evidenceUrl: e.target.value})}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors"
                  placeholder="https://..."
                />
              </div>

              <button
                onClick={handleSubmitRequest}
                disabled={loadingRequest}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
                className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-wider mb-4 text-center"
              >
                {celebration.customMessage || getEventConfig(celebration.type).title || "NOVA CONQUISTA!"}
              </motion.div>
              
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-cyan-400/30 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden bg-slate-900/80 mb-6 flex items-center justify-center backdrop-blur-sm">
                 <img 
                   src={getEventConfig(celebration.type).gif_url}
                   alt="Celebration" 
                   className="w-full h-full object-cover"
                   onError={(e) => {
                     // Fallback se a imagem falhar
                     e.currentTarget.style.display = 'none';
                   }}
                 />
                 {/* Overlay do Avatar do Vendedor */}
                 <div className="absolute bottom-4 right-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-cyan-400 shadow-lg overflow-hidden bg-slate-800">
                    {celebration.seller.avatar_url ? (
                      <img src={celebration.seller.avatar_url} alt={celebration.seller.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-cyan-400 bg-slate-900">
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
                className="mt-4 text-cyan-300 text-lg sm:text-xl font-medium"
              >
                {celebration.customMessage ? "" : (getEventConfig(celebration.type).message || "Parabéns!")}
              </motion.div>

              <button 
                onClick={() => setCelebration(null)}
                className="absolute top-0 right-0 p-2 text-white/50 hover:text-cyan-400 transition-colors"
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
                      ? ['bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-teal-500'][i % 4] 
                      : 'bg-cyan-400'
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
