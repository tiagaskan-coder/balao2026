"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Product } from "@/lib/utils";
import Image from "next/image";
import { Check, AlertCircle, Cpu, CircuitBoard, MemoryStick, Box, Zap, HardDrive, Monitor, Trash2, ShoppingCart, RefreshCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";

// --- Tipos e Interfaces ---

interface PCSpecs {
  socket_type?: string;
  tdp_wattage?: number;
  ram_type?: string; // DDR4, DDR5
  form_factor?: string; // ATX, Micro-ATX, ITX
  supported_form_factors?: string[];
  wattage?: number;
  slots_ram?: number;
  max_memory?: number;
}

// Extensão do produto para incluir specs (já adicionado ao utils.ts, mas reforçando tipagem local)
interface TechProduct extends Product {
  specs?: PCSpecs;
}

// Configuração do PC (Estado)
interface PCConfig {
  cpu: TechProduct | null;
  motherboard: TechProduct | null;
  ram: TechProduct | null;
  gpu: TechProduct | null;
  storage: TechProduct | null;
  psu: TechProduct | null;
  case: TechProduct | null;
}

// Passos do processo
const STEPS = [
  { id: "cpu", label: "Processador", icon: Cpu, category: "Processadores" },
  { id: "motherboard", label: "Placa-mãe", icon: CircuitBoard, category: "Placas-mãe" },
  { id: "ram", label: "Memória RAM", icon: MemoryStick, category: "Memória RAM" },
  { id: "gpu", label: "Placa de Vídeo", icon: Monitor, category: "Placas de Vídeo" },
  { id: "storage", label: "Armazenamento", icon: HardDrive, category: "Armazenamento" },
  { id: "psu", label: "Fonte", icon: Zap, category: "Fontes" },
  { id: "case", label: "Gabinete", icon: Box, category: "Gabinetes" },
];

// --- Dados Mockados para Demonstração (Caso o DB esteja vazio de specs) ---
// Em produção, isso viria do banco de dados com o campo 'specs' preenchido.
const MOCK_SPECS: Record<string, PCSpecs> = {
  "cpu-amd": { socket_type: "AM4", tdp_wattage: 65 },
  "cpu-intel": { socket_type: "LGA1700", tdp_wattage: 125 },
  "mobo-am4": { socket_type: "AM4", ram_type: "DDR4", form_factor: "Micro-ATX" },
  "mobo-lga1700": { socket_type: "LGA1700", ram_type: "DDR5", form_factor: "ATX" },
  "ram-ddr4": { ram_type: "DDR4" },
  "ram-ddr5": { ram_type: "DDR5" },
  "gpu-mid": { tdp_wattage: 200 },
  "gpu-high": { tdp_wattage: 350 },
  "psu-500w": { wattage: 500 },
  "psu-750w": { wattage: 750 },
  "case-mid": { supported_form_factors: ["ATX", "Micro-ATX", "ITX"] },
  "case-mini": { supported_form_factors: ["ITX", "Micro-ATX"] },
};

export default function MonteSeuPC() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [config, setConfig] = useState<PCConfig>({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    psu: null,
    case: null,
  });
  const [products, setProducts] = useState<TechProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Carregar produtos (simulado com merge de specs para demo)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          // Enriquecer produtos com specs mockadas se não tiverem (apenas para demo funcionar imediatamente)
          const enriched = data.map((p: Product) => {
            // Lógica simples de "seed" de specs baseado no nome/categoria para demonstração
            let mockSpec = {};
            const name = p.name.toLowerCase();
            const cat = p.category.toLowerCase();

            if (cat.includes("processador") || cat.includes("cpu")) {
                if (name.includes("ryzen")) mockSpec = MOCK_SPECS["cpu-amd"];
                else if (name.includes("core") || name.includes("intel")) mockSpec = MOCK_SPECS["cpu-intel"];
            } else if (cat.includes("placa-mãe") || cat.includes("motherboard")) {
                if (name.includes("am4") || name.includes("b550") || name.includes("a520")) mockSpec = MOCK_SPECS["mobo-am4"];
                else if (name.includes("z790") || name.includes("lga1700")) mockSpec = MOCK_SPECS["mobo-lga1700"];
            } else if (cat.includes("memória") || cat.includes("ram")) {
                if (name.includes("ddr5")) mockSpec = MOCK_SPECS["ram-ddr5"];
                else mockSpec = MOCK_SPECS["ram-ddr4"];
            } else if (cat.includes("vídeo") || cat.includes("gpu") || cat.includes("rtx") || cat.includes("rx")) {
                if (name.includes("4090") || name.includes("4080")) mockSpec = MOCK_SPECS["gpu-high"];
                else mockSpec = MOCK_SPECS["gpu-mid"];
            } else if (cat.includes("fonte")) {
                if (name.includes("750") || name.includes("850")) mockSpec = MOCK_SPECS["psu-750w"];
                else mockSpec = MOCK_SPECS["psu-500w"];
            } else if (cat.includes("gabinete")) {
                if (name.includes("mid") || name.includes("tower")) mockSpec = MOCK_SPECS["case-mid"];
                else mockSpec = MOCK_SPECS["case-mini"];
            }

            return {
              ...p,
              specs: p.specs || mockSpec // Usa do DB se existir, senão usa mock
            };
          });
          setProducts(enriched);
        }
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const currentStep = STEPS[currentStepIndex];

  // --- Lógica de Compatibilidade ---
  const filteredProducts = useMemo(() => {
    let base = products.filter((p: TechProduct) => {
        // Filtro básico por categoria (aproximado)
        const cat = p.category.toLowerCase();
        const stepCat = currentStep.category.toLowerCase();
        // Mapeamento simples de categorias do sistema para passos
        if (currentStep.id === 'cpu') return cat.includes('processador') || cat.includes('cpu');
        if (currentStep.id === 'motherboard') return cat.includes('placa-mãe') || cat.includes('motherboard');
        if (currentStep.id === 'ram') return cat.includes('memória') || cat.includes('ram');
        if (currentStep.id === 'gpu') return cat.includes('vídeo') || cat.includes('placa de vídeo');
        if (currentStep.id === 'storage') return cat.includes('ssd') || cat.includes('hd') || cat.includes('disco');
        if (currentStep.id === 'psu') return cat.includes('fonte');
        if (currentStep.id === 'case') return cat.includes('gabinete');
        return false;
    });

    // 1. Filtro de Soquete (CPU <-> Mobo)
    if (currentStep.id === 'motherboard' && config.cpu?.specs?.socket_type) {
      base = base.filter((p: TechProduct) => p.specs?.socket_type === config.cpu?.specs?.socket_type);
    }
    // Se trocou a ordem e escolheu mobo primeiro (não implementado neste fluxo linear, mas boa prática)

    // 2. Filtro de Memória (Mobo <-> RAM)
    if (currentStep.id === 'ram' && config.motherboard?.specs?.ram_type) {
      base = base.filter((p: TechProduct) => p.specs?.ram_type === config.motherboard?.specs?.ram_type);
    }

    // 3. Filtro de Fonte (TDP Total <-> PSU Wattage)
    if (currentStep.id === 'psu') {
      const cpuTdp = config.cpu?.specs?.tdp_wattage || 65; // fallback 65W
      const gpuTdp = config.gpu?.specs?.tdp_wattage || 0;
      const totalTdp = cpuTdp + gpuTdp;
      const recommended = totalTdp * 1.2; // +20% margem
      
      base = base.filter((p: TechProduct) => (p.specs?.wattage || 0) >= recommended);
    }

    // 4. Filtro de Gabinete (Mobo Form Factor <-> Case Support)
    if (currentStep.id === 'case' && config.motherboard?.specs?.form_factor) {
      base = base.filter((p: TechProduct) => 
        p.specs?.supported_form_factors?.includes(config.motherboard!.specs!.form_factor!)
      );
    }

    return base;
  }, [products, currentStep, config]);

  const handleSelect = (product: TechProduct) => {
    setConfig((prev: PCConfig) => ({ ...prev, [currentStep.id]: product }));
    // Avançar automaticamente após breve delay, exceto no último passo
    if (currentStepIndex < STEPS.length - 1) {
        setTimeout(() => setCurrentStepIndex((prev: number) => prev + 1), 300);
    }
  };

  const handleRemove = (stepId: keyof PCConfig) => {
    setConfig((prev: PCConfig) => ({ ...prev, [stepId]: null }));
    // Voltar para o passo removido para re-selecionar
    const stepIdx = STEPS.findIndex(s => s.id === stepId);
    if (stepIdx !== -1) setCurrentStepIndex(stepIdx);
  };

  const totalPrice = (Object.values(config) as (TechProduct | null)[]).reduce((acc, item) => {
    if (!item) return acc;
    const price = parseFloat(item.price.replace("R$", "").replace(".", "").replace(",", ".").trim());
    return acc + (isNaN(price) ? 0 : price);
  }, 0);

  const totalTDP = (config.cpu?.specs?.tdp_wattage || 0) + (config.gpu?.specs?.tdp_wattage || 0);

  const handleAddToCart = () => {
    Object.values(config).forEach(item => {
        if (item) addToCart(item);
    });
    alert("Todos os componentes foram adicionados ao carrinho!");
  };

  const isComplete = Object.values(config).every(v => v !== null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar de Progresso & Resumo */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <RefreshCcw className="text-[#E60012]" />
              Sua Configuração
            </h2>
            
            <div className="space-y-4 mb-6">
              {STEPS.map((step, index) => {
                const selected = config[step.id as keyof PCConfig];
                const isActive = index === currentStepIndex;
                const isDone = !!selected;

                return (
                  <div 
                    key={step.id}
                    className={`
                      relative p-3 rounded-lg border transition-all cursor-pointer
                      ${isActive ? "border-[#E60012] bg-red-50 ring-1 ring-[#E60012]" : "border-gray-200 hover:border-gray-300"}
                      ${isDone ? "bg-gray-50" : ""}
                    `}
                    onClick={() => setCurrentStepIndex(index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${isActive || isDone ? "bg-[#E60012] text-white" : "bg-gray-100 text-gray-400"}`}>
                        <step.icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm font-medium ${isActive ? "text-[#E60012]" : "text-gray-700"}`}>
                                {step.label}
                            </span>
                            {isDone && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemove(step.id as keyof PCConfig); }}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        {selected ? (
                            <div className="text-sm text-gray-600 truncate">{selected.name}</div>
                        ) : (
                            <div className="text-xs text-gray-400 italic">Pendente...</div>
                        )}
                        {selected && (
                            <div className="text-xs font-bold text-[#E60012] mt-1">{selected.price}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Consumo Estimado (TDP):</span>
                <span className="font-medium">{totalTDP > 0 ? `${totalTDP}W` : "-"}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-[#E60012]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}
                </span>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={!isComplete}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors
                    ${isComplete 
                        ? "bg-[#E60012] text-white hover:bg-[#cc0010]" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"}
                `}
              >
                <ShoppingCart size={20} />
                Adicionar ao Carrinho
              </button>
              
              {!isComplete && (
                  <div className="text-xs text-center text-gray-500">
                      Complete todas as etapas para finalizar.
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Área de Seleção de Produtos */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[600px]">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    Escolha seu {currentStep.label}
                </h1>
                <p className="text-gray-500">
                    Mostrando produtos compatíveis com sua configuração atual.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E60012]"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhum produto compatível encontrado</h3>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        Tente alterar as peças selecionadas anteriormente para encontrar mais opções compatíveis.
                    </p>
                    <button 
                        onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                        className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                        Voltar para etapa anterior
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts.map(product => (
                        <div 
                            key={product.id}
                            className={`
                                group relative border rounded-xl p-4 transition-all hover:shadow-md cursor-pointer
                                ${config[currentStep.id as keyof PCConfig]?.id === product.id ? "border-[#E60012] bg-red-50" : "border-gray-200 bg-white"}
                            `}
                            onClick={() => handleSelect(product)}
                        >
                            <div className="flex gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden">
                                    <Image 
                                        src={product.image} 
                                        alt={product.name}
                                        fill
                                        className="object-contain p-2"
                                        unoptimized
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-[#E60012] transition-colors">
                                        {product.name}
                                    </h3>
                                    
                                    {/* Exibir Specs Relevantes */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {product.specs?.socket_type && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                                                {product.specs.socket_type}
                                            </span>
                                        )}
                                        {product.specs?.ram_type && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded">
                                                {product.specs.ram_type}
                                            </span>
                                        )}
                                        {product.specs?.tdp_wattage && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-xs text-gray-600 rounded flex items-center gap-1">
                                                <Zap size={10} /> {product.specs.tdp_wattage}W
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <span className="text-lg font-bold text-[#E60012]">
                                            {product.price}
                                        </span>
                                        <button className="p-2 bg-[#E60012] text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Check size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
