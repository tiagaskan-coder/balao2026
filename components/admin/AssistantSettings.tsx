"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

type Config = {
  greeting: string;
  voiceEnabled: boolean;
  maxResults: number;
};

export default function AssistantSettings() {
  const [config, setConfig] = useState<Config>({
    greeting: "Olá! Sou o assistente do Balão da Informática. Como posso te ajudar hoje?",
    voiceEnabled: true,
    maxResults: 5,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("balao_assistant_config");
      if (raw) {
        const parsed = JSON.parse(raw);
        setConfig({
          greeting: parsed.greeting ?? config.greeting,
          voiceEnabled: typeof parsed.voiceEnabled === "boolean" ? parsed.voiceEnabled : config.voiceEnabled,
          maxResults: Number(parsed.maxResults) || config.maxResults,
        });
      }
    } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem("balao_assistant_config", JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Configurações do Assistente</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Saudação Inicial (pt-BR)
          </label>
          <input
            type="text"
            value={config.greeting}
            onChange={(e) => setConfig((c) => ({ ...c, greeting: e.target.value }))}
            className="w-full p-2 border rounded-md"
            placeholder="Ex: Olá! Posso ajudar a encontrar um notebook?"
          />
          <p className="text-xs text-gray-500 mt-1">
            Frase falada ao iniciar o assistente. Mantenha tom humano e acolhedor.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
            Resultados Máximos
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={config.maxResults}
            onChange={(e) => setConfig((c) => ({ ...c, maxResults: Number(e.target.value) }))}
            className="w-full p-2 border rounded-md"
          />
          <p className="text-xs text-gray-500 mt-1">
            Quantos produtos sugerir por resposta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="voiceEnabled"
            type="checkbox"
            checked={config.voiceEnabled}
            onChange={(e) => setConfig((c) => ({ ...c, voiceEnabled: e.target.checked }))}
            className="w-4 h-4 text-[#E60012] rounded border-gray-300 focus:ring-[#E60012]"
          />
          <label htmlFor="voiceEnabled" className="text-sm text-gray-700">
            Ativar fala (síntese de voz)
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-[#E60012] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save size={18} />
          Salvar Configurações
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          Configurações salvas com sucesso!
        </div>
      )}
    </div>
  );
}
