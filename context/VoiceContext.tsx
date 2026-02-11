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
  
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Conectar ao backend local (FastAPI)
    // Em produção, isso deve ser parametrizável via ENV
    const wsUrl = 'ws://localhost:8000/ws/chat';
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Voice Agent conectado');
        setIsConnected(true);
      };

      ws.onclose = () => {
        console.log('Voice Agent desconectado');
        setIsConnected(false);
        setIsListening(false);
      };

      ws.onerror = (error) => {
        console.error('Erro no WebSocket do Voice Agent:', error);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'text_response_chunk') {
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.role === 'assistant') {
                    // Append to last message
                    return [
                        ...prev.slice(0, -1),
                        { ...lastMsg, content: lastMsg.content + data.content }
                    ];
                } else {
                    // New message
                    return [...prev, { role: 'assistant', content: data.content }];
                }
            });
          }
          
          if (data.type === 'products') {
            setSuggestedProducts(data.data);
          }
          
          // Lógica futura para chunks de áudio (TTS)
        } catch (e) {
          console.error('Erro ao processar mensagem do WebSocket', e);
        }
      };
    } catch (e) {
      console.error('Falha ao conectar WebSocket', e);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const startListening = () => {
    // TODO: Implementar captura de áudio do microfone e streaming via WS
    setIsListening(true);
    
    // Simulação temporária para testes sem microfone real
    // Envia uma mensagem de texto de teste após 2 segundos
    /*
    setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'text_input',
                content: 'Gostaria de ver notebooks gamer'
            }));
            setMessages(prev => [...prev, { role: 'user', content: 'Gostaria de ver notebooks gamer' }]);
        }
        setIsListening(false);
    }, 2000);
    */
  };

  const stopListening = () => {
    setIsListening(false);
    // TODO: Parar stream de áudio
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Auto-connect on mount (optional, maybe wait for user interaction)
  useEffect(() => {
    // connect();
    return () => {
      disconnect();
    };
  }, []);

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
      disconnect
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
