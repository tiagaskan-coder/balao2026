'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

// --- CONFIGURAÇÃO DOS PRÊMIOS ---
// Imagens reais baixadas localmente
const PRIZES = [
  { 
    id: 1, 
    text: 'Fone Gamer', 
    color: '#FF0055', 
    type: 'win', 
    probability: 0.3, 
    image: '/images/prizes/headset.jpg' 
  },
  { 
    id: 2, 
    text: 'PC Gamer', 
    color: '#00FFFF', 
    type: 'loss', 
    probability: 0, 
    image: '/images/prizes/pc.jpg' 
  },
  { 
    id: 3, 
    text: 'Cabo USB', 
    color: '#CCFF00', 
    type: 'win', 
    probability: 0.3, 
    image: '/images/prizes/usb.jpg' 
  },
  { 
    id: 4, 
    text: 'PS5', 
    color: '#9D00FF', 
    type: 'loss', 
    probability: 0, 
    image: '/images/prizes/ps5.jpg' 
  },
  { 
    id: 5, 
    text: '5% OFF', 
    color: '#FF9900', 
    type: 'win', 
    probability: 0.4, 
    image: '/images/prizes/discount5.png' 
  },
  { 
    id: 6, 
    text: '10% OFF', 
    color: '#0099FF', 
    type: 'loss', 
    probability: 0, 
    image: '/images/prizes/discount10.png' 
  },
  { 
    id: 7, 
    text: 'Mão de Obra', 
    color: '#FF00CC', 
    type: 'loss', 
    probability: 0, 
    image: '/images/prizes/repair.png' 
  },
];

const WINNING_PRIZES = PRIZES.filter(p => p.probability > 0);

// --- LOGO COMPONENT (Placeholder SVG se a imagem não carregar) ---
const Logo = () => (
  <div className="flex justify-center mb-6">
    <picture>
      <source srcSet="/logo.png" type="image/png" />
      <img 
        src="/logo.png" 
        alt="Balão da Informática Logo" 
        className="h-24 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]"
        onError={(e) => {
          // Fallback para texto estilizado se a imagem falhar
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = `<h1 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] tracking-tighter">Balão da<br/>Informática</h1>`;
        }}
      />
    </picture>
  </div>
);

