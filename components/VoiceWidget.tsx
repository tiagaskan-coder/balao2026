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

  const handleToggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (!isConnected) connect();
    } else {
      setIsOpen(false);
    }
    setHasInteracted(true);
  };

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

            {/* Status Connection */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></div>
                 <span className="text-xs font-medium text-white/70">{isConnected ? "Em chamada..." : "Conectando"}</span>
            </div>

            {/* Avatar / Visualizer Central */}
            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8 mt-4">
                
                {/* Avatar */}
                <div className="relative">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center bg-gray-800 shadow-2xl ${
                        isListening ? "border-green-500 animate-pulse" : "border-gray-600"
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
                        {messages.length > 0 && messages[messages.length-1].role === 'assistant' && !isListening && (
                             <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20 animate-ping"></span>
                        )}
                    </div>
                    {isListening && (
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-green-400 text-sm font-bold whitespace-nowrap">
                            Ouvindo você...
                        </div>
                    )}
                </div>

                {/* Última Mensagem (Legenda) */}
                <div className="w-full max-w-[90%] text-center space-y-2 min-h-[60px]">
                    {messages.length > 0 ? (
                        <p className="text-lg font-medium text-white/90 leading-relaxed animate-fade-in">
                            "{messages[messages.length-1].content}"
                        </p>
                    ) : (
                        <p className="text-gray-400">Aguardando início...</p>
                    )}
                </div>

                {/* Product Suggestions (Cards Overlay) */}
                {suggestedProducts.length > 0 && (
                    <div className="w-full overflow-x-auto pb-4 px-2 flex gap-4 snap-x justify-center">
                        {suggestedProducts.map(product => (
                            <Link 
                                key={product.id}
                                href={`/product/${product.id}`} 
                                className="flex-shrink-0 w-40 bg-white rounded-xl shadow-lg p-3 snap-center transform hover:scale-105 transition-transform"
                            >
                                <div className="relative w-full h-24 mb-2 bg-gray-50 rounded-lg overflow-hidden">
                                    {product.image ? (
                                        <Image src={product.image} alt={product.name} fill className="object-contain" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300"><ShoppingCart size={24} /></div>
                                    )}
                                </div>
                                <h4 className="text-xs font-bold text-gray-800 line-clamp-2 h-8">{product.name}</h4>
                                <p className="text-sm font-extrabold text-[#E60012] mt-1">R$ {product.price?.toFixed(2)}</p>
                                <div className="mt-2 w-full bg-[#E60012] text-white text-[10px] py-1 text-center rounded font-bold uppercase">
                                    Ver Detalhes
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>

            {/* Footer Controls (Phone Style) */}
            <div className="w-full pt-6 pb-2 flex items-center justify-center gap-8">
                <button 
                    onClick={toggleListening}
                    className={`p-4 rounded-full transition-all transform hover:scale-110 ${
                        isListening ? "bg-white text-black" : "bg-gray-700 text-white"
                    }`}
                >
                    {isListening ? <Volume2 size={24} /> : <Mic size={24} />}
                </button>

                <button 
                    onClick={handleToggleOpen}
                    className="p-4 rounded-full bg-red-600 text-white shadow-lg transform hover:scale-110"
                >
                    <span className="sr-only">Desligar</span>
                    <X size={24} />
                </button>
            </div>
            
          </div>


        </div>
      )}
    </>
  );
}
