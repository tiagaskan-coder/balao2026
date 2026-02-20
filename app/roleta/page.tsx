'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

// --- CONFIGURAÇÃO DOS PRÊMIOS ---
// Ordem na roleta (sentido horário)
// Ajuste as cores para tema neon/cassino
const PRIZES = [
  { id: 1, text: 'Fone de Ouvido', color: '#FF0055', type: 'win', probability: 0.3 },
  { id: 2, text: 'PC Gamer', color: '#00FFFF', type: 'loss', probability: 0 },
  { id: 3, text: 'Cabo USB', color: '#CCFF00', type: 'win', probability: 0.3 },
  { id: 4, text: 'PS5', color: '#9D00FF', type: 'loss', probability: 0 },
  { id: 5, text: '5% OFF', color: '#FF9900', type: 'win', probability: 0.4 },
  { id: 6, text: '10% OFF', color: '#0099FF', type: 'loss', probability: 0 }, // Isca
  { id: 7, text: 'Mão de Obra', color: '#FF00CC', type: 'loss', probability: 0 }, // Isca
];

// Prêmios vencedores permitidos pelo "Rigged System"
const WINNING_PRIZES = PRIZES.filter(p => p.probability > 0);

// --- COMPONENTES AUXILIARES ---

// Robô Animado (SVG Simples com animação CSS)
const RoboAgent = () => (
  <div className="w-32 h-32 mx-auto mb-4 relative animate-bounce-slow">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">
      <circle cx="100" cy="100" r="90" fill="#1a1a2e" stroke="#00ffff" strokeWidth="5" />
      <rect x="60" y="80" width="80" height="50" rx="10" fill="#00ffff" className="animate-pulse" />
      <circle cx="85" cy="105" r="10" fill="#000" />
      <circle cx="115" cy="105" r="10" fill="#000" />
      <path d="M 70 150 Q 100 170 130 150" stroke="#00ffff" strokeWidth="5" fill="none" />
      <rect x="95" y="20" width="10" height="30" fill="#00ffff" />
      <circle cx="100" cy="15" r="8" fill="#ff0055" className="animate-ping" />
    </svg>
  </div>
);

// Gerador de Som Simples (Web Audio API)
const SoundManager = {
  ctx: null as AudioContext | null,
  init: () => {
    if (typeof window !== 'undefined' && !SoundManager.ctx) {
      SoundManager.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  },
  playTick: () => {
    if (!SoundManager.ctx) SoundManager.init();
    if (!SoundManager.ctx) return;
    const osc = SoundManager.ctx.createOscillator();
    const gain = SoundManager.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, SoundManager.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, SoundManager.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, SoundManager.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, SoundManager.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(SoundManager.ctx.destination);
    osc.start();
    osc.stop(SoundManager.ctx.currentTime + 0.1);
  },
  playWin: () => {
    if (!SoundManager.ctx) SoundManager.init();
    if (!SoundManager.ctx) return;
    // Sequência de vitória simples
    const now = SoundManager.ctx.currentTime;
    [0, 0.2, 0.4, 0.6].forEach((t, i) => {
      const osc = SoundManager.ctx!.createOscillator();
      const gain = SoundManager.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440 + (i * 100), now + t);
      gain.gain.setValueAtTime(0.1, now + t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.3);
      osc.connect(gain);
      gain.connect(SoundManager.ctx!.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.3);
    });
  }
};

