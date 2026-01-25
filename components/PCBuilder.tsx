"use client";

import React, { useState, useMemo } from "react";
import { Product, Category } from "@/lib/utils";
import { Check, AlertCircle, Cpu, CircuitBoard, MemoryStick, Box, Zap, HardDrive, Monitor, Trash2, ShoppingCart, RefreshCcw, Wrench, Search, ShieldCheck, AlertTriangle, Key, Keyboard, Mouse, Network, Armchair, Headphones } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { 
    PCConfig, 
    TechProduct, 
    checkCompatibility, 
    enrichProduct, 
    validateBuild 
} from "./PCBuilderCompatibility";
import { searchProducts, normalizeText } from "@/lib/searchUtils";

// --- Configuração dos Passos ---

interface Step {
  id: string;
  label: string;
  icon: any;
  categoryKeywords: string[];
  targetSlugs?: string[];
  parentSlug: string;
  filterKeywords?: string[];
}

const STEPS: Step[] = [
  { id: "cpu", label: "Processador", icon: Cpu, categoryKeywords: ["processador", "cpu"], targetSlugs: ["processadores", "processadores-cpu"], parentSlug: "hardware" },
  { id: "motherboard", label: "Placa-mãe", icon: CircuitBoard, categoryKeywords: ["placa-mãe", "placa mãe", "motherboard", "placas-mãe", "placas-mae"], targetSlugs: ["placas-mae", "placas-mãe"], parentSlug: "hardware" },
  { id: "storage", label: "Armazenamento", icon: HardDrive, categoryKeywords: ["ssd", "hd", "disco", "armazenamento", "nvme", "sata"], targetSlugs: ["ssd-hd-nvme", "ssd", "hd"], parentSlug: "hardware" },
  { id: "ram", label: "Memória RAM", icon: MemoryStick, categoryKeywords: ["memória ram", "memoria ram", "ram"], targetSlugs: ["memoria-ram"], parentSlug: "hardware" },
  { id: "gpu", label: "Placa de Vídeo", icon: Monitor, categoryKeywords: ["placa de vídeo", "placa de video", "gpu", "rtx", "rx", "gtx"], targetSlugs: ["placas-de-video", "placas-de-video-gpu"], parentSlug: "hardware" },
  { id: "psu", label: "Fonte", icon: Zap, categoryKeywords: ["fonte", "alimentação", "psu"], targetSlugs: ["fontes-alimentacao", "fontes-de-alimentacao"], parentSlug: "hardware" },
  { id: "case", label: "Gabinete", icon: Box, categoryKeywords: ["gabinete", "case", "torre"], targetSlugs: ["gabinetes"], parentSlug: "hardware" },
  { id: "licenses", label: "Licenças", icon: Key, categoryKeywords: ["licenças", "licencas", "windows", "office"], targetSlugs: ["licencas", "windows", "microsoft-office", "antivirus", "softwares-design", "softwares-edicao"], parentSlug: "licencas" },
  { id: "monitor", label: "Monitores", icon: Monitor, categoryKeywords: ["monitor"], targetSlugs: ["monitores","monitor-gamer","monitor-curvo","monitor-profissional","monitor-ultrawide","monitor-4k"], parentSlug: "monitores" },
  { id: "keyboard", label: "Teclados", icon: Keyboard, categoryKeywords: ["teclado"], targetSlugs: ["teclados-gamer-mecanicos","teclados"], parentSlug: "perifericos" },
  { id: "mouse", label: "Mouses", icon: Mouse, categoryKeywords: ["mouse"], targetSlugs: ["mouses-gamer","mouses"], parentSlug: "perifericos" },
  { id: "headset", label: "Fones de Ouvido", icon: Headphones, categoryKeywords: ["fone", "headset", "headphone"], targetSlugs: ["headsets-fones","fones-ouvido"], parentSlug: "perifericos" },
  { id: "netadapters", label: "Adaptadores de Rede", icon: Network, categoryKeywords: ["rede","wifi","ethernet","lan"], targetSlugs: ["adaptadores-rede"], parentSlug: "rede-conectividade", filterKeywords: ["rede","wifi","ethernet","lan","pci","usb","adaptador"] },
  { id: "peripherals", label: "Outros Periféricos", icon: Box, categoryKeywords: ["webcam","microfone","mousepad","controle","joystick","volante"], targetSlugs: ["webcams","microfones","mousepads","controles-joysticks","volantes-simuladores"], parentSlug: "perifericos" },
  { id: "chairs", label: "Cadeiras", icon: Armchair, categoryKeywords: ["cadeira"], targetSlugs: ["cadeiras-gamer","cadeiras-ergonomicas"], parentSlug: "escritorio" },
];

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
  const accessoryIds = new Set(["licenses","monitor","keyboard","mouse","headset","netadapters","peripherals","chairs"]);
  const [extras, setExtras] = useState<Record<string, { product: TechProduct; quantity: number }[]>>({
    licenses: [],
    monitor: [],
    keyboard: [],
    mouse: [],
    headset: [],
    netadapters: [],
    peripherals: [],
    chairs: []
  });
  const { addToCart } = useCart();

  // Normalização de texto
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/[^a-z0-9]/g, ""); 
  };

  // Enriquecer produtos com specs (via PCBuilderCompatibility)
  const products = useMemo(() => {
    return initialProducts.map(p => enrichProduct(p));
  }, [initialProducts]);

  const currentStep = STEPS[currentStepIndex];
  const prerequisitesSatisfied = (stepId: string, cfg: PCConfig) => {
    if (stepId === "motherboard") return !!cfg.cpu;
    if (stepId === "storage") return !!cfg.motherboard;
    if (stepId === "ram") return !!cfg.motherboard;
    if (stepId === "gpu") return !!cfg.motherboard;
    if (stepId === "psu") return !!cfg.cpu;
    if (stepId === "case") return !!cfg.motherboard;
    return true;
  };
  const blockedByPrereq = !prerequisitesSatisfied(currentStep.id, config);

  // Resetar busca ao mudar de passo
  React.useEffect(() => {
    setSearchTerm("");
  }, [currentStepIndex]);

  // --- Lógica de Filtragem e Compatibilidade ---
  const stepProducts = useMemo(() => {
    if (!prerequisitesSatisfied(currentStep.id, config)) {
      return [];
    }
    const parentCat = categories.find(c => c.slug === currentStep.parentSlug || c.name.toLowerCase() === currentStep.parentSlug);
    let targetCategoryNames: string[] = [];
    if (parentCat) {
        const subCategories = categories.filter(c => c.parent_id === parentCat.id);
        const matches = subCategories.filter(sub => currentStep.targetSlugs?.some(slug => sub.slug === slug));
        targetCategoryNames = matches.map(m => m.name.toLowerCase());
        if (currentStep.targetSlugs?.includes(parentCat.slug)) {
          targetCategoryNames.push(parentCat.name.toLowerCase());
        }
    }

    // 2. Filtrar por categoria estrita
    const categoriesByNameNorm = new Map<string, Category>();
    categories.forEach(c => categoriesByNameNorm.set(normalizeText(c.name), c));
    const isUnderParent = (cat: Category | undefined, parent: Category | undefined) => {
      if (!cat || !parent) return false;
      let current: Category | undefined = cat;
      const visited = new Set<string>();
      while (current && !visited.has(current.id)) {
        if (current.id === parent.id) return true;
        visited.add(current.id);
        current = categories.find(c => c.id === current?.parent_id);
      }
      return false;
    };
    let filtered = products.filter((p: TechProduct) => {
        const normalizedProductCat = normalizeText(p.category);
        const normalizedProductName = normalizeText(p.name || "");
        const catObj = categoriesByNameNorm.get(normalizedProductCat);
        const strictNames = targetCategoryNames.map(n => normalizeText(n));
        const isStrictCategoryMatch = strictNames.some(targetName => normalizedProductCat === targetName);
        let baseMatch = isStrictCategoryMatch || (!parentCat && currentStep.categoryKeywords.some(keyword => normalizedProductCat.includes(normalizeText(keyword))));
        if (parentCat && !baseMatch) {
          const underParent = isUnderParent(catObj, parentCat);
          const noExplicitMatches = targetCategoryNames.length === 0;
          if (underParent && noExplicitMatches) {
            baseMatch = currentStep.categoryKeywords.some(k => normalizedProductCat.includes(normalizeText(k)) || normalizedProductName.includes(normalizeText(k)));
          }
        }
        if (!baseMatch) return false;
        if (currentStep.filterKeywords && !currentStep.filterKeywords.some(k => normalizedProductName.includes(normalizeText(k)))) {
          return false;
        }
        if (currentStep.id === "ram") {
          const moboName = (config.motherboard?.name || "").toLowerCase();
          let expected: "ddr4" | "ddr5" | null = null;
          if (moboName.includes("ddr5")) expected = "ddr5";
          else if (moboName.includes("ddr4")) expected = "ddr4";
          
          if (!expected) return false;
          
          const ramName = (p.name || "").toLowerCase();
          const ramTypeSpec = (p.specs?.ram_type || "").toLowerCase();
          const matchesRam = ramName.includes(expected) || ramTypeSpec === expected.toUpperCase();
          if (!matchesRam) return false;
        }
        if (currentStep.id === "storage") {
          const name = p.name.toLowerCase();
          if (name.includes("externo") || name.includes("external") || name.includes("usb")) return false;
          const isNvme = name.includes("nvme") || name.includes("m.2") || name.includes("m2");
          const isSata = name.includes("sata");
          if (!isNvme && !isSata) return false;
        }
        return true;
    });

    // 3. Aplicar Busca Inteligente (se houver termo)
    if (searchTerm) {
        filtered = searchProducts(filtered, searchTerm);
    }

    // 4. Verificação de Compatibilidade e ocultação de itens incompatíveis
    return filtered
      .map((product: TechProduct) => {
        const status = checkCompatibility(product, config, currentStep.id);
        return { product, status };
      })
      .filter(({ status }: { status: { valid: boolean } }) => status.valid);

  }, [products, currentStep, config, searchTerm, categories]);

  const handleSelect = (product: TechProduct, isValid: boolean) => {
    if (!isValid) return;
    if (accessoryIds.has(currentStep.id)) {
      setExtras(prev => {
        const list = prev[currentStep.id] || [];
        const idx = list.findIndex(x => x.product.id === product.id);
        if (idx >= 0) {
          const updated = [...list];
          updated[idx] = { product: updated[idx].product, quantity: updated[idx].quantity + 1 };
          return { ...prev, [currentStep.id]: updated };
        }
        return { ...prev, [currentStep.id]: [...list, { product, quantity: 1 }] };
      });
      return;
    }
    setConfig((prev: PCConfig) => ({ ...prev, [currentStep.id]: product }));
    if (currentStepIndex < STEPS.length - 1) {
        setTimeout(() => setCurrentStepIndex((prev: number) => prev + 1), 300);
    }
  };

  const handleRemove = (stepId: keyof PCConfig) => {
    setConfig((prev: PCConfig) => ({ ...prev, [stepId]: null }));
    const stepIdx = STEPS.findIndex(s => s.id === stepId);
    if (stepIdx !== -1) setCurrentStepIndex(stepIdx);
  };
  const clearExtrasForStep = (stepId: string) => {
    setExtras(prev => ({ ...prev, [stepId]: [] }));
    const stepIdx = STEPS.findIndex(s => s.id === stepId);
    if (stepIdx !== -1) setCurrentStepIndex(stepIdx);
  };

  const totalPriceHardware = (Object.values(config) as (TechProduct | null)[]).reduce((acc, item) => {
    if (!item) return acc;
    const price = parseFloat(item.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
    return acc + (isNaN(price) ? 0 : price);
  }, 0);
  const totalPriceExtras = Object.values(extras).flat().reduce((acc, x) => {
    const price = parseFloat(x.product.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
    return acc + (isNaN(price) ? 0 : price) * x.quantity;
  }, 0);
  const totalPrice = totalPriceHardware + totalPriceExtras;

  const totalTDP = (config.cpu?.specs?.tdp || 0) + (config.gpu?.specs?.tdp || 0);

  // Validação Final
  const validationResult = validateBuild(config);
  const isComplete = Object.values(config).every(v => v !== null);

  const handleAddToCart = () => {
    if (!validationResult.valid) {
        alert("Corrija os erros de compatibilidade antes de adicionar ao carrinho.");
        return;
    }
    Object.values(config).forEach(item => {
        if (item) addToCart(item);
    });
    Object.entries(extras).forEach(([_, list]) => {
      list.forEach(x => {
        for (let i = 0; i < x.quantity; i++) addToCart(x.product);
      });
    });
    alert("Setup adicionado ao carrinho com sucesso!");
  };

  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6">
            
            {/* Resumo da Build */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Wrench className="text-[#E60012]" />
                    Sua Configuração
                </h2>
                
                <div className="space-y-3 mb-5">
                    {STEPS.map((step, index) => {
                    const selected = config[step.id as keyof PCConfig];
                    const isActive = index === currentStepIndex;
                    const isDone = !!selected;
                    const extrasList = extras[step.id] || [];
                    const extrasDone = accessoryIds.has(step.id) && extrasList.length > 0;

                    return (
                        <div 
                        key={step.id}
                        className={`
                            relative p-2 rounded-lg border transition-all cursor-pointer
                            ${isActive ? "border-[#E60012] bg-red-50 ring-1 ring-[#E60012]" : "border-gray-200 hover:border-gray-300"}
                            ${(isDone || extrasDone) ? "bg-gray-50" : ""}
                        `}
                        onClick={() => setCurrentStepIndex(index)}
                        >
                        <div className="flex items-start gap-3">
                            <div className={`p-1 rounded-full ${isActive || isDone ? "bg-[#E60012] text-white" : "bg-gray-100 text-gray-400"}`}>
                            <step.icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-xs font-medium ${isActive ? "text-[#E60012]" : "text-gray-700"}`}>
                                    {step.label}
                                </span>
                                {(isDone || extrasDone) && (
                                    <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          if (accessoryIds.has(step.id)) clearExtrasForStep(step.id);
                                          else handleRemove(step.id as keyof PCConfig); 
                                        }}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                            {accessoryIds.has(step.id) ? (
                              extrasDone ? (
                                <div className="text-xs text-gray-600 truncate">
                                  {extrasList.map((x) => `${x.product.name} x${x.quantity}`).join(", ")}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 italic">Pendente...</div>
                              )
                            ) : (
                              selected ? (
                                <>
                                  <div className="text-xs text-gray-600 truncate">{selected.name}</div>
                                  <div className="text-xs font-bold text-[#E60012] mt-1">{selected.price}</div>
                                </>
                              ) : (
                                <div className="text-xs text-gray-400 italic">Pendente...</div>
                              )
                            )}
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>

                {/* Checklist de Validação */}
                <div className="border-t pt-4 mb-4">
                    <h3 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <ShieldCheck size={14} /> Checklist de Compatibilidade
                    </h3>
                    <div className="space-y-2 text-xs">
                        {validationResult.errors.length > 0 ? (
                            validationResult.errors.map((err, i) => (
                                <div key={i} className="flex gap-2 text-red-600 bg-red-50 p-1 rounded">
                                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                                    <span>{err}</span>
                                </div>
                            ))
                        ) : isComplete ? (
                             <div className="flex gap-2 text-green-600 bg-green-50 p-1 rounded">
                                <Check size={12} className="flex-shrink-0 mt-0.5" />
                                <span>Setup 100% Compatível!</span>
                            </div>
                        ) : (
                            <div className="text-gray-400 italic">Complete a build para validar...</div>
                        )}
                        
                        {validationResult.warnings.map((warn, i) => (
                             <div key={`warn-${i}`} className="flex gap-2 text-amber-600 bg-amber-50 p-1 rounded">
                                <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                                <span>{warn}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-[#E60012]">
                        {formatCurrency(totalPrice)}
                    </span>
                    </div>
                    
                    <button 
                    onClick={handleAddToCart}
                    disabled={!isComplete && validationResult.errors.length > 0} // Permite se incompleto (opcional), mas bloqueia se erro
                    className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors
                        ${(isComplete && validationResult.valid)
                            ? "bg-[#E60012] text-white hover:bg-[#cc0010]" 
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"}
                    `}
                    >
                    <ShoppingCart size={16} />
                    Adicionar ao Carrinho
                    </button>
                    
                    <button 
                        onClick={() => { 
                          setConfig({ cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null });
                          setExtras({ licenses: [], monitor: [], keyboard: [], mouse: [], headset: [], netadapters: [], peripherals: [], chairs: [] });
                        }}
                        className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 underline flex items-center justify-center gap-1"
                    >
                        <RefreshCcw size={12} />
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
                        Selecione um componente compatível abaixo. O sistema verifica automaticamente a compatibilidade.
                    </p>
                    
                    {currentStep.id === "psu" && (
                        <div className="mt-3">
                            <a
                                href="https://www.balao.info/categoria/fontes-alimentacao"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-[#E60012] hover:underline"
                            >
                                <Zap size={16} />
                                Ver todas as Fontes na loja
                            </a>
                        </div>
                    )}
                    
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

                {stepProducts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {blockedByPrereq ? "Selecione o componente anterior para continuar" : "Nenhum produto compatível encontrado"}
                        </h3>
                        {!blockedByPrereq && (
                          <p className="text-gray-500 max-w-sm mx-auto mt-2">
                              Tente alterar o termo de busca ou verifique se há componentes disponíveis para esta categoria.
                          </p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stepProducts.map(({ product, status }) => (
                            <div 
                                key={product.id}
                                className={`
                                    border rounded-lg p-4 flex gap-4 transition-all
                                    ${
                                      accessoryIds.has(currentStep.id)
                                        ? ((extras[currentStep.id]?.some(x => x.product.id === product.id)) ? "border-[#E60012] bg-red-50" : "border-gray-200")
                                        : (config[currentStep.id as keyof PCConfig]?.id === product.id ? "border-[#E60012] bg-red-50" : "border-gray-200")
                                    }
                                    ${!status.valid ? "opacity-60 bg-gray-50 cursor-not-allowed grayscale" : "hover:shadow-md cursor-pointer group bg-white"}
                                `}
                                onClick={() => handleSelect(product, status.valid)}
                            >
                                <div className="w-24 h-24 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-100 p-2 relative">
                                    {product.image ? (
                                        <Image 
                                            src={product.image} 
                                            alt={product.name} 
                                            fill
                                            unoptimized
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
                                        
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {product.specs?.socket && (
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    {product.specs.socket}
                                                </span>
                                            )}
                                            {product.specs?.tdp && (
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    {product.specs.tdp}W
                                                </span>
                                            )}
                                            {product.specs?.ram_type && (
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    {product.specs.ram_type}
                                                </span>
                                            )}
                                            {accessoryIds.has(currentStep.id) && (extras[currentStep.id]?.find(x => x.product.id === product.id)?.quantity || 0) > 0 && (
                                              <span className="text-[10px] bg-[#E60012] text-white px-2 py-0.5 rounded">
                                                x{extras[currentStep.id]?.find(x => x.product.id === product.id)?.quantity}
                                              </span>
                                            )}
                                        </div>

                                        {/* Mensagem de Incompatibilidade */}
                                        {!status.valid && (
                                            <div className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                {status.messages[0]}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-lg font-bold text-[#E60012]">{product.price}</span>
                                        {!accessoryIds.has(currentStep.id) && config[currentStep.id as keyof PCConfig]?.id === product.id && (
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
