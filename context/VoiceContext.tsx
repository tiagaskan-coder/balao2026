"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Product } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type VoiceContextType = {
  isListening: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
  messages: Message[];
  suggestedProducts: Product[];
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  connect: () => void;
  disconnect: () => void;
};

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  
  // Use HTTP instead of WebSocket for Vercel Serverless compatibility
  const sendMessage = async (text: string) => {
    try {
        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', content: text }]);
        
        // Call backend API
        const response = await fetch('/api/py/chat', { // Use rewrites path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        if (!response.ok) throw new Error('Falha na comunicação com o agente');
        
        const data = await response.json();
        
        // Add assistant response
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        
        if (data.products && data.products.length > 0) {
            setSuggestedProducts(data.products);
        }
        
    } catch (e) {
        console.error("Erro ao enviar mensagem para o agente:", e);
        let errorMsg = "Desculpe, estou com dificuldades para conectar ao servidor no momento.";
        
        if (e instanceof Error) {
            console.error("Detalhes do erro:", e.message);
            // Se for erro de fetch/network
            if (e.message.includes("Failed to fetch") || e.message.includes("NetworkError")) {
                errorMsg += " (Erro de Conexão - Verifique se o backend está rodando)";
            }
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    }
  };

  const connect = () => {
    // Mock connection for UI state, since HTTP is stateless
    setIsConnected(true);
    console.log('Voice Agent "conectado" (Modo HTTP Serverless)');
  };

  const disconnect = () => {
    setIsConnected(false);
  };
  
  // Mock listening logic for now (since we don't have real STT in browser yet)
  const startListening = () => {
      setIsListening(true);
      // Simulate listening delay then stop
      setTimeout(() => {
          stopListening();
          // Mock input for testing
          // sendMessage("Estou procurando um PC Gamer barato");
      }, 3000);
  };

  const stopListening = () => {
      setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <VoiceContext.Provider value={{
      isListening,
      isSpeaking,
      isConnected,
      messages,
      suggestedProducts,
      startListening,
      stopListening,
      toggleListening,
      connect,
      disconnect,
      // Expose sendMessage for manual testing via console or UI
      // @ts-ignore
      sendMessage
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}
