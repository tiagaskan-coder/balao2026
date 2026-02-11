"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  sendMessage: (text: string) => Promise<void>;
};

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Assume conectado via HTTP (stateless)
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);

  // Verificação de saúde do backend (opcional, mas bom para UX)
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/py');
        if (res.ok) {
            setIsConnected(true);
            console.log("Backend Python online");
        } else {
            console.warn("Backend Python check failed:", res.status);
            // Não marcamos como desconectado imediatamente para não bloquear a UI, 
            // mas logamos o erro. Serverless acorda sob demanda.
        }
      } catch (e) {
        console.warn("Backend Python unreachable:", e);
      }
    };
    checkHealth();
  }, []);

  const connect = () => {
    setIsConnected(true);
  };

  const disconnect = () => {
    setIsConnected(false);
  };

  const startListening = () => {
    setIsListening(true);
    // Aqui entraria a lógica de Web Speech API no futuro
    // Por enquanto, simulamos ou usamos input de texto
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Adiciona mensagem do usuário
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
        // Envia para o backend Serverless
        const response = await fetch('/api/py/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text }),
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        
        // Adiciona resposta do assistente
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        
        if (data.products && Array.isArray(data.products)) {
            setSuggestedProducts(data.products);
        }

    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "Desculpe, estou com dificuldades para conectar ao servidor no momento. Tente novamente em instantes." 
        }]);
    }
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
