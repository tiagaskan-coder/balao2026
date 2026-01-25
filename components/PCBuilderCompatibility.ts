import { Product } from "@/lib/utils";

// --- Interfaces de Especificações Técnicas ---

export interface PCSpecs {
  socket?: string;         // Ex: "AM5", "LGA1700"
  tdp?: number;            // Ex: 65, 125 (Watts)
  ram_type?: string;       // Ex: "DDR4", "DDR5"
  form_factor?: string;    // Ex: "ATX", "Micro-ATX", "ITX"
  supported_form_factors?: string[]; // Ex: ["ATX", "Micro-ATX", "ITX"]
  wattage?: number;        // Ex: 500, 750 (Watts)
  slots_ram?: number;      // Ex: 2, 4
  max_memory?: number;     // Ex: 64, 128 (GB)
  has_m2?: boolean;
  pcie_x16?: boolean;
}

export interface TechProduct extends Product {
  specs?: PCSpecs;
}

export interface PCConfig {
  cpu: TechProduct | null;
  motherboard: TechProduct | null;
  ram: TechProduct | null;
  gpu: TechProduct | null;
  storage: TechProduct | null;
  psu: TechProduct | null;
  case: TechProduct | null;
}

export interface CompatibilityStatus {
  valid: boolean;
  messages: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// --- Dados Mockados para "Enriquecimento" (Seed) ---
// Isso garante que a ferramenta funcione mesmo sem o banco populado
const MOCK_SPECS_DB: Record<string, PCSpecs> = {
  // CPUs
  "cpu-amd-am4": { socket: "AM4", tdp: 65 },
  "cpu-amd-am5": { socket: "AM5", tdp: 105, ram_type: "DDR5" }, // AM5 é só DDR5
  "cpu-intel-12": { socket: "LGA1700", tdp: 125 }, // Gen 12/13/14
  
  // Placas-mãe
  "mobo-am4-b550": { socket: "AM4", ram_type: "DDR4", form_factor: "Micro-ATX", slots_ram: 4, has_m2: true, pcie_x16: true },
  "mobo-am5-x670": { socket: "AM5", ram_type: "DDR5", form_factor: "ATX", slots_ram: 4, has_m2: true, pcie_x16: true },
  "mobo-intel-b660": { socket: "LGA1700", ram_type: "DDR4", form_factor: "Micro-ATX", slots_ram: 4, has_m2: true, pcie_x16: true },
  "mobo-intel-z790": { socket: "LGA1700", ram_type: "DDR5", form_factor: "ATX", slots_ram: 4, has_m2: true, pcie_x16: true },

  // RAM
  "ram-ddr4": { ram_type: "DDR4" },
  "ram-ddr5": { ram_type: "DDR5" },

  // GPU
  "gpu-entry": { tdp: 100 },
  "gpu-mid": { tdp: 200 },
  "gpu-high": { tdp: 350 }, // RTX 4080/4090

  // Fonte
  "psu-500": { wattage: 500 },
  "psu-650": { wattage: 650 },
  "psu-750": { wattage: 750 },
  "psu-850": { wattage: 850 },

  // Gabinete
  "case-atx": { supported_form_factors: ["ATX", "Micro-ATX", "ITX", "E-ATX"] },
  "case-matx": { supported_form_factors: ["Micro-ATX", "ITX"] },
};

// --- Função de Enriquecimento ---
export function enrichProduct(product: Product): TechProduct {
  if (product.specs && Object.keys(product.specs).length > 0) {
    return product as TechProduct;
  }

  // Lógica heurística baseada no nome para atribuir specs
  let mockSpec: PCSpecs = {};
  const name = product.name.toLowerCase();
  const cat = product.category.toLowerCase();

  // 1. Processadores
  if (cat.includes("processador") || cat.includes("cpu")) {
    if (name.includes("ryzen") && (name.includes("5000") || name.includes("3000") || name.includes("4000"))) {
        mockSpec = MOCK_SPECS_DB["cpu-amd-am4"];
    } else if (name.includes("ryzen") && (name.includes("7000") || name.includes("8000") || name.includes("9000"))) {
        mockSpec = MOCK_SPECS_DB["cpu-amd-am5"];
    } else if (name.includes("intel") || name.includes("core")) {
        // Simplificação: Assumindo LGA1700 para novos
        mockSpec = MOCK_SPECS_DB["cpu-intel-12"];
    }
  } 
  // 2. Placas-mãe
  else if (cat.includes("placa-mãe") || cat.includes("motherboard")) {
    if (name.includes("b550") || name.includes("a520") || name.includes("x570")) {
        mockSpec = MOCK_SPECS_DB["mobo-am4-b550"];
    } else if (name.includes("x670") || name.includes("b650")) {
        mockSpec = MOCK_SPECS_DB["mobo-am5-x670"];
    } else if (name.includes("b660") || name.includes("h610")) {
        mockSpec = MOCK_SPECS_DB["mobo-intel-b660"]; // DDR4 default
    } else if (name.includes("z790")) {
        mockSpec = MOCK_SPECS_DB["mobo-intel-z790"]; // DDR5 default
    }
    
    // Override manual se nome disser DDR5/DDR4 explicitamente
    if (name.includes("ddr5")) mockSpec = { ...mockSpec, ram_type: "DDR5" };
    else if (name.includes("ddr4")) mockSpec = { ...mockSpec, ram_type: "DDR4" };
  }
  // 3. Memória RAM
  else if (cat.includes("memória") || cat.includes("ram")) {
    if (name.includes("ddr5")) mockSpec = MOCK_SPECS_DB["ram-ddr5"];
    else mockSpec = MOCK_SPECS_DB["ram-ddr4"];
  }
  // 4. Placa de Vídeo
  else if (cat.includes("vídeo") || cat.includes("gpu")) {
    if (name.includes("4090") || name.includes("4080") || name.includes("7900")) mockSpec = MOCK_SPECS_DB["gpu-high"];
    else if (name.includes("4060") || name.includes("3060") || name.includes("7600")) mockSpec = MOCK_SPECS_DB["gpu-entry"];
    else mockSpec = MOCK_SPECS_DB["gpu-mid"];
  }
  // 5. Fonte
  else if (cat.includes("fonte") || cat.includes("psu")) {
    if (name.includes("850w")) mockSpec = MOCK_SPECS_DB["psu-850"];
    else if (name.includes("750w")) mockSpec = MOCK_SPECS_DB["psu-750"];
    else if (name.includes("650w")) mockSpec = MOCK_SPECS_DB["psu-650"];
    else mockSpec = MOCK_SPECS_DB["psu-500"];
  }
  // 6. Gabinete
  else if (cat.includes("gabinete")) {
    if (name.includes("mid") || name.includes("tower")) mockSpec = MOCK_SPECS_DB["case-atx"];
    else mockSpec = MOCK_SPECS_DB["case-matx"];
  }

  return {
    ...product,
    specs: { ...mockSpec, ...product.specs } // Prioriza specs reais do DB se existirem parcialmente
  };
}

// --- Motor de Compatibilidade ---

export function checkCompatibility(
  product: TechProduct, 
  config: PCConfig, 
  categoryContext: string // "cpu", "motherboard", etc.
): CompatibilityStatus {
  const messages: string[] = [];
  let valid = true;

  // 1. CPU ↔ Placa-mãe (Socket)
  if (categoryContext === 'motherboard' && config.cpu?.specs?.socket) {
    if (product.specs?.socket && product.specs.socket !== config.cpu.specs.socket) {
      valid = false;
      messages.push(`Socket incompatível: CPU requer ${config.cpu.specs.socket}, placa é ${product.specs.socket}`);
    }
  }
  if (categoryContext === 'cpu' && config.motherboard?.specs?.socket) {
    if (product.specs?.socket && product.specs.socket !== config.motherboard.specs.socket) {
      valid = false;
      messages.push(`Socket incompatível: Placa requer ${config.motherboard.specs.socket}, CPU é ${product.specs.socket}`);
    }
  }

  // 2. Placa-mãe ↔ RAM (Tipo de Memória)
  if (categoryContext === 'ram' && config.motherboard?.specs?.ram_type) {
    if (product.specs?.ram_type && product.specs.ram_type !== config.motherboard.specs.ram_type) {
      valid = false;
      messages.push(`Tipo de memória incompatível: Placa usa ${config.motherboard.specs.ram_type}, RAM é ${product.specs.ram_type}`);
    }
  }
  if (categoryContext === 'motherboard' && config.ram?.specs?.ram_type) {
    if (product.specs?.ram_type && product.specs.ram_type !== config.ram.specs.ram_type) {
        valid = false;
        messages.push(`Tipo de memória incompatível: RAM selecionada é ${config.ram.specs.ram_type}, placa suporta ${product.specs.ram_type}`);
    }
  }

  // 3. Placa-mãe ↔ Gabinete (Form Factor)
  // Regra: Gabinete deve suportar o tamanho da placa.
  // Se estou escolhendo Gabinete e já tenho Placa
  if (categoryContext === 'case' && config.motherboard?.specs?.form_factor) {
    const moboFF = config.motherboard.specs.form_factor;
    if (product.specs?.supported_form_factors && !product.specs.supported_form_factors.includes(moboFF)) {
        valid = false;
        messages.push(`Gabinete pequeno demais: Não suporta placas ${moboFF}`);
    }
  }
  // Se estou escolhendo Placa e já tenho Gabinete
  if (categoryContext === 'motherboard' && config.case?.specs?.supported_form_factors) {
    const moboFF = product.specs?.form_factor;
    if (moboFF && !config.case.specs.supported_form_factors.includes(moboFF)) {
        valid = false;
        messages.push(`Placa grande demais para o gabinete selecionado`);
    }
  }

  // 4. GPU + CPU ↔ Fonte (Potência)
  // Regra: Fonte >= (TDP CPU + TDP GPU) * 1.2
  if (categoryContext === 'psu') {
    const cpuTdp = config.cpu?.specs?.tdp || 65;
    const gpuTdp = config.gpu?.specs?.tdp || 0;
    const totalTdp = cpuTdp + gpuTdp;
    const recommended = totalTdp * 1.3;

    if (product.specs?.wattage && product.specs.wattage < recommended) {
        valid = false;
        messages.push(`Potência insuficiente: Sistema consome ~${totalTdp}W (Rec: ${Math.ceil(recommended)}W), fonte tem ${product.specs.wattage}W`);
    }
  }
  // Se estou escolhendo GPU/CPU e já tenho Fonte, avisar se estourar?
  // (Opcional, mas boa prática. Por enquanto foca em validar a Fonte quando escolhida)

  // 5. Motherboard ↔ GPU (PCIe x16)
  if (categoryContext === 'gpu' && config.motherboard) {
    const hasSlot = config.motherboard.specs?.pcie_x16 !== false;
    if (!hasSlot) {
      valid = false;
      messages.push(`Placa-mãe sem PCIe x16 para a placa de vídeo`);
    }
  }

  // 6. Storage interno
  if (categoryContext === 'storage') {
    const name = (product.name || '').toLowerCase();
    if (name.includes('externo') || name.includes('external') || name.includes('usb')) {
      valid = false;
      messages.push(`Apenas SSD interno é permitido`);
    }
    const isNvme = name.includes('nvme') || name.includes('m.2') || name.includes('m2');
    if (isNvme && config.motherboard && config.motherboard.specs?.has_m2 === false) {
      valid = false;
      messages.push(`Placa-mãe sem slot M.2 para NVMe`);
    }
  }

  return { valid, messages };
}

// --- Validação Final (JSON) ---
export function validateBuild(config: PCConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check CPU <-> Mobo
  if (config.cpu && config.motherboard) {
    if (config.cpu.specs?.socket !== config.motherboard.specs?.socket) {
        errors.push(`Incompatibilidade Crítica: CPU (${config.cpu.name}) e Placa-mãe (${config.motherboard.name}) têm sockets diferentes.`);
    }
  }

  // Check RAM <-> Mobo
  if (config.ram && config.motherboard) {
    if (config.ram.specs?.ram_type !== config.motherboard.specs?.ram_type) {
        errors.push(`Incompatibilidade Crítica: Memória (${config.ram.specs?.ram_type}) não encaixa na Placa-mãe (${config.motherboard.specs?.ram_type}).`);
    }
  }

  // Check PSU
  if (config.psu) {
    const cpuTdp = config.cpu?.specs?.tdp || 65;
    const gpuTdp = config.gpu?.specs?.tdp || 0;
    const totalReq = (cpuTdp + gpuTdp) * 1.3;
    if ((config.psu.specs?.wattage || 0) < totalReq) {
        warnings.push(`Alerta de Energia: A fonte pode estar operando no limite. Recomendado: ${Math.ceil(totalReq)}W.`);
    }
  }

  // Check Case <-> Mobo
  if (config.case && config.motherboard) {
    const moboFF = config.motherboard.specs?.form_factor;
    if (moboFF && !config.case.specs?.supported_form_factors?.includes(moboFF)) {
        errors.push(`Incompatibilidade Física: A placa-mãe ${moboFF} não cabe no gabinete selecionado.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
