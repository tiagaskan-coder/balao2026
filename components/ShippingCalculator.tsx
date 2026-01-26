"use client";

import { useState } from "react";
import { Search, Truck, MapPin } from "lucide-react";

export default function ShippingCalculator() {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    city: string;
    uf: string;
    options: { name: string; days: string; price?: string }[];
  } | null>(null);
  const [error, setError] = useState("");

  const formatCep = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  const handleCalculate = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setError("CEP inválido");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError("CEP não encontrado");
        setLoading(false);
        return;
      }

      const isCampinas = data.localidade === "Campinas" && data.uf === "SP";
      const isSP = data.uf === "SP";
      const isSoutheast = ["RJ", "MG", "ES", "PR", "SC", "RS"].includes(data.uf);

      let options = [];

      if (isCampinas) {
        options.push({
          name: "Entrega Flash",
          days: "24 horas (podendo ser entregue no mesmo dia)",
          price: "Grátis",
        });
      } else {
        // Simulação baseada em zonas (Origem: Campinas/SP 13070-000)
        if (isSP) {
            options.push(
                { name: "SEDEX", days: "1 a 2 dias úteis", price: "R$ 18,90" },
                { name: "PAC", days: "4 a 5 dias úteis", price: "R$ 12,50" }
            );
        } else if (isSoutheast) {
            options.push(
                { name: "SEDEX", days: "2 a 4 dias úteis", price: "R$ 28,90" },
                { name: "PAC", days: "6 a 8 dias úteis", price: "R$ 19,50" }
            );
        } else {
            options.push(
                { name: "SEDEX", days: "3 a 6 dias úteis", price: "R$ 45,90" },
                { name: "PAC", days: "8 a 15 dias úteis", price: "R$ 29,90" }
            );
        }
      }

      setResult({
        city: data.localidade,
        uf: data.uf,
        options,
      });
    } catch (err) {
      setError("Erro ao consultar CEP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
        <Truck className="w-5 h-5 text-blue-600" />
        <span>Calcular Frete e Prazo</span>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
            <input
            type="text"
            value={cep}
            onChange={(e) => setCep(formatCep(e.target.value))}
            placeholder="00000-000"
            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            maxLength={9}
            />
        </div>
        <button
          onClick={handleCalculate}
          disabled={loading || cep.length < 9}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "..." : "OK"}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

      {result && (
        <div className="mt-4 bg-gray-50 rounded-md p-3 text-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-1 text-gray-500 mb-2 text-xs">
            <MapPin className="w-3 h-3" />
            <span>Destino: {result.city}/{result.uf}</span>
          </div>
          
          <div className="space-y-2">
            {result.options.map((opt, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                <div>
                  <div className="font-semibold text-gray-800">{opt.name}</div>
                  <div className="text-gray-600 text-xs">Prazo: {opt.days}</div>
                </div>
                {opt.price && <div className="font-bold text-gray-700">{opt.price}</div>}
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-[10px] text-gray-400 text-center">
            * Prazos estimados a partir de Campinas/SP (13070-000)
          </div>
        </div>
      )}
      
      <div className="mt-2">
        <a 
            href="https://buscacepinter.correios.com.br/app/endereco/index.php" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
        >
            Não sei meu CEP
        </a>
      </div>
    </div>
  );
}
