"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, X, MessageSquare, ShoppingCart, ChevronRight, Volume2 } from "lucide-react";
import { useVoice } from "@/context/VoiceContext";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/utils";

export default function VoiceWidget() {
  const { 
    isListening, 
    isConnected, 
    connect, 
    disconnect, 
    toggleListening, 
    messages, 
    suggestedProducts 
  } = useVoice();
  
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Debounce helper
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleToggleOpen = debounce(() => {
    if (!isOpen) {
      setIsOpen(true);
      if (!isConnected) connect();
    } else {
      // Se clicar no X, apenas minimiza ou desconecta? O usuário pediu botão de encerrar na interface.
      // Vamos manter o X como minimizar/fechar modal, mas adicionar o botão "Encerrar" dentro.
      setIsOpen(false);
    }
    setHasInteracted(true);
  }, 500);

  const handleEndCall = debounce(() => {
      disconnect();
      setIsOpen(false);
  }, 500);
  
  const [inputText, setInputText] = useState("");
  const handleSendText = (e: React.FormEvent) => {
      e.preventDefault();
      if (inputText.trim()) {
          // Precisamos expor sendMessage do context ou usar um hack
          // Como sendMessage não está exposto diretamente no destructuring lá em cima, vamos adicionar
          // Nota: O context exporta sendMessage, precisamos pegá-lo
      }
  };

  // Re-obter sendMessage do context
  const { sendMessage } = useVoice();
  
  const submitText = (e: React.FormEvent) => {
      e.preventDefault();
      if(inputText.trim()) {
          sendMessage(inputText);
          setInputText("");
      }
  }

  const handleClose = () => {
    setIsOpen(false);
    // Optional: disconnect() if we want to save resources
  };

  // Scroll to bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!hasInteracted && !isConnected) {
    // Estado inicial: apenas o botão flutuante
  }

  return (
    <>
      {/* Botão Flutuante (Floating Action Button) */}
      <button
        onClick={handleToggleOpen}
        className={`fixed bottom-24 right-6 z-[9999] p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
          isOpen 
            ? "bg-gray-800 text-white rotate-90" 
            : "bg-[#E60012] text-white animate-bounce-slow"
        }`}
        aria-label="Ativar Assistente de Voz"
      >
        {isOpen ? <X size={24} /> : <Mic size={24} />}
        
        {/* Onda de animação (Pulse) quando fechado */}
        {!isOpen && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping -z-10"></span>
        )}
      </button>

      {/* Modal / Overlay do Assistente */}
      {isOpen && (
        <div className="fixed bottom-40 right-6 z-[9998] w-[90vw] max-w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden font-sans">
          
          {/* Header */}
          <div className="bg-[#1a1a1a] p-6 text-white flex flex-col items-center justify-center h-full relative">
            
            {/* Botão Fechar */}
            <button 
                onClick={handleToggleOpen}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
                <X size={20} />
            </button>

            {/* Status Connection & Mic Indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
                 <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${isListening ? "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.7)]" : "bg-gray-500"}`}></div>
                 <span className="text-xs font-medium text-white/70">
                    {isConnected ? (isListening ? "Ouvindo..." : "Processando...") : "Desconectado"}
                 </span>
            </div>

            {/* Avatar / Visualizer Central */}
            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8 mt-4">
                
                {/* Avatar */}
                <div className="relative">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-gray-800 shadow-2xl transition-all duration-500 ${
                        isListening ? "border-red-500 scale-105" : "border-gray-600"
                    }`}>
                        <div className="relative z-10">
                            <Image 
                                src="https://github.com/shadcn.png" 
                                alt="Agent" 
                                width={80} 
                                height={80} 
                                className="rounded-full opacity-80"
                            />
                        </div>
                        {/* Ondas de som (Animação de fala) */}
                        {isListening && (
                             <>
                                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20 animate-ping"></span>
                                <span className="absolute inline-flex h-[120%] w-[120%] rounded-full bg-red-400 opacity-10 animate-ping delay-75"></span>
                             </>
                        )}
                    </div>
                    {isListening && (
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-red-400 text-sm font-bold whitespace-nowrap animate-pulse">
                            Ouvindo...
                        </div>
                    )}
                </div>

                {/* Última Mensagem (Legenda) */}
                <div className="w-full max-w-[90%] text-center space-y-2 min-h-[60px]">
                    {messages.length > 0 ? (
                        <p className="text-lg font-medium text-white/90 leading-relaxed animate-fade-in transition-all">
                            "{messages[messages.length-1].content}"
                        </p>
                    ) : (
                        <p className="text-gray-400 text-sm">Aguardando início...</p>
                    )}
                </div>

                {/* Fallback Text Input */}
                {!isListening && isConnected && (
                    <form onSubmit={submitText} className="w-[80%] relative">
                        <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Digite se preferir..."
                            className="w-full bg-white/10 border border-white/20 rounded-full py-2 px-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                        />
                    </form>
                )}

                {/* Product Suggestions (Cards Overlay) */}
                {suggestedProducts.length > 0 && (
                    <div className="w-full overflow-x-auto pb-4 px-2 flex gap-4 snap-x justify-center animate-slide-up">
                        {suggestedProducts.map(product => (
                            <Link 
                                key={product.id}
                                href={`/product/${product.id}`} 
                                className="flex-shrink-0 w-40 bg-white rounded-xl shadow-lg p-3 snap-center transform hover:scale-105 transition-transform duration-300"
                            >
                                <div className="relative w-full h-24 mb-2 bg-gray-50 rounded-lg overflow-hidden">
                                    {product.image ? (
                                        <Image src={product.image} alt={product.name} fill className="object-contain" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300"><ShoppingCart size={24} /></div>
                                    )}
                                </div>
                                <h4 className="text-xs font-bold text-gray-800 line-clamp-2 h-8">{product.name}</h4>
                                <p className="text-sm font-extrabold text-[#E60012] mt-1">R$ {Number(product.price).toFixed(2)}</p>
                                <div className="mt-2 w-full bg-[#E60012] text-white text-[10px] py-1 text-center rounded font-bold uppercase">
                                    Ver Detalhes
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>

            {/* Footer Controls (Phone Style) */}
            <div className="w-full pt-6 pb-2 flex items-center justify-center gap-8 relative">
                
                {/* Botão Encerrar Chamada (Central, Grande, Vermelho) */}
                <button 
                    onClick={handleEndCall}
                    className="p-5 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 active:scale-95 transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-1 w-20 h-20 border-4 border-[#1a1a1a]"
                    aria-label="Encerrar Chamada"
                >
                    <span className="sr-only">Encerrar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-135"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </button>

            </div>
            
            {/* Hint de Encerrar */}
            <p className="text-xs text-gray-500 absolute bottom-2 w-full text-center">Toque no botão vermelho para encerrar</p>
          </div>


        </div>
      )}
    </>
  );
}
