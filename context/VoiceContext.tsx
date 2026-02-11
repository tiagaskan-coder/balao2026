"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Product } from '@/lib/utils';

// Declaração de tipos para Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  const [isConnected, setIsConnected] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  
  // Referência para o reconhecimento de fala
  const recognitionRef = useRef<any>(null);

  // Verificação de saúde do backend
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/py');
        if (res.ok) {
            setIsConnected(true);
            console.log("Backend Python online");
        } else {
            console.warn("Backend Python check failed:", res.status);
        }
      } catch (e) {
        console.warn("Backend Python unreachable:", e);
      }
    };
    checkHealth();
  }, []);

  // Inicializar SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Para ao terminar de falar
        recognition.interimResults = false;
        recognition.lang = 'pt-BR';

        recognition.onstart = () => {
          setIsListening(true);
          console.log("Reconhecimento de voz iniciado");
        };

        recognition.onend = () => {
          setIsListening(false);
          console.log("Reconhecimento de voz finalizado");
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("Transcrição detectada:", transcript);
          if (transcript) {
            sendMessage(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Erro no reconhecimento de voz:", event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            alert("Permissão de microfone negada.");
          }
        };

        recognitionRef.current = recognition;
      } else {
        console.warn("Web Speech API não suportada neste navegador.");
      }
    }
  }, []);

  const connect = () => {
    setIsConnected(true);
  };

  const disconnect = () => {
    setIsConnected(false);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Erro ao iniciar reconhecimento:", e);
      }
    } else {
      alert("Seu navegador não suporta reconhecimento de voz. Tente usar o Chrome.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
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
        
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        
        // Falar a resposta (TTS do navegador como fallback zero-cost)
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(data.text);
            utterance.lang = 'pt-BR';
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }

        if (data.products && Array.isArray(data.products)) {
            setSuggestedProducts(data.products);
        }

    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        const errorMsg = "Desculpe, estou com dificuldades para conectar ao servidor no momento. Tente novamente em instantes.";
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(errorMsg);
            utterance.lang = 'pt-BR';
            window.speechSynthesis.speak(utterance);
        }
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
