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
    // @ts-ignore
    sendMessage
  } = useVoice();
  
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputText, setInputText] = useState(""); // For text fallback

  const handleToggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      if (!isConnected) connect();
    } else {
      setIsOpen(false);
    }
    setHasInteracted(true);
  };

  const handleSendText = (e: React.FormEvent) => {
      e.preventDefault();
      if (inputText.trim()) {
          sendMessage(inputText);
          setInputText("");
      }
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
          <div className="bg-gradient-to-r from-[#E60012] to-red-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Mic size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Assistente Balão</h3>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}></span>
                  <span className="text-xs text-white/90">{isConnected ? "Online" : "Conectando..."}</span>
                </div>
              </div>
            </div>
            {/* Visualizer (Fake wave for now) */}
            {isListening && (
               <div className="flex gap-1 items-end h-4">
                  <div className="w-1 h-3 bg-white animate-pulse"></div>
                  <div className="w-1 h-5 bg-white animate-pulse delay-75"></div>
                  <div className="w-1 h-2 bg-white animate-pulse delay-150"></div>
                  <div className="w-1 h-4 bg-white animate-pulse"></div>
               </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10 text-sm">
                <p>Olá! Eu sou o assistente virtual do Balão.</p>
                <p className="mt-2">Pressione o microfone para falar.</p>
                <p className="mt-1">Ex: "Estou procurando um PC Gamer barato"</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Product Suggestions Carousel (Horizontal Scroll) */}
          {suggestedProducts.length > 0 && (
             <div className="bg-white border-t border-gray-100 p-3">
                <p className="text-xs font-bold text-gray-500 mb-2 px-1">Produtos Sugeridos</p>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                   {suggestedProducts.map(product => (
                      <Link 
                        key={product.id}
                        href={`/product/${product.id}`} 
                        className="flex-shrink-0 w-32 bg-gray-50 rounded-lg border border-gray-100 p-2 snap-center hover:border-red-200 transition-colors group"
                      >
                         <div className="relative w-full h-24 mb-2 bg-white rounded-md overflow-hidden">
                           {product.image ? (
                              <Image 
                                src={product.image} 
                                alt={product.name} 
                                fill 
                                className="object-contain p-1"
                              />
                           ) : (
                               <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                  <ShoppingCart size={20} />
                               </div>
                            )}
                         </div>
                         <p className="text-[10px] font-medium text-gray-700 line-clamp-2 leading-tight group-hover:text-[#E60012]">
                            {product.name}
                         </p>
                         <p className="text-xs font-bold text-[#E60012] mt-1">
                            {product.price}
                         </p>
                      </Link>
                   ))}
                </div>
             </div>
          )}

          {/* Footer Controls */}
          <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-2">
             {/* Text Input Fallback (Since STT is hard in browser without backend stream) */}
             <form onSubmit={handleSendText} className="flex gap-2">
                 <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Digite ou fale..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E60012]"
                 />
                 <button 
                    type="submit" 
                    className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-[#E60012] hover:text-white transition-colors"
                 >
                    <ChevronRight size={18} />
                 </button>
             </form>
             
             <div className="flex items-center justify-center pt-1 relative">
                <button
                  onClick={toggleListening}
                  disabled={!isConnected}
                  className={`p-3 rounded-full shadow-lg transition-all ${
                    isListening 
                      ? "bg-red-100 text-[#E60012] scale-110 border-2 border-[#E60012]" 
                      : "bg-[#E60012] text-white hover:bg-red-700 hover:scale-105"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Mic size={24} />
                </button>
                {isListening && (
                    <span className="absolute -bottom-0 text-[10px] text-gray-500 font-medium animate-pulse mt-1">
                      Ouvindo...
                    </span>
                )}
             </div>
          </div>

        </div>
      )}
    </>
  );
}
