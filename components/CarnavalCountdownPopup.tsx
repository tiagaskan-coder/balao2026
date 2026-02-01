'use client';

import { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';

interface CarnavalCountdownPopupProps {
  delayMs?: number;
  // Data final da promoção (formato: 'YYYY-MM-DD')
  promoEndDate?: string;
}

export default function CarnavalCountdownPopup({ 
  delayMs = 2000,
  promoEndDate = '2026-03-05'
}: CarnavalCountdownPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calcula o tempo restante
  useEffect(() => {
    const calculateTimeLeft = () => {
      const endDate = new Date(promoEndDate + 'T23:59:59').getTime();
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [promoEndDate]);

  // Controla a exibição do popup
  useEffect(() => {
    const hasClosedPopup = sessionStorage.getItem('carnaval-popup-closed');
    
    if (!hasClosedPopup) {
      const timer = setTimeout(() => {
        setShouldRender(true);
        setTimeout(() => setIsOpen(true), 100);
      }, delayMs);

      return () => clearTimeout(timer);
    }
  }, [delayMs]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('carnaval-popup-closed', 'true');
    setTimeout(() => setShouldRender(false), 300);
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Botão de fechar */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Header colorido */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 p-6 text-white text-center relative overflow-hidden">
            {/* Padrão de confetes animado */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-white rounded-full animate-ping"></div>
              <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-bounce"></div>
            </div>
            
            <div className="relative z-10">
              <div className="text-5xl mb-2 animate-bounce">🎭</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                SUPER PROMOÇÃO DE CARNAVAL
              </h2>
              <p className="text-xl font-semibold">
                Até 50% OFF + Frete Grátis*
              </p>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            {/* Countdown Timer */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-pink-500" />
                <p className="text-lg font-semibold text-gray-700">
                  Promoção termina em:
                </p>
              </div>
              
              <div className="flex justify-center gap-3 md:gap-4">
                <TimeBox value={timeLeft.days} label="Dias" />
                <TimeBox value={timeLeft.hours} label="Horas" />
                <TimeBox value={timeLeft.minutes} label="Min" />
                <TimeBox value={timeLeft.seconds} label="Seg" />
              </div>
            </div>

            {/* Destaques */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-3 text-center">
                🎉 Destaques da Promoção:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">✓</span>
                  <span>Até <strong>50% de desconto</strong> em produtos selecionados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">✓</span>
                  <span><strong>Frete grátis</strong> para compras acima de R$ 299</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-500 font-bold">✓</span>
                  <span>Parcele em até <strong>10x sem juros</strong></span>
                </li>
              </ul>
            </div>

            {/* Cupom */}
            <div className="bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-xl p-4 mb-6 text-center">
              <p className="text-sm text-gray-600 mb-1">
                Use o cupom no checkout:
              </p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-2xl md:text-3xl font-black text-purple-600 tracking-wider">
                  CARNAVAL50
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('CARNAVAL50');
                    alert('Cupom copiado! 🎉');
                  }}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-4 px-8 rounded-full hover:scale-[1.02] transition-transform shadow-lg hover:shadow-xl text-lg"
            >
              🎁 Aproveitar Ofertas Agora!
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              *Válido até 05/03/2026. Consulte condições.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Componente auxiliar para os números do countdown
function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl p-3 md:p-4 shadow-lg min-w-[60px] md:min-w-[80px]">
      <div className="text-2xl md:text-4xl font-bold text-white text-center">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs md:text-sm text-white/90 text-center mt-1 font-semibold">
        {label}
      </div>
    </div>
  );
}