// --- SOUND MANAGER AVANÇADO ---
const SoundManager = {
  ctx: null as AudioContext | null,
  masterGain: null as GainNode | null,
  spinOsc: null as OscillatorNode | null,
  spinGain: null as GainNode | null,
  isMuted: false,
  volume: 1.0,

  init: () => {
    if (typeof window !== 'undefined' && !SoundManager.ctx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      SoundManager.ctx = new AudioContext();
      SoundManager.masterGain = SoundManager.ctx.createGain();
      SoundManager.masterGain.connect(SoundManager.ctx.destination);
      
      // Carregar preferências
      const savedMute = localStorage.getItem('roleta_muted');
      const savedVol = localStorage.getItem('roleta_volume');
      if (savedMute !== null) SoundManager.isMuted = savedMute === 'true';
      if (savedVol !== null) SoundManager.volume = parseFloat(savedVol);
      
      SoundManager.updateVolume();
    }
  },

  updateVolume: () => {
    if (SoundManager.masterGain && SoundManager.ctx) {
      const targetVol = SoundManager.isMuted ? 0 : SoundManager.volume;
      SoundManager.masterGain.gain.setTargetAtTime(targetVol, SoundManager.ctx.currentTime, 0.1);
    }
  },

  setMute: (mute: boolean) => {
    SoundManager.isMuted = mute;
    localStorage.setItem('roleta_muted', mute.toString());
    SoundManager.updateVolume();
  },

  setVolume: (vol: number) => {
    SoundManager.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('roleta_volume', SoundManager.volume.toString());
    SoundManager.updateVolume();
  },

  // Som contínuo de "rumble" da roleta
  startSpinSound: () => {
    if (!SoundManager.ctx) SoundManager.init();
    if (!SoundManager.ctx || !SoundManager.masterGain) return;

    // Se já existe, parar anterior
    if (SoundManager.spinOsc) {
      SoundManager.stopSpinSound();
    }

    // Criar ruído rosa/marrom filtrado para simular rolamento mecânico
    const bufferSize = 2 * SoundManager.ctx.sampleRate;
    const noiseBuffer = SoundManager.ctx.createBuffer(1, bufferSize, SoundManager.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; 
    }

    const noise = SoundManager.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Filtro para dar a característica "grave" de uma roda pesada
    const filter = SoundManager.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100; // Começa grave

    SoundManager.spinGain = SoundManager.ctx.createGain();
    SoundManager.spinGain.gain.value = 0; // Fade in

    noise.connect(filter);
    filter.connect(SoundManager.spinGain);
    SoundManager.spinGain.connect(SoundManager.masterGain);

    noise.start();
    SoundManager.spinOsc = noise as any; // Guardar referência (embora seja buffer source)
    
    // Guardar referências para modulação
    (SoundManager as any).spinFilter = filter;
  },

  updateSpinSound: (speed: number) => {
    if (!SoundManager.ctx || !(SoundManager as any).spinFilter || !SoundManager.spinGain) return;
    
    // Speed 0 a 1
    // Aumentar frequência de corte e volume com a velocidade
    const filter = (SoundManager as any).spinFilter as BiquadFilterNode;
    const gain = SoundManager.spinGain;

    const targetFreq = 100 + (speed * 800); // 100Hz a 900Hz
    const targetGain = 0.2 + (speed * 0.8); // Volume aumenta com velocidade

    filter.frequency.setTargetAtTime(targetFreq, SoundManager.ctx.currentTime, 0.1);
    gain.gain.setTargetAtTime(targetGain, SoundManager.ctx.currentTime, 0.1);
  },

  stopSpinSound: () => {
    if (SoundManager.spinGain && SoundManager.ctx) {
      // Fade out
      SoundManager.spinGain.gain.setTargetAtTime(0, SoundManager.ctx.currentTime, 0.5);
      setTimeout(() => {
        if (SoundManager.spinOsc) {
          try { (SoundManager.spinOsc as any).stop(); } catch (e) {}
          SoundManager.spinOsc = null;
        }
      }, 600);
    }
  },

  playTick: (speed: number) => { 
    if (!SoundManager.ctx) SoundManager.init();
    if (!SoundManager.ctx || !SoundManager.masterGain) return;
    
    const osc = SoundManager.ctx.createOscillator();
    const gain = SoundManager.ctx.createGain();
    osc.type = 'square'; // Click mais "mecânico"
    
    const baseFreq = 800 + (speed * 600); 
    osc.frequency.setValueAtTime(baseFreq, SoundManager.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, SoundManager.ctx.currentTime + 0.03);
    
    // Volume curto e seco
    gain.gain.setValueAtTime(0.3 * speed, SoundManager.ctx.currentTime); // Mais alto se rápido
    gain.gain.exponentialRampToValueAtTime(0.001, SoundManager.ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(SoundManager.masterGain);
    osc.start();
    osc.stop(SoundManager.ctx.currentTime + 0.05);
  },

  playWin: () => {
    if (!SoundManager.ctx) SoundManager.init();
    if (!SoundManager.ctx || !SoundManager.masterGain) return;
    const now = SoundManager.ctx.currentTime;
    
    // Fanfarra complexa
    const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    const times = [0, 0.15, 0.3, 0.45, 0.6, 0.75];
    
    notes.forEach((freq, i) => {
      const osc = SoundManager.ctx!.createOscillator();
      const gain = SoundManager.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + times[i]);
      
      gain.gain.setValueAtTime(0, now + times[i]);
      gain.gain.linearRampToValueAtTime(0.3, now + times[i] + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + times[i] + 0.8);
      
      osc.connect(gain);
      gain.connect(SoundManager.masterGain!);
      osc.start(now + times[i]);
      osc.stop(now + times[i] + 1.0);
    });
  }
};

