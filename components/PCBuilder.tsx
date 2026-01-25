"use client";

import React, { useState, useMemo } from "react";
import { Product, Category } from "@/lib/utils";
import { Check, AlertCircle, Cpu, CircuitBoard, MemoryStick, Box, Zap, HardDrive, Monitor, Trash2, ShoppingCart, RefreshCcw, Wrench, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

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

// Extensão do produto para incluir specs
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

interface Step {
  id: string;
  label: string;
  icon: any;
  categoryKeywords: string[];
  targetSlugs?: string[];
}

// Passos do processo (Mapeados para slugs/keywords das subcategorias de Hardware)
const STEPS: Step[] = [
  { 
      id: "cpu", 
      label: "Processador", 
      icon: Cpu, 
      categoryKeywords: ["processador", "cpu"],
      targetSlugs: ["processadores", "processadores-cpu"] 
  },
  { 
      id: "motherboard", 
      label: "Placa-mãe", 
      icon: CircuitBoard, 
      categoryKeywords: ["placa-mãe", "placa mãe", "motherboard", "placas-mãe", "placas-mae"],
      targetSlugs: ["placas-mae", "placas-mãe"] 
  },
  { 
      id: "ram", 
      label: "Memória RAM", 
      icon: MemoryStick, 
      categoryKeywords: ["memória ram", "memoria ram", "ram"],
      targetSlugs: ["memoria-ram"] 
  },
  { 
      id: "gpu", 
      label: "Placa de Vídeo", 
      icon: Monitor, 
      categoryKeywords: ["placa de vídeo", "placa de video", "gpu", "rtx", "rx", "gtx"],
      targetSlugs: ["placas-de-video", "placas-de-video-gpu"] 
  },
  { 
      id: "storage", 
      label: "Armazenamento", 
      icon: HardDrive, 
      categoryKeywords: ["ssd", "hd", "disco", "armazenamento", "nvme"],
      targetSlugs: ["ssd-hd-nvme", "ssd", "hd"] 
  },
  { 
      id: "psu", 
      label: "Fonte", 
      icon: Zap, 
      categoryKeywords: ["fonte", "alimentação", "psu"],
      targetSlugs: ["fontes-alimentacao", "fontes-de-alimentacao"] 
  },
  { 
      id: "case", 
      label: "Gabinete", 
      icon: Box, 
      categoryKeywords: ["gabinete", "case", "torre"],
      targetSlugs: ["gabinetes"] 
  },
];

// --- Dados Mockados para Demonstração (Caso o DB esteja vazio de specs) ---
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

interface PCBuilderProps {
  products: Product[];
  categories: Category[];
}

export default function PCBuilder({ products: initialProducts, categories }: PCBuilderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [config, setConfig] = useState<PCConfig>({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    psu: null,
    case: null,
  });
  const { addToCart } = useCart();

  // Função auxiliar para normalizar texto (remove acentos, pontuação e espaços)
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]/g, ""); // Remove tudo que não for letra ou número (incluindo espaços e pontuação)
  };

  // Enriquecer produtos com specs mockadas se não tiverem (apenas para demo funcionar imediatamente)
  const products = useMemo(() => {
    return initialProducts.map((p: Product) => {
        // Lógica simples de "seed" de specs baseado no nome/categoria para demonstração
        let mockSpec = {};
        const name = p.name.toLowerCase();
        const cat = p.category.toLowerCase();

        if (cat.includes("processador") || cat.includes("cpu")) {
            if (name.includes("ryzen")) mockSpec = MOCK_SPECS["cpu-amd"];
            else if (name.includes("core") || name.includes("intel")) mockSpec = MOCK_SPECS["cpu-intel"];
        } else if (cat.includes("placa-mãe") || cat.includes("motherboard") || cat.includes("placas-mãe")) {
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
        } as TechProduct;
      });
  }, [initialProducts]);

  const currentStep = STEPS[currentStepIndex];

  // Resetar busca ao mudar de passo
  React.useEffect(() => {
    setSearchTerm("");
  }, [currentStepIndex]);

  // --- Lógica de Compatibilidade ---
  const filteredProducts = useMemo(() => {
    // 1. Identificar IDs/Nomes das subcategorias relevantes para o passo atual
    // A. Encontrar categoria "Hardware"
    const hardwareCat = categories.find(c => c.slug === 'hardware' || c.name.toLowerCase() === 'hardware');
    
    // B. Encontrar subcategorias alvo do passo atual
    let targetCategoryNames: string[] = [];
    if (hardwareCat) {
        // Se temos a árvore de categorias (depende se getCategories retorna flat ou tree)
        // Assumindo flat list, procuramos pelo parent_id
        const subCategories = categories.filter(c => c.parent_id === hardwareCat.id);
        
        // Filtrar as subcategorias que batem com os slugs alvo do passo
        const matches = subCategories.filter(sub => 
            currentStep.targetSlugs?.some(slug => sub.slug === slug)
        );
        targetCategoryNames = matches.map(m => m.name.toLowerCase());
    }

    let base = products.filter((p: TechProduct) => {
        const normalizedProductCat = normalizeText(p.category);
        
        // Critério 1: Match exato com subcategorias de Hardware (Prioridade)
        // Se o nome da categoria do produto estiver na lista de subcategorias alvo
        const isHardwareSubmatch = targetCategoryNames.some(targetName => 
            normalizedProductCat.includes(normalizeText(targetName))
        );

        if (isHardwareSubmatch) {
             // Filtro de busca textual
            if (searchTerm) {
                return normalizeText(p.name).includes(normalizeText(searchTerm));
            }
            return true;
        }

        // Critério 2: Fallback para keywords (comportamento original melhorado)
        // Só usa se não achou pelo critério 1, ou para ser permissivo?
        // Vamos ser permissivos: se bater keyword TAMBÉM serve.
        const matchesKeyword = currentStep.categoryKeywords.some(keyword => 
            normalizedProductCat.includes(normalizeText(keyword))
        );

        if (!matchesKeyword) return false;

        // Filtro por termo de busca (input do usuário)
        if (searchTerm) {
            const normalizedSearch = normalizeText(searchTerm);
            const normalizedName = normalizeText(p.name);
            return normalizedName.includes(normalizedSearch);
        }

        return true;
    });

    // 1. Filtro de Soquete (CPU <-> Mobo)
    if (currentStep.id === 'motherboard' && config.cpu?.specs?.socket_type) {
      base = base.filter((p: TechProduct) => p.specs?.socket_type === config.cpu?.specs?.socket_type);
    }
    // Se trocou a ordem e escolheu mobo primeiro
    if (currentStep.id === 'cpu' && config.motherboard?.specs?.socket_type) {
       base = base.filter((p: TechProduct) => p.specs?.socket_type === config.motherboard?.specs?.socket_type);
    }

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
    const price = parseFloat(item.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
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

  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar de Progresso & Resumo */}
        <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wrench className="text-[#E60012]" />
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
                    {formatCurrency(totalPrice)}
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
                        Complete todos os passos para finalizar
                    </div>
                )}

                <button 
                    onClick={() => setConfig({ cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null })}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 underline flex items-center justify-center gap-1"
                >
                    <RefreshCcw size={14} />
                    Limpar Configuração
                </button>
            </div>
            </div>
        </div>

        {/* Área Principal de Seleção */}
        <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Escolha seu {currentStep.label}</h1>
                    <p className="text-gray-500">
                        Selecione um componente compatível abaixo. O sistema filtra automaticamente as opções.
                    </p>
                    
                    {/* Campo de Busca */}
                    <div className="mt-4 relative">
                        <input
                            type="text"
                            placeholder={`Buscar ${currentStep.label.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={18} />
                        </div>
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Nenhum produto compatível encontrado</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">
                            Tente alterar as peças selecionadas anteriormente ou aguarde a reposição de estoque.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProducts.map((product) => (
                            <div 
                                key={product.id}
                                className={`
                                    border rounded-lg p-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer group
                                    ${config[currentStep.id as keyof PCConfig]?.id === product.id ? "border-[#E60012] bg-red-50" : "border-gray-200"}
                                `}
                                onClick={() => handleSelect(product)}
                            >
                                <div className="w-24 h-24 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-100 p-2 relative">
                                    {product.image ? (
                                        <Image 
                                            src={product.image} 
                                            alt={product.name} 
                                            fill
                                            className="object-contain"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                            <Box size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-[#E60012] transition-colors">
                                            {product.name}
                                        </h3>
                                        
                                        {/* Specs Badges */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {product.specs?.socket_type && (
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    {product.specs.socket_type}
                                                </span>
                                            )}
                                            {product.specs?.tdp_wattage && (
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    {product.specs.tdp_wattage}W
                                                </span>
                                            )}
                                            {product.specs?.ram_type && (
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    {product.specs.ram_type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-lg font-bold text-[#E60012]">{product.price}</span>
                                        {config[currentStep.id as keyof PCConfig]?.id === product.id && (
                                            <span className="bg-[#E60012] text-white p-1 rounded-full">
                                                <Check size={16} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
