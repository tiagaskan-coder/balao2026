'use client';

import { useAI } from '@/context/AIContext';
import AgentProductCarousel from './AgentProductCarousel';

export default function AIOverlay() {
  const { foundProducts, isListening } = useAI();

  return (
    <>
      {/* Indicador Flutuante de Escuta (Opcional, se quiser feedback visual extra) */}
      {isListening && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-xs font-medium">Ouvindo...</span>
        </div>
      )}

      {/* Carrossel de Produtos */}
      <AgentProductCarousel products={foundProducts} />
    </>
  );
}
