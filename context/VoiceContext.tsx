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
  const [voiceConfig, setVoiceConfig] = useState({ voice_model: 'br_001', speed: 1.35 });

  // Carregar configurações salvas
  useEffect(() => {
    const loadConfig = () => {
        const saved = localStorage.getItem("balao_ai_config");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Garantir velocidade se não existir
                if (!parsed.speed) parsed.speed = 1.35;
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
        utterance.rate = voiceConfig.speed || 1.35; // Velocidade rápida conforme solicitado
        
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

        utterance.onstart = () => {
            setIsSpeaking(true);
            // Pausar reconhecimento enquanto fala para não se ouvir
            if (recognitionRef.current) recognitionRef.current.stop();
        };
        
        utterance.onend = () => {
            setIsSpeaking(false);
            // Retomar reconhecimento automaticamente após falar (Modo Conversa Contínua)
            if (isConnected) {
                setTimeout(() => {
                    try {
                        recognitionRef.current?.start();
                    } catch(e) { /* ignorar se já estiver rodando */ }
                }, 100);
            }
        };

        utterance.onerror = (e) => {
            console.error("Erro no TTS:", e);
            setIsSpeaking(false);
            // Tentar retomar mesmo com erro
            if (isConnected) recognitionRef.current?.start();
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
        recognition.continuous = true; // Alterado para true para evitar cortes e manter fluxo de chamada
        recognition.interimResults = true; // Necessário para detecção de silêncio customizada
        recognition.lang = 'pt-BR';

        let silenceTimer: NodeJS.Timeout;

        recognition.onstart = () => {
          setIsListening(true);
          console.log("Reconhecimento de voz iniciado (Chamada Ativa)");
          
          if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
          }
        };

        recognition.onend = () => {
          // Só reinicia se a chamada estiver ativa
          if (isConnected) {
              console.log("Reiniciando microfone para manter chamada...");
              try {
                  recognition.start();
              } catch(e) { /* ignore */ }
          } else {
              setIsListening(false);
              console.log("Chamada encerrada, microfone desligado.");
          }
        };

        recognition.onresult = (event: any) => {
          // Se o robô estiver falando, ignorar entradas para não se ouvir (echo cancellation simples)
          if (window.speechSynthesis.speaking) return;

          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          // Lógica de Silêncio: Se houver resultado (interino ou final), resetar timer
          // Se passar 1.5s sem novos resultados e houver texto acumulado, enviar.
          clearTimeout(silenceTimer);
          
          if (finalTranscript || interimTranscript) {
              silenceTimer = setTimeout(() => {
                  if (finalTranscript) {
                      sendMessage(finalTranscript);
                  } else if (interimTranscript.trim().length > 2) {
                      // Se só tiver interino mas parou de falar por 1.5s, assume que terminou
                      sendMessage(interimTranscript);
                      // Forçar reinício para limpar buffer
                      recognition.stop(); 
                  }
              }, 1500); // 1.5 segundos de silêncio para considerar "fim da fala"
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Erro no reconhecimento de voz:", event.error);
          if (event.error === 'not-allowed') {
            alert("Permissão de microfone negada. Verifique suas configurações.");
            setIsConnected(false); // Encerrar chamada se não houver permissão
          }
        };

        recognitionRef.current = recognition;
      } else {
        console.warn("Web Speech API não suportada neste navegador.");
      }
    }
  }, [isConnected]); // Dependência isConnected para reiniciar corretamente se necessário

  // Tocar som de telefone chamando (Gerado via Web Audio API)
  const playDialTone = () => {
    return new Promise<void>((resolve) => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) { resolve(); return; }

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(425, ctx.currentTime);
            
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

            osc.start();
            
            setTimeout(() => {
                osc.stop();
                ctx.close();
                resolve();
            }, 2000);
        } catch (e) {
            console.error("Erro ao tocar som:", e);
            resolve();
        }
    });
  };

  const connect = async () => {
    setIsConnected(true);
    await playDialTone();
    // Saudação específica solicitada
    const greeting = "Olá, sou do balão da informática, como posso te ajudar?";
    setMessages(prev => [...prev, { role: 'assistant', content: greeting }]);
    speakText(greeting);
  };

  const disconnect = () => {
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    setMessages([]); // Limpar conversa ao encerrar? Opcional. Mantendo limpo para nova sessão.
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
        const response = await fetch('/api/chat', {
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
        
        // Mensagem de erro amigável
        const errorMsg = "Tive um problema de conexão. Poderia repetir?";
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
