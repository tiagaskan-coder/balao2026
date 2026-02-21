"use client";

import { useState, useMemo } from "react";
import { Product } from "@/lib/utils";
import Image from "next/image";
import { 
  Cpu, 
  CircuitBoard, 
  MemoryStick, 
  HardDrive, 
  Monitor, 
  Mouse, 
  Keyboard, 
  Zap, 
  Box, 
  Check, 
  Search, 
  Trash2, 
  ShoppingCart,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface PCBuilderProps {
  products: Product[];
}

type ComponentType = 
  | "processor" 
  | "motherboard" 
  | "memory" 
  | "gpu" 
  | "storage" 
  | "power_supply" 
  | "case" 
  | "monitor" 
  | "peripherals";

interface Step {
  id: ComponentType;
  label: string;
  icon: React.ElementType;
  categoryKeywords: string[];
  required: boolean;
}

const STEPS: Step[] = [
  { 
    id: "processor", 
    label: "Processador", 
    icon: Cpu, 
    categoryKeywords: ["processador", "cpu", "intel", "amd"], 
    required: true 
  },
  { 
    id: "motherboard", 
    label: "Placa Mãe", 
    icon: CircuitBoard, 
    categoryKeywords: ["placa mãe", "motherboard", "placa-mãe"], 
    required: true 
  },
  { 
    id: "memory", 
    label: "Memória RAM", 
    icon: MemoryStick, 
    categoryKeywords: ["memória", "ram", "ddr4", "ddr5"], 
    required: true 
  },
  { 
    id: "gpu", 
    label: "Placa de Vídeo", 
    icon: Monitor, 
    categoryKeywords: ["placa de vídeo", "gpu", "rtx", "gtx", "radeon", "rx"], 
    required: false 
  },
  { 
    id: "storage", 
    label: "Armazenamento", 
    icon: HardDrive, 
    categoryKeywords: ["ssd", "hd", "disco rigido", "nvme"], 
    required: true 
  },
  { 
    id: "power_supply", 
    label: "Fonte", 
    icon: Zap, 
    categoryKeywords: ["fonte", "atx", "power supply"], 
    required: true 
  },
  { 
    id: "case", 
    label: "Gabinete", 
    icon: Box, 
    categoryKeywords: ["gabinete", "case", "tower"], 
    required: true 
  },
  { 
    id: "monitor", 
    label: "Monitor", 
    icon: Monitor, 
    categoryKeywords: ["monitor", "tela", "display", "gamer"], 
    required: false 
  },
  { 
    id: "peripherals", 
    label: "Periféricos", 
    icon: Keyboard, 
    categoryKeywords: ["teclado", "mouse", "headset", "fone"], 
    required: false 
  }
];

export default function PCBuilder({ products }: PCBuilderProps) {
  const [currentStep, setCurrentStep] = useState<ComponentType>("processor");
  const [selections, setSelections] = useState<Record<ComponentType, Product | null>>({
    processor: null,
    motherboard: null,
    memory: null,
    gpu: null,
    storage: null,
    power_supply: null,
    case: null,
    monitor: null,
    peripherals: null
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleSelect = (product: Product) => {
    setSelections(prev => ({ ...prev, [currentStep]: product }));
    
    // Auto-advance to next required step if current is filled
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
    setSearchTerm("");
  };

  const handleRemove = (stepId: ComponentType) => {
    setSelections(prev => ({ ...prev, [stepId]: null }));
  };

  const currentStepInfo = STEPS.find(s => s.id === currentStep);

  const filteredProducts = useMemo(() => {
    if (!currentStepInfo) return [];
    
    return products.filter(p => {
      // Check category match
      const categoryMatch = currentStepInfo.categoryKeywords.some(keyword => 
        (p.category?.toLowerCase() || "").includes(keyword) || 
        p.name.toLowerCase().includes(keyword)
      );
      
      // Check search term
      const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return categoryMatch && searchMatch;
    });
  }, [products, currentStepInfo, searchTerm]);

  const totalPrice = Object.values(selections).reduce((acc, product) => {
    if (!product) return acc;
    const price = parseFloat(product.price.replace("R$", "").replace(/\./g, "").replace(",", "."));
    return acc + price;
  }, 0);

  const handleFinish = () => {
    // Check required fields
    const missingRequired = STEPS.filter(s => s.required && !selections[s.id]);
    
    if (missingRequired.length > 0) {
      showToast(`Faltam itens obrigatórios: ${missingRequired.map(s => s.label).join(", ")}`, "error");
      return;
    }

    // Add all items to cart
    Object.values(selections).forEach(product => {
      if (product) addToCart(product);
    });
    
    showToast("Setup completo adicionado ao carrinho!", "success");
  };

  const formatPrice = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
      {/* Left Sidebar - Steps */}
      <div className="w-full lg:w-1/4 flex flex-col gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-full max-h-[calc(100vh-100px)] sticky top-24">
          <div className="p-4 bg-zinc-50 border-b border-zinc-200">
            <h2 className="font-bold text-zinc-800 text-lg">Seu Setup</h2>
            <div className="text-sm text-zinc-500">Escolha as peças do seu PC</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {STEPS.map((step, index) => {
              const isSelected = selections[step.id] !== null;
              const isCurrent = currentStep === step.id;
              
              return (
                <div 
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-all border ${
                    isCurrent 
                      ? "bg-indigo-50 border-indigo-500 shadow-sm" 
                      : "border-transparent hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? "bg-emerald-100 text-emerald-600" : 
                      isCurrent ? "bg-indigo-100 text-indigo-600" : "bg-zinc-100 text-zinc-400"
                    }`}>
                      {isSelected ? <Check size={18} /> : <step.icon size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-semibold ${isCurrent ? "text-indigo-700" : "text-zinc-700"}`}>
                          {step.label}
                        </span>
                        {step.required && !isSelected && <span className="text-[10px] text-rose-500 font-medium px-1.5 py-0.5 bg-rose-50 rounded">Obrigatório</span>}
                      </div>
                      
                      {selections[step.id] ? (
                        <div className="mt-1 text-xs text-zinc-600 truncate font-medium">
                          {selections[step.id]?.name}
                        </div>
                      ) : (
                        <div className="mt-1 text-xs text-zinc-400 italic">
                          Pendente
                        </div>
                      )}
                    </div>
                    
                    {isSelected && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemove(step.id); }}
                        className="text-zinc-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded transition-colors"
                        title="Remover peça"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-zinc-900 text-white border-t border-zinc-800">
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm text-zinc-400">Total à vista</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-400 block leading-none">{formatPrice(totalPrice)}</span>
                <span className="text-[10px] text-zinc-500">ou 12x no cartão</span>
              </div>
            </div>
            <button 
              onClick={handleFinish}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20"
            >
              <ShoppingCart size={18} />
              Finalizar Montagem
            </button>
          </div>
        </div>
      </div>

      {/* Right Content - Product Selection */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 bg-white sticky top-0 z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-3">
                  {currentStepInfo?.icon && (
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <currentStepInfo.icon size={24} />
                    </div>
                  )}
                  {currentStepInfo?.label}
                </h1>
                <p className="text-zinc-500 text-sm mt-2 ml-1">
                  Selecione um item abaixo para compor seu setup.
                </p>
              </div>
              
              <div className="relative w-full md:w-72 group">
                <input
                  type="text"
                  placeholder={`Buscar ${currentStepInfo?.label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
                <Search className="absolute left-4 top-3.5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              </div>
            </div>
            
            {/* Quick Filters / Tags could go here */}
          </div>

          {/* Product Grid */}
          <div className="flex-1 p-6 bg-zinc-50/50 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-400 space-y-4">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center">
                  <Search size={32} className="opacity-20" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-zinc-600">Nenhum produto encontrado</p>
                  <p className="text-sm">Tente buscar por outro termo ou categoria.</p>
                </div>
                <button onClick={() => setSearchTerm("")} className="text-indigo-600 font-medium hover:underline text-sm">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 flex flex-col gap-4 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                    
                    <div className="relative h-48 w-full bg-zinc-50 rounded-lg overflow-hidden p-4 group-hover:bg-white transition-colors">
                      <Image 
                        src={product.image} 
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider mb-1 px-2 py-0.5 bg-indigo-50 rounded w-fit">
                        {product.category || "Hardware"}
                      </div>
                      <h3 className="font-semibold text-zinc-800 line-clamp-2 text-sm leading-relaxed mb-2" title={product.name}>
                        {product.name}
                      </h3>
                      
                      <div className="mt-auto pt-4 border-t border-zinc-100">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-zinc-400">R$</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {product.price.replace("R$", "").trim()}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 font-medium">à vista no PIX</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleSelect(product)}
                      className="w-full py-2.5 bg-zinc-900 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 group-hover:shadow-md hover:shadow-indigo-200"
                    >
                      <Check size={16} />
                      Selecionar
                    </button>
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