export default function RoletaPage() {
  const [step, setStep] = useState<'welcome' | 'challenge1' | 'challenge2' | 'roulette' | 'result'>('welcome');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<typeof PRIZES[0] | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  
  const wheelRef = useRef<HTMLDivElement>(null);

  // Inicializar estado do som
  useEffect(() => {
    SoundManager.init();
    setIsMuted(SoundManager.isMuted);
    setVolume(SoundManager.volume * 100);
  }, []);

  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    SoundManager.setMute(newVal);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    SoundManager.setVolume(val / 100);
  };

  const handleStart = () => {
    SoundManager.init();
    setStep('challenge1');
  };

  const handleVerifyGoogle = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('challenge2'); }, 2000);
  };

  const handleVerifyInsta = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('roulette'); }, 2000);
  };

  const spinWheel = (e: React.MouseEvent) => {
    if (!wheelRef.current) return;
    
    // Iniciar som contínuo
    SoundManager.startSpinSound();

    let selectedPrize;

    // CHEAT MODE: Shift + Click libera prêmios "impossíveis" (PC Gamer ou PS5)
    if (e.shiftKey) {
      const cheatPrizes = PRIZES.filter(p => p.id === 2 || p.id === 4);
      selectedPrize = cheatPrizes[Math.floor(Math.random() * cheatPrizes.length)];
    } else {
      const lastPrizeId = localStorage.getItem('last_prize_id');
      let availablePrizes = WINNING_PRIZES;
      if (lastPrizeId && WINNING_PRIZES.length > 1) {
        availablePrizes = WINNING_PRIZES.filter(p => p.id.toString() !== lastPrizeId);
      }

      const random = Math.random();
      const totalProb = availablePrizes.reduce((acc, p) => acc + p.probability, 0);
      let randomPointer = random * totalProb;
      selectedPrize = availablePrizes[0];
      
      for (const prize of availablePrizes) {
        randomPointer -= prize.probability;
        if (randomPointer <= 0) {
          selectedPrize = prize;
          break;
        }
      }
    }

    localStorage.setItem('last_prize_id', selectedPrize.id.toString());

    const sliceAngle = 360 / PRIZES.length;
    const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
    const offsetInsideSlice = sliceAngle * 0.15;
    const baseRotation = (360 * 8) - (prizeIndex * sliceAngle); 
    const targetRotation = baseRotation - offsetInsideSlice + (Math.random() * (sliceAngle * 0.2)); 

    gsap.to(wheelRef.current, {
      rotation: targetRotation,
      duration: 8,
      ease: "power2.inOut",
      onUpdate: function() {
        const progress = this.progress();
        const speed = 1 - Math.pow(progress - 0.5, 2) * 4; 
        
        // Atualizar som contínuo
        SoundManager.updateSpinSound(speed);

        const currentRot = this.targets()[0]._gsap.rotation;
        if (Math.floor(currentRot) % Math.floor(sliceAngle) === 0) {
           const soundSpeed = progress > 0.8 ? (1 - progress) * 5 : 1; 
           SoundManager.playTick(soundSpeed);
        }
      },
      onComplete: () => {
        SoundManager.stopSpinSound();
        SoundManager.playWin();
        
        const colors = [selectedPrize.color, '#ffffff', '#ffd700'];
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: colors, disableForReducedMotion: true });
        setTimeout(() => {
            confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
            confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
        }, 300);
        
        setResult(selectedPrize);
        setTimeout(() => setStep('result'), 1500);
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden flex flex-col items-center justify-center p-4 relative"
         style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)' }}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-20"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-[120px] opacity-20 animate-pulse delay-75"></div>
      </div>

      {/* Controle de Som Flutuante */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleMute} 
          className="p-3 bg-black/50 hover:bg-white/10 rounded-full transition-colors border border-slate-700 backdrop-blur-sm"
          title={isMuted ? "Ativar som" : "Silenciar"}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        
        {/* LOGO AREA */}
        <Logo />

        {/* CONTAINER PRINCIPAL */}
        <div className="w-full bg-black/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.1)] transition-all duration-500">
          
          {step === 'welcome' && (
            <div className="text-center animate-fadeIn max-w-md mx-auto">
              <div className="bg-gray-800/50 p-6 rounded-xl border border-cyan-500/30 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">Bem-vindo ao Clube de Vantagens!</h2>
                <p className="text-slate-300 text-lg">Gire a roleta e ganhe prêmios exclusivos na hora.</p>
              </div>
              <button 
                onClick={handleStart}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-6 rounded-2xl text-2xl shadow-[0_0_30px_rgba(0,255,255,0.4)] transition-all transform hover:scale-105 active:scale-95"
              >
                QUERO JOGAR 🎰
              </button>
            </div>
          )}

          {(step === 'challenge1' || step === 'challenge2') && (
             <div className="text-center animate-fadeIn max-w-md mx-auto">
               <h2 className={`text-2xl font-bold mb-6 ${step === 'challenge1' ? 'text-cyan-400' : 'text-pink-500'}`}>
                 {step === 'challenge1' ? 'Etapa 1: Avaliação Google' : 'Etapa 2: Siga no Instagram'}
               </h2>
               <div className={`bg-white p-6 rounded-2xl mx-auto w-fit mb-8 shadow-[0_0_30px_${step === 'challenge1' ? 'rgba(0,255,255,0.3)' : 'rgba(255,0,128,0.3)'}]`}>
                 <QRCodeSVG 
                    value={step === 'challenge1' ? "https://g.page/r/CRDiroCe65RREAE/review" : "https://www.instagram.com/balaodainformatica_castelo/"} 
                    size={220} 
                 />
               </div>
               
               <button 
                 onClick={step === 'challenge1' ? handleVerifyGoogle : handleVerifyInsta}
                 disabled={loading}
                 className={`w-full font-bold py-4 rounded-xl transition-all text-xl ${
                   step === 'challenge1' 
                     ? 'bg-green-600 hover:bg-green-500 text-white' 
                     : 'bg-pink-600 hover:bg-pink-500 text-white'
                 }`}
               >
                 {loading ? 'Verificando...' : (step === 'challenge1' ? 'JÁ AVALIEI! ✅' : 'JÁ SEGUI! 🚀')}
               </button>
             </div>
          )}

          {step === 'roulette' && (
            <div className="text-center animate-fadeIn relative flex flex-col items-center">
              {/* Marcador */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-30 w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[50px] border-t-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] filter hue-rotate-15"></div>
              
              {/* Roleta Gigante */}
              <div className="relative mb-12 transform transition-transform hover:scale-[1.02] duration-500">
                <div 
                  ref={wheelRef}
                  // AUMENTO DE 100%: w-72 (288px) -> w-[576px] ~ w-[600px] responsivo
                  className="w-[90vw] h-[90vw] max-w-[600px] max-h-[600px] rounded-full border-8 border-yellow-500 shadow-[0_0_20px_rgba(255,215,0,0.3)] overflow-hidden relative will-change-transform"
                  style={{ 
                    background: `conic-gradient(
                      ${PRIZES.map((p, i) => `${p.color} ${(i * 100) / PRIZES.length}% ${((i + 1) * 100) / PRIZES.length}%`).join(', ')}
                    )`,
                    transform: 'rotate(0deg)'
                  }} 
                >
                  {/* Itens da Roleta */}
                  {PRIZES.map((prize, index) => {
                    const sliceAngle = 360 / PRIZES.length;
                    const rotation = sliceAngle * index + (sliceAngle / 2);
                    return (
                      <div 
                        key={prize.id}
                        className="absolute w-full h-full top-0 left-0 flex justify-center"
                        style={{ transform: `rotate(${rotation}deg)` }}
                      >
                        <div className="flex flex-col items-center h-full pt-4">
                           {/* Texto na Borda (Topo) */}
                           <span 
                             className="text-sm md:text-xl font-black text-white bg-black/60 px-3 py-1 rounded-full uppercase tracking-wider max-w-[140px] text-center leading-tight border border-white/10 mb-2"
                           >
                             {prize.text}
                           </span>

                           {/* Imagem do Produto (Maior e abaixo do texto) */}
                           <div className="w-24 h-24 md:w-36 md:h-36 bg-white/10 rounded-2xl p-2 border border-white/20">
                             <img 
                               src={prize.image} 
                               alt={prize.text}
                               className="w-full h-full object-cover rounded-xl"
                               loading="eager"
                               decoding="sync"
                             />
                           </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Centro */}
                  <div className="absolute top-1/2 left-1/2 w-20 h-20 md:w-32 md:h-32 bg-gradient-to-br from-yellow-400 to-yellow-700 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center z-20 border-8 border-black">
                    <span className="text-4xl md:text-6xl filter drop-shadow-lg">🎰</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={spinWheel}
                className="w-full max-w-md bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold py-6 rounded-2xl text-3xl shadow-[0_0_40px_rgba(255,165,0,0.6)] animate-pulse tracking-widest uppercase border-b-4 border-orange-800 active:border-b-0 active:translate-y-1"
              >
                GIRAR!
              </button>
            </div>
          )}

          {step === 'result' && result && (
            <div className="text-center animate-scaleIn">
              <h2 className="text-4xl md:text-5xl font-black text-yellow-400 mb-4 drop-shadow-lg">PARABÉNS! 🎉</h2>
              
              <div className="bg-gradient-to-br from-slate-800 to-black p-10 rounded-3xl border-4 border-yellow-500 shadow-[0_0_60px_rgba(255,215,0,0.4)] mb-8 relative overflow-hidden group max-w-lg mx-auto">
                <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
                
                <img 
                  src={result.image} 
                  alt={result.text}
                  className="w-48 h-48 md:w-64 md:h-64 object-contain mx-auto mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] transform group-hover:scale-110 transition-transform duration-500"
                />
                
                <h3 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 uppercase tracking-widest relative z-10">
                  {result.text}
                </h3>
              </div>

              <p className="text-slate-400 mb-8 text-lg">
                Tire um print desta tela e mostre ao vendedor!
              </p>

              <button 
                onClick={() => window.location.reload()}
                className="text-cyan-400 underline hover:text-cyan-300 text-lg"
              >
                Jogar Novamente
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 text-slate-500 text-sm text-center z-10">
        &copy; 2026 Balão da Informática Castelo.
      </footer>
    </div>
  );
}