'use client';

// Required Dependencies:
// npm install next react react-dom

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface AIContextType {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  messages: any[];
  foundProducts: any[];
  hasMicrophonePermission: boolean;
}

const AIContext = createContext<AIContextType | null>(null);

export function AIContextProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false); // Ref para manter estado atualizado nos callbacks (Critical for Mobile)

  const [messages, setMessages] = useState<any[]>([]);
  const [foundProducts, setFoundProducts] = useState<any[]>([]);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(true);
  
  const pathname = usePathname();
  const recognitionRef = useRef<any>(null); // Type any para evitar erro TS do SpeechRecognition
  const isSpeakingRef = useRef(false);
  const hasWelcomedRef = useRef(false);

  // Detect Android environment
  const isAndroid = () => {
    if (typeof window !== 'undefined') {
      return /Android/i.test(navigator.userAgent);
    }
    return false;
  };

  // Inicializa o reconhecimento de voz (Lazy load)
  const getRecognition = () => {
    if (recognitionRef.current) return recognitionRef.current;
    
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = true; 
        recognition.interimResults = false;
        
        recognition.onstart = () => {
             console.log('🎙️ Microfone iniciado');
             setIsListening(true);
             // Não setamos o Ref aqui, pois ele é setado no startListening para garantir intenção do usuário
        };
        
        recognition.onend = () => {
            console.log('Microfone desligou. Intenção de ouvir:', isListeningRef.current);
            
            // Reinício automático agressivo para Mobile
            // SOMENTE se não estiver falando (evita conflito com o restart do speak())
            if (isListeningRef.current && !isSpeakingRef.current) {
                console.log('🔄 Reiniciando microfone (loop)...');
                setTimeout(() => {
                    try {
                        recognition.start();
                    } catch (e) {
                        // Ignora erro se já estiver rodando
                    }
                }, 100);
            } else if (!isListeningRef.current) {
                setIsListening(false);
            }
        };

        recognition.onerror = (event: any) => {
          console.error('Erro no reconhecimento:', event.error);
          if (event.error === 'not-allowed') {
            setHasMicrophonePermission(false);
            isListeningRef.current = false;
            setIsListening(false);
            alert('⚠️ Precisamos do seu microfone para conversar! Verifique as permissões do navegador.');
          }
        };

        recognition.onresult = async (event: any) => {
          // Se o robô estiver falando, ignora input (Cancelamento de Eco via Software)
          if (isSpeakingRef.current) {
              console.log('Ignorando input enquanto robô fala');
              return;
          }

          const transcript = event.results[event.results.length - 1][0].transcript;
          if (!transcript.trim()) return;

          console.log('🗣️ Usuário:', transcript);
          
          // Processa resposta
          await processUserMessage(transcript);
        };

        recognitionRef.current = recognition;
        return recognition;
      }
    }
    return null;
  };

  const processUserMessage = async (message: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      if (data.produtos && data.produtos.length > 0) {
        setFoundProducts(data.produtos);
      }

      if (data.fala) {
        speak(data.fala);
      }

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      speak("Tive um problema de conexão, mas estou te ouvindo.");
    }
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    
    // Set speaking flag immediately to block onend restart and onresult
    isSpeakingRef.current = true;

    // Stop recognition to prevent echo (Critical for Android)
    if (recognitionRef.current && isListeningRef.current) {
        try {
            recognitionRef.current.stop();
            console.log('🔇 Pausando microfone para falar (Echo Cancellation)');
        } catch (e) {
            // Ignore error
        }
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    
    utterance.onstart = () => { 
        isSpeakingRef.current = true; 
    };
    
    utterance.onend = () => { 
        isSpeakingRef.current = false; 
        
        // Resume recognition if user intention is to listen
        if (isListeningRef.current) {
            console.log('🔊 Retomando microfone após falar');
            setTimeout(() => {
                const recognition = getRecognition();
                try {
                    recognition?.start();
                } catch (e) {
                    console.log('Microfone já ativo ou erro ao reiniciar');
                }
            }, 100);
        }
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    isListeningRef.current = true; // Define intenção do usuário
    const recognition = getRecognition();
    
    // Welcome message logic
    if (!hasWelcomedRef.current) {
        hasWelcomedRef.current = true;
        try {
          const raw = localStorage.getItem("balao_assistant_config");
          const cfg = raw ? JSON.parse(raw) : null;
          const greeting = (cfg && typeof cfg.greeting === "string" && cfg.greeting.trim())
            ? cfg.greeting
            : "Olá! Sou o assistente do Balão da Informática. Como posso te ajudar hoje?";
          speak(greeting);
        } catch {
          speak("Olá! Sou o assistente do Balão da Informática. Como posso te ajudar hoje?");
        }
        // Note: speak() will handle the recognition start/stop flow
        return;
    }

    if (recognition) {
        try {
            recognition.start();
        } catch (e) {
            console.log('Microfone já ativo');
        }
    }
  };

  const stopListening = () => {
    isListeningRef.current = false; // Define intenção do usuário
    setIsListening(false);
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    window.speechSynthesis.cancel();
  };

  // Efeito para persistência entre páginas
  useEffect(() => {
    // Apenas log, o estado é preservado pelo Context ser top-level no Layout
    console.log('Navegou para:', pathname);
  }, [pathname]);

  return (
    <AIContext.Provider value={{ 
        isListening, 
        startListening, 
        stopListening, 
        messages, 
        foundProducts,
        hasMicrophonePermission 
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI deve ser usado dentro de um AIContextProvider');
  }
  return context;
}