export default function RoletaPage() {
  const [step, setStep] = useState<'welcome' | 'challenge1' | 'challenge2' | 'roulette' | 'result'>('welcome');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof PRIZES[0] | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar Áudio no primeiro clique
  const handleStart = () => {
    SoundManager.init();
    setStep('challenge1');
  };

  // Simular verificação do Google Review
  const handleVerifyGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('challenge2');
    }, 2000);
  };

  // Simular verificação do Instagram
  const handleVerifyInsta = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('roulette');
    }, 2000);
  };

  // Lógica da Roleta
  const spinWheel = () => {
    if (!wheelRef.current) return;
    
    // Escolher prêmio (Rigged)
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedPrize = WINNING_PRIZES[0];
    
    for (const prize of WINNING_PRIZES) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    // Calcular rotação
    // Cada fatia tem 360 / 7 graus
    const sliceAngle = 360 / PRIZES.length;
    // Índice do prêmio selecionado no array original
    const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
    
    // Rotação alvo: Queremos que o prêmio pare no TOPO (ou onde estiver o marcador)
    // Se o marcador estiver no topo (0 graus), a rotação deve trazer o item para 0.
    // O centro da fatia 'index' está em: index * sliceAngle + sliceAngle / 2
    // Para trazer isso para 0, precisamos girar: -(index * sliceAngle + sliceAngle / 2)
    // Adicionamos voltas completas (360 * 5)
    
    const randomOffset = (Math.random() - 0.5) * (sliceAngle * 0.6); // Margem de segurança
    const targetRotation = (360 * 8) - (prizeIndex * sliceAngle) - (sliceAngle / 2) + randomOffset;

    // Animação GSAP
    gsap.to(wheelRef.current, {
      rotation: targetRotation,
      duration: 6,
      ease: "power4.inOut", // Começa devagar, acelera, desacelera
      onUpdate: function() {
        // Tentar tocar som a cada fatia (aproximado)
        const rotation = this.targets()[0]._gsap.rotation % 360;
        // Lógica simplificada para som de tick
        if (Math.floor(rotation) % Math.floor(sliceAngle) === 0) {
          SoundManager.playTick();
        }
      },
      onComplete: () => {
        // Efeito "Quase Vitória" (Totó final)
        // Se quisermos implementar o "escorregão" do PC Gamer, precisaríamos ajustar a rotação alvo para ficar
        // bem na borda e depois dar um tween extra.
        // Simplificação: Apenas mostrar resultado e celebrar.
        
        SoundManager.playWin();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00FFFF', '#FF0055', '#FFD700']
        });
        
        setResult(selectedPrize);
        setTimeout(() => setStep('result'), 1000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center p-4 relative"
         style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)' }}>
      
      {/* Luzes de Fundo (Ambient) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-[120px] opacity-20 animate-pulse delay-75"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="z-10 w-full max-w-md bg-black/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.1)]">
        
        {/* Cabeçalho */}
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
            RODA DA SORTE
          </h1>
          <p className="text-cyan-200 text-sm mt-1">Balão da Informática</p>
        </header>

        {/* TELA 1: BOAS-VINDAS */}
        {step === 'welcome' && (
          <div className="text-center animate-fadeIn">
            <RoboAgent />
            <div className="bg-gray-800/50 p-4 rounded-xl border border-cyan-500/30 mb-6">
              <p className="text-lg mb-2">👋 Olá! Sou o assistente virtual do Balão.</p>
              <p className="text-slate-300">Quer testar sua sorte? Você pode ganhar prêmios incríveis agora mesmo!</p>
            </div>
            <button 
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl text-xl shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all transform hover:scale-105 active:scale-95"
            >
              QUERO JOGAR 🎰
            </button>
          </div>
        )}

        {/* TELA 2: DESAFIO 1 (GOOGLE) */}
        {step === 'challenge1' && (
          <div className="text-center animate-fadeIn">
            <RoboAgent />
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Desafio 1 de 2</h2>
            <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <QRCodeSVG value="https://g.page/r/CRDiroCe65RREAE/review" size={180} />
            </div>
            <p className="text-sm text-slate-400 mb-6">Escaneie para avaliar ou clique no botão abaixo.</p>
            
            <a 
              href="https://g.page/r/CRDiroCe65RREAE/review" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block mb-4 text-cyan-400 underline"
            >
              Abrir Link Direto
            </a>

            <button 
              onClick={handleVerifyGoogle}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Verificando...' : 'JÁ AVALIEI! ✅'}
            </button>
          </div>
        )}

        {/* TELA 3: DESAFIO 2 (INSTAGRAM) */}
        {step === 'challenge2' && (
          <div className="text-center animate-fadeIn">
            <RoboAgent />
            <h2 className="text-xl font-bold text-pink-500 mb-4">Desafio 2 de 2</h2>
            <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-4 shadow-[0_0_20px_rgba(255,0,128,0.2)]">
              <QRCodeSVG value="https://www.instagram.com/balaodainformatica_castelo/" size={180} />
            </div>
            <p className="text-sm text-slate-400 mb-6">Siga nosso Instagram para liberar a roleta!</p>
            
            <a 
              href="https://www.instagram.com/balaodainformatica_castelo/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block mb-4 text-pink-400 underline"
            >
              Abrir Instagram
            </a>

            <button 
              onClick={handleVerifyInsta}
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Verificando...' : 'JÁ SEGUI! 🚀'}
            </button>
          </div>
        )}

        {/* TELA 4: ROLETA */}
        {step === 'roulette' && (
          <div className="text-center animate-fadeIn relative">
            {/* Marcador */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-lg"></div>
            
            {/* Container da Roleta */}
            <div className="relative w-72 h-72 mx-auto mb-8">
              <div 
                ref={wheelRef}
                className="w-full h-full rounded-full border-4 border-yellow-500 shadow-[0_0_30px_rgba(255,215,0,0.3)] overflow-hidden relative"
                style={{ 
                  background: `conic-gradient(
                    ${PRIZES.map((p, i) => `${p.color} ${(i * 100) / PRIZES.length}% ${((i + 1) * 100) / PRIZES.length}%`).join(', ')}
                  )`,
                  transform: 'rotate(0deg)'
                }} 
              >
                {/* Textos dos Prêmios */}
                {PRIZES.map((prize, index) => {
                  const sliceAngle = 360 / PRIZES.length;
                  const rotation = sliceAngle * index + (sliceAngle / 2); // Centralizar no meio da fatia
                  return (
                    <div 
                      key={prize.id}
                      className="absolute w-full h-full top-0 left-0 flex justify-center"
                      style={{ 
                        transform: `rotate(${rotation}deg)`,
                      }}
                    >
                      <span 
                        className="text-xs font-bold text-black mt-4 writing-vertical-rl"
                        style={{ 
                          textShadow: '0 0 2px rgba(255,255,255,0.8)',
                          transform: 'translateY(10px)'
                        }}
                      >
                        {prize.text}
                      </span>
                    </div>
                  );
                })}

                
                {/* Centro da Roleta */}
                <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-inner flex items-center justify-center z-10 border-4 border-black">
                  <span className="text-2xl">🎲</span>
                </div>
              </div>
            </div>

            <button 
              onClick={spinWheel}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl text-xl shadow-[0_0_20px_rgba(255,165,0,0.4)] animate-pulse"
            >
              GIRAR AGORA!
            </button>
          </div>
        )}

        {/* TELA 5: RESULTADO */}
        {step === 'result' && result && (
          <div className="text-center animate-scaleIn">
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">PARABÉNS! 🎉</h2>
            <p className="text-slate-300 mb-6">Você ganhou:</p>
            
            <div className="bg-gradient-to-br from-slate-800 to-black p-8 rounded-2xl border-2 border-yellow-500 shadow-[0_0_40px_rgba(255,215,0,0.3)] mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
              <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 relative z-10">
                {result.text}
              </h3>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              Tire um print desta tela e mostre ao vendedor!
            </p>

            <button 
              onClick={() => window.location.reload()}
              className="text-cyan-400 underline hover:text-cyan-300"
            >
              Jogar Novamente
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-8 text-slate-400 text-xs text-center z-10">
        &copy; 2026 Balão da Informática Castelo. Todos os direitos reservados.
      </footer>
    </div>
  );
}
