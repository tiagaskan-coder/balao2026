"use client";

import { useState, useEffect } from "react";
import { Mic, Save, Volume2, Play, AlertCircle, CheckCircle } from "lucide-react";

interface VoiceConfig {
  system_prompt: string;
  temperature: number;
  model_name: string;
  voice_id: string;
}

const VOICES = [
  { id: "alloy", name: "Alloy (Neutro/Balanceado)", gender: "Neutro" },
  { id: "echo", name: "Echo (Masculino/Suave)", gender: "Masculino" },
  { id: "fable", name: "Fable (Inglês Britânico/Narrativa)", gender: "Masculino" },
  { id: "onyx", name: "Onyx (Masculino/Profundo)", gender: "Masculino" },
  { id: "nova", name: "Nova (Feminino/Energético)", gender: "Feminino" },
  { id: "shimmer", name: "Shimmer (Feminino/Claro)", gender: "Feminino" },
];

export default function VoiceAgentManager() {
  const [config, setConfig] = useState<VoiceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");

  const API_URL = "http://localhost:8000";

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/config`);
      if (!res.ok) throw new Error("Falha ao carregar configuração");
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      setError("Erro ao conectar com o servidor do agente (Voice Agent Server na porta 8000).");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      setSuccess("Configurações salvas com sucesso!");
    } catch (err) {
      setError("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    try {
      const res = await fetch(`${API_URL}/test-connection`);
      const data = await res.json();
      if (data.openai === "ok" && data.supabase === "ok") {
        setTestStatus("ok");
      } else {
        setTestStatus("error");
        setError(`Erro de conexão: OpenAI=${data.openai}, Supabase=${data.supabase}`);
      }
    } catch (e) {
      setTestStatus("error");
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando configurações do agente...</div>;
  if (!config) return <div className="p-8 text-center text-red-500">Não foi possível carregar as configurações. Verifique se o server.py está rodando.</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Mic className="w-6 h-6 text-red-600" />
            Configuração do Agente de Voz
          </h2>
          <p className="text-gray-500 text-sm mt-1">Personalize o comportamento e a voz do vendedor virtual.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar Alterações</>}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-gray-400" />
            Voz e Personalidade
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voz do Agente</label>
              <select
                value={config.voice_id}
                onChange={(e) => setConfig({ ...config, voice_id: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              >
                {VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Selecione a voz que melhor se adapta à marca.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo LLM</label>
              <select
                value={config.model_name}
                onChange={(e) => setConfig({ ...config, model_name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="gpt-4o-mini">GPT-4o Mini (Mais Rápido/Barato)</option>
                <option value="gpt-4o">GPT-4o (Mais Inteligente/Caro)</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legado)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Criatividade (Temperatura): {config.temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full accent-red-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Preciso (0.0)</span>
                <span>Criativo (1.0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Status do Sistema
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Conexão com Backend</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Online</span>
             </div>
             <button
               onClick={handleTestConnection}
               className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2"
             >
               {testStatus === 'testing' ? "Testando..." : "Testar Conexões Externas (OpenAI/Supabase)"}
             </button>
             {testStatus === 'ok' && (
                <div className="text-center text-green-600 text-sm font-medium">Todas as conexões operacionais!</div>
             )}
              {testStatus === 'error' && (
                <div className="text-center text-red-600 text-sm font-medium">Erro nas conexões externas.</div>
             )}
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4">Prompt do Sistema</h3>
          <p className="text-sm text-gray-500 mb-2">Defina como o agente deve se comportar, o tom de voz e as regras de negócio.</p>
          <textarea
            value={config.system_prompt}
            onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
