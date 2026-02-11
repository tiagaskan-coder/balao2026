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

  // Configurações de voz
  const [voiceConfig, setVoiceConfig] = useState({ voice_model: 'br_001' });

  // Carregar configurações salvas
  useEffect(() => {
    const loadConfig = () => {
        const saved = localStorage.getItem("balao_ai_config");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setVoiceConfig(parsed);
            } catch (e) {
                console.error("Erro ao ler config de voz", e);
            }
        }
    };
    
    loadConfig();
    window.addEventListener("storage", loadConfig);
    return () => window.removeEventListener("storage", loadConfig);
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
        // Cancelar falas anteriores
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        
        // Tentar selecionar voz baseada na configuração
        const voices = window.speechSynthesis.getVoices();
        
        // Mapeamento simples: br_002/003/005 -> Masculina, br_001/004 -> Feminina
        const targetGender = ['br_002', 'br_003', 'br_005'].includes(voiceConfig.voice_model) ? 'male' : 'female';
        
        // Tentar encontrar uma voz que corresponda (heuristicas baseadas em nomes comuns)
        const selectedVoice = voices.find(v => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            if (!lang.includes('pt') && !lang.includes('br')) return false;
            
            if (targetGender === 'male') {
                return name.includes('felipe') || name.includes('daniel') || name.includes('male');
            } else {
                return name.includes('luciana') || name.includes('fernanda') || name.includes('female') || name.includes('google português');
            }
        });

        if (selectedVoice) {
            utterance.voice = selectedVoice;
            // Ajustar pitch para tentar masculinizar/feminilizar artificialmente se necessário
            if (targetGender === 'male' && !selectedVoice.name.toLowerCase().includes('male')) {
                utterance.pitch = 0.8; // Mais grave
            }
        } else {
             // Fallback genérico pt-BR
             const ptVoice = voices.find(v => v.lang.includes('pt') || v.lang.includes('BR'));
             if (ptVoice) utterance.voice = ptVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Erro no TTS:", e);
            setIsSpeaking(false);
        };
        
        window.speechSynthesis.speak(utterance);
    }
  };

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
        
        // Falar a resposta
        speakText(data.text);

        if (data.products && Array.isArray(data.products)) {
            setSuggestedProducts(data.products);
        }

    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        
        // Tentar novamente (Retry simples)
        if (text === "retry_flag") return; // Evitar loop infinito

        // Mensagem de erro amigável com código técnico discreto
        const errorMsg = "O servidor está acordando. Tente novamente em alguns segundos.";
        setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
        speakText(errorMsg);
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
