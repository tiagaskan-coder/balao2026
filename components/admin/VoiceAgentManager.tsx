import React, { useState, useEffect } from 'react';
import { Save, Server, Activity, Mic, MessageSquare, Play, Terminal, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function VoiceAgentManager() {
  const [config, setConfig] = useState({
    ollama_endpoint: "http://localhost:11434",
    model_name: "qwen2.5:1.5b",
    voice_id: "br_001",
    system_prompt: "",
    temperature: 0.7
  });
  
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch initial config
  useEffect(() => {
    fetch('http://localhost:8000/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error("Failed to load config", err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('http://localhost:8000/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      alert("Configuração salva com sucesso!");
    } catch (e) {
      alert("Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/test-connection');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      setStatus({ error: "Falha ao conectar com servidor Python (localhost:8000)" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!testMessage.trim()) return;
    
    const newMsg = { role: 'user', content: testMessage };
    setChatHistory(prev => [...prev, newMsg]);
    setTestMessage("");
    
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMsg.content })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response, products: data.products }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'error', content: "Erro ao comunicar com o agente." }]);
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Mic className="text-blue-600" />
                Configuração do Agente de Voz (Local AI)
            </h2>
            <p className="text-gray-500 text-sm mb-6">
                Gerencie o comportamento do seu vendedor IA rodando 100% localmente.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Config Form */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Terminal size={18} /> Parâmetros do Modelo
                    </h3>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Endpoint Ollama</label>
                        <input 
                            type="text" 
                            value={config.ollama_endpoint}
                            onChange={e => setConfig({...config, ollama_endpoint: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Modelo LLM</label>
                        <input 
                            type="text" 
                            value={config.model_name}
                            onChange={e => setConfig({...config, model_name: e.target.value})}
                            placeholder="ex: qwen2.5:1.5b"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Voz (Kokoro)</label>
                        <select 
                            value={config.voice_id}
                            onChange={e => setConfig({...config, voice_id: e.target.value})}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        >
                            <option value="br_001">BR 001 (Masculina Padrão)</option>
                            <option value="br_002">BR 002 (Feminina Padrão)</option>
                            <option value="br_003">BR 003 (Variante 1)</option>
                            <option value="br_004">BR 004 (Variante 2)</option>
                            <option value="br_005">BR 005 (Variante 3)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prompt do Sistema</label>
                        <textarea 
                            value={config.system_prompt}
                            onChange={e => setConfig({...config, system_prompt: e.target.value})}
                            rows={6}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? "Salvando..." : "Salvar Configurações"}
                    </button>
                </div>

                {/* Status & Testing */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-md border">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                            <Activity size={18} /> Status do Sistema
                        </h3>
                        <button 
                            onClick={handleTestConnection}
                            disabled={loading}
                            className="mb-4 text-sm bg-white border border-gray-300 px-3 py-1 rounded shadow-sm hover:bg-gray-100"
                        >
                            {loading ? "Verificando..." : "Testar Conexão"}
                        </button>
                        
                        {status && (
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span>Supabase:</span>
                                    <span className={status.supabase === "ok" ? "text-green-600 font-bold" : "text-red-600"}>{status.supabase}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Ollama:</span>
                                    <span className={status.ollama?.includes("ok") ? "text-green-600 font-bold" : "text-red-600"}>{status.ollama}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Whisper (STT):</span>
                                    <span className={status.whisper === "ready" ? "text-green-600 font-bold" : "text-red-600"}>{status.whisper}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Kokoro (TTS):</span>
                                    <span className={status.kokoro === "ready" ? "text-green-600 font-bold" : "text-red-600"}>{status.kokoro}</span>
                                </div>
                                {status.error && <p className="text-red-500 mt-2">{status.error}</p>}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md border flex flex-col h-[400px]">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                            <MessageSquare size={18} /> Chat de Teste (Texto)
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto bg-white border rounded p-3 mb-3 space-y-3">
                            {chatHistory.length === 0 && <p className="text-gray-400 text-center text-sm mt-4">Envie uma mensagem para testar...</p>}
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-900' : msg.role === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                        <p>{msg.content}</p>
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs font-bold text-gray-500 mb-1">Produtos Identificados:</p>
                                                <ul className="list-disc pl-4 text-xs">
                                                    {msg.products.map((p: any, i: number) => (
                                                        <li key={i}>{p.name} - R$ {p.price}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={testMessage}
                                onChange={e => setTestMessage(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Digite algo..."
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                            <button 
                                onClick={handleSendMessage}
                                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                            >
                                <Play size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
