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
    suggestedProducts,
    isOpen,
    setIsOpen,
    sendMessage
  } = useVoice();
  
  // const [isOpen, setIsOpen] = useState(false); // REMOVIDO: Usar do contexto
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
          // sendMessage já está disponível no escopo via destructuring inicial
          sendMessage(inputText);
          setInputText("");
      }
  };

  // const { sendMessage } = useVoice(); // Removido: já obtido acima
  
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

  // Removemos o estado interno "hasInteracted" e o botão flutuante, 
  // pois o controle agora é via Header (que chama setIsOpen).
  // Se não estiver aberto, não renderiza nada.
  if (!isOpen) return null;

  return (
    <>
      {/* Modal / Overlay do Assistente */}
      {/* 
         - Desktop: fixed bottom-40 right-6 w-[400px] h-[500px]
         - Mobile: fixed bottom-4 right-4 left-4 h-[25vh] max-h-[25vh] (compact view)
      */}
      <div className="fixed z-[9998] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden font-sans
                      bottom-20 right-4 left-4 md:left-auto md:bottom-24 md:right-6 
                      w-auto md:w-[400px] 
                      h-[25vh] md:h-[500px] max-h-[500px]
                      transition-all duration-300 ease-in-out">
        
        {/* Header */}
        <div className="bg-[#1a1a1a] p-4 md:p-6 text-white flex flex-col items-center justify-center h-full relative">
          
          {/* Botão Fechar */}
          <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 md:top-4 md:right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-20"
          >
              <X size={16} className="md:w-5 md:h-5" />
          </button>

          {/* Status Connection & Mic Indicator */}
          <div className="absolute top-2 left-2 md:top-4 md:left-4 flex items-center gap-2 z-20">
               <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${isListening ? "bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.7)]" : "bg-gray-500"}`}></div>
               <span className="text-[10px] md:text-xs font-medium text-white/70">
                  {isConnected ? (isListening ? "Ouvindo..." : "Processando...") : "Desconectado"}
               </span>
          </div>

          {/* Avatar / Visualizer Central - Versão Compacta Mobile */}
          <div className="flex-1 flex flex-col items-center justify-center w-full space-y-4 md:space-y-8 mt-2 md:mt-4 overflow-y-auto">
              
              {/* Avatar */}
              <div className="relative shrink-0">
                  <div className={`w-20 h-20 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center bg-gray-800 shadow-2xl transition-all duration-500 ${
                      isListening ? "border-red-500 scale-105" : "border-gray-600"
                  }`}>
                      <div className="relative z-10">
                          <Image 
                              src="https://github.com/shadcn.png" 
                              alt="Agent" 
                              width={80} 
                              height={80} 
                              className="rounded-full opacity-80 w-12 h-12 md:w-20 md:h-20"
                          />
                      </div>
                      {/* Ondas de som */}
                      {isListening && (
                           <>
                              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20 animate-ping"></span>
                              <span className="absolute inline-flex h-[120%] w-[120%] rounded-full bg-red-400 opacity-10 animate-ping delay-75"></span>
                           </>
                      )}
                  </div>
              </div>

              {/* Última Mensagem */}
              <div className="w-full max-w-[95%] text-center space-y-1 min-h-[40px] md:min-h-[60px]">
                  {messages.length > 0 ? (
                      <p className="text-sm md:text-lg font-medium text-white/90 leading-relaxed animate-fade-in transition-all line-clamp-3">
                          "{messages[messages.length-1].content}"
                      </p>
                  ) : (
                      <p className="text-gray-400 text-xs md:text-sm">Aguardando início...</p>
                  )}
              </div>

              {/* Fallback Text Input */}
              {!isListening && isConnected && (
                  <form onSubmit={submitText} className="w-[90%] md:w-[80%] relative shrink-0">
                      <input 
                          type="text" 
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="Digite se preferir..."
                          className="w-full bg-white/10 border border-white/20 rounded-full py-1.5 px-3 md:py-2 md:px-4 text-xs md:text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                      />
                  </form>
              )}

              {/* Product Suggestions */}
              {suggestedProducts.length > 0 && (
                  <div className="w-full overflow-x-auto pb-2 px-2 flex gap-3 snap-x justify-start md:justify-center animate-slide-up shrink-0">
                      {suggestedProducts.map(product => (
                          <Link 
                              key={product.id}
                              href={`/product/${product.id}`} 
                              className="flex-shrink-0 w-32 md:w-40 bg-white rounded-xl shadow-lg p-2 md:p-3 snap-center transform hover:scale-105 transition-transform duration-300"
                          >
                              <div className="relative w-full h-16 md:h-24 mb-1 md:mb-2 bg-gray-50 rounded-lg overflow-hidden">
                                  {product.image ? (
                                      <Image src={product.image} alt={product.name} fill className="object-contain" />
                                  ) : (
                                      <div className="flex items-center justify-center h-full text-gray-300"><ShoppingCart size={20} /></div>
                                  )}
                              </div>
                              <h4 className="text-[10px] md:text-xs font-bold text-gray-800 line-clamp-2 h-6 md:h-8 leading-tight">{product.name}</h4>
                              <p className="text-xs md:text-sm font-extrabold text-[#E60012] mt-0.5">R$ {Number(product.price).toFixed(2)}</p>
                          </Link>
                      ))}
                  </div>
              )}

          </div>

          {/* Footer Controls */}
          <div className="w-full pt-2 md:pt-6 pb-1 md:pb-2 flex items-center justify-center gap-4 relative shrink-0">
              
              {/* Botão Encerrar Chamada */}
              <button 
                  onClick={handleEndCall}
                  className="p-3 md:p-5 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 active:scale-95 transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-1 w-14 h-14 md:w-20 md:h-20 border-2 md:border-4 border-[#1a1a1a]"
                  aria-label="Encerrar Chamada"
              >
                  <span className="sr-only">Encerrar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-135 md:scale-125"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </button>

          </div>
          
          {/* Hint de Encerrar */}
          <p className="text-[10px] md:text-xs text-gray-500 absolute bottom-1 w-full text-center opacity-70">Encerrar</p>
        </div>

      </div>
    </>
  );
}
