import { Product } from "@/lib/utils";
import { CompatibilityStatus, PCConfig, PCSpecs, TechProduct, ValidationResult } from "@/src/types/pcBuilder";
import { normalizeText as normFromLib } from "@/lib/searchUtils";

export const normalizeText = (t: string) => normFromLib(t);

export const parsePrice = (s: string) => {
  const n = parseFloat(String(s).replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
  return isNaN(n) ? 0 : n;
};

const MOCK_SPECS_DB: Record<string, PCSpecs> = {
  "cpu-amd-am4": { socket: "AM4", tdp: 65 },
  "cpu-amd-am5": { socket: "AM5", tdp: 105, ram_type: "DDR5" },
  "cpu-intel-12": { socket: "LGA1700", tdp: 125 },
  "mobo-am4-b550": { socket: "AM4", ram_type: "DDR4", form_factor: "Micro-ATX", slots_ram: 4, has_m2: true, pcie_x16: true },
  "mobo-am5-x670": { socket: "AM5", ram_type: "DDR5", form_factor: "ATX", slots_ram: 4, has_m2: true, pcie_x16: true },
  "mobo-intel-b660": { socket: "LGA1700", ram_type: "DDR4", form_factor: "Micro-ATX", slots_ram: 4, has_m2: true, pcie_x16: true },
  "mobo-intel-z790": { socket: "LGA1700", ram_type: "DDR5", form_factor: "ATX", slots_ram: 4, has_m2: true, pcie_x16: true },
  "ram-ddr4": { ram_type: "DDR4" },
  "ram-ddr5": { ram_type: "DDR5" },
  "gpu-entry": { tdp: 100 },
  "gpu-mid": { tdp: 200 },
  "gpu-high": { tdp: 350 },
  "psu-500": { wattage: 500 },
  "psu-650": { wattage: 650 },
  "psu-750": { wattage: 750 },
  "psu-850": { wattage: 850 },
  "case-atx": { supported_form_factors: ["ATX", "Micro-ATX", "ITX", "E-ATX"] },
  "case-matx": { supported_form_factors: ["Micro-ATX", "ITX"] }
};

export function enrichProduct(product: Product): TechProduct {
  if (product.specs && Object.keys(product.specs).length > 0) return product as TechProduct;
  let mockSpec: PCSpecs = {};
  const name = (product.name || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();
  if (cat.includes("processador") || cat.includes("cpu")) {
    if (name.includes("ryzen") && (name.includes("5000") || name.includes("3000") || name.includes("4000"))) mockSpec = MOCK_SPECS_DB["cpu-amd-am4"];
    else if (name.includes("ryzen") && (name.includes("7000") || name.includes("8000") || name.includes("9000"))) mockSpec = MOCK_SPECS_DB["cpu-amd-am5"];
    else if (name.includes("intel") || name.includes("core")) mockSpec = MOCK_SPECS_DB["cpu-intel-12"];
  } else if (cat.includes("placa-mãe") || cat.includes("motherboard")) {
    if (name.includes("b550") || name.includes("a520") || name.includes("x570")) mockSpec = MOCK_SPECS_DB["mobo-am4-b550"];
    else if (name.includes("x670") || name.includes("b650")) mockSpec = MOCK_SPECS_DB["mobo-am5-x670"];
    else if (name.includes("b660") || name.includes("h610")) mockSpec = MOCK_SPECS_DB["mobo-intel-b660"];
    else if (name.includes("z790")) mockSpec = MOCK_SPECS_DB["mobo-intel-z790"];
    if (name.includes("ddr5")) mockSpec = { ...mockSpec, ram_type: "DDR5" };
    else if (name.includes("ddr4")) mockSpec = { ...mockSpec, ram_type: "DDR4" };
    if (name.includes("atx")) mockSpec = { ...mockSpec, form_factor: "ATX" };
    else if (name.includes("micro-atx") || name.includes("matx")) mockSpec = { ...mockSpec, form_factor: "Micro-ATX" };
    else if (name.includes("mini-itx") || name.includes("mitx") || name.includes("itx")) mockSpec = { ...mockSpec, form_factor: "ITX" };
  } else if (cat.includes("memória") || cat.includes("ram")) {
    if (name.includes("ddr5")) mockSpec = MOCK_SPECS_DB["ram-ddr5"];
    else mockSpec = MOCK_SPECS_DB["ram-ddr4"];
  } else if (cat.includes("vídeo") || cat.includes("gpu")) {
    if (name.includes("4090") || name.includes("4080") || name.includes("7900")) mockSpec = MOCK_SPECS_DB["gpu-high"];
    else if (name.includes("4060") || name.includes("3060") || name.includes("7600")) mockSpec = MOCK_SPECS_DB["gpu-entry"];
    else mockSpec = MOCK_SPECS_DB["gpu-mid"];
  } else if (cat.includes("fonte") || cat.includes("psu")) {
    if (name.includes("850w")) mockSpec = MOCK_SPECS_DB["psu-850"];
    else if (name.includes("750w")) mockSpec = MOCK_SPECS_DB["psu-750"];
    else if (name.includes("650w")) mockSpec = MOCK_SPECS_DB["psu-650"];
    else mockSpec = MOCK_SPECS_DB["psu-500"];
  } else if (cat.includes("gabinete")) {
    if (name.includes("e-atx") || name.includes("eatx")) mockSpec = { ...MOCK_SPECS_DB["case-atx"], supported_form_factors: ["E-ATX","ATX","Micro-ATX","ITX"] };
    else if (name.includes("atx")) mockSpec = MOCK_SPECS_DB["case-atx"];
    else mockSpec = MOCK_SPECS_DB["case-matx"];
  }
  return { ...product, specs: { ...mockSpec, ...product.specs } };
}

function deriveSocketFromName(name?: string): string | undefined {
  const n = (name || "").toLowerCase();
  if (n.includes("am5")) return "AM5";
  if (n.includes("am4")) return "AM4";
  if (n.includes("lga1700") || n.match(/\blga\s*1700\b/)) return "LGA1700";
  if (n.includes("z790") || n.includes("b660") || n.includes("h610")) return "LGA1700";
  if (n.includes("b550") || n.includes("a520") || n.includes("x570")) return "AM4";
  if (n.includes("x670") || n.includes("b650")) return "AM5";
  return undefined;
}

export function checkCompatibility(product: TechProduct, config: PCConfig, categoryContext: string): CompatibilityStatus {
  const messages: string[] = [];
  let valid = true;
  if (categoryContext === "motherboard" && config.cpu) {
    const cpuSocket = config.cpu.specs?.socket || deriveSocketFromName(config.cpu.name);
    const moboSocket = product.specs?.socket || deriveSocketFromName(product.name);
    if (!cpuSocket || !moboSocket || moboSocket !== cpuSocket) {
      valid = false;
      messages.push(`Socket incompatível: CPU requer ${cpuSocket || "indefinido"}${moboSocket ? `, placa é ${moboSocket}` : ""}`);
    }
  }
  if (categoryContext === "cpu" && config.motherboard) {
    const cpuSocket = product.specs?.socket || deriveSocketFromName(product.name);
    const moboSocket = config.motherboard.specs?.socket || deriveSocketFromName(config.motherboard.name);
    if (!cpuSocket || !moboSocket || cpuSocket !== moboSocket) {
      valid = false;
      messages.push(`Socket incompatível: Placa requer ${moboSocket || "indefinido"}, CPU é ${cpuSocket || "indefinido"}`);
    }
  }
  if (categoryContext === "ram" && config.motherboard) {
    const moboName = (config.motherboard.name || "").toLowerCase();
    let expected: "DDR4" | "DDR5" | null = null;
    if (moboName.includes("ddr5")) expected = "DDR5";
    else if (moboName.includes("ddr4")) expected = "DDR4";
    else if (config.motherboard.specs?.ram_type) expected = config.motherboard.specs.ram_type as "DDR4" | "DDR5";
    if (expected) {
      const ramName = (product.name || "").toLowerCase();
      const actual = product.specs?.ram_type || (ramName.includes("ddr5") ? "DDR5" : ramName.includes("ddr4") ? "DDR4" : undefined);
      if (!actual || actual !== expected) {
        valid = false;
        messages.push(`Tipo de memória incompatível: Placa usa ${expected}, RAM é ${actual || "indefinido"}`);
      }
    }
  }
  if (categoryContext === "motherboard" && config.ram?.specs?.ram_type) {
    const moboName = (product.name || "").toLowerCase();
    const moboRam = product.specs?.ram_type || (moboName.includes("ddr5") ? "DDR5" : moboName.includes("ddr4") ? "DDR4" : undefined);
    const ramType = config.ram.specs.ram_type;
    if (!moboRam || moboRam !== ramType) {
      valid = false;
      messages.push(`Tipo de memória incompatível: RAM selecionada é ${ramType}, placa suporta ${moboRam || "indefinido"}`);
    }
  }
  if (categoryContext === "case" && config.motherboard?.specs?.form_factor) {
    const moboFF = config.motherboard.specs.form_factor;
    if (product.specs?.supported_form_factors && !product.specs.supported_form_factors.includes(moboFF)) {
      valid = false;
      messages.push(`Gabinete pequeno demais: Não suporta placas ${moboFF}`);
    }
  }
  if (categoryContext === "motherboard" && config.case?.specs?.supported_form_factors) {
    const moboFF = product.specs?.form_factor;
    if (moboFF && !config.case.specs.supported_form_factors.includes(moboFF)) {
      valid = false;
      messages.push(`Placa grande demais para o gabinete selecionado`);
    }
  }
  if (categoryContext === "psu") {
    const cpuTdp = config.cpu?.specs?.tdp || 65;
    const gpuTdp = config.gpu?.specs?.tdp || 0;
    const totalTdp = cpuTdp + gpuTdp + 100;
    const recommended = totalTdp * 1.3;
    if (product.specs?.wattage && product.specs.wattage < recommended) {
      valid = false;
      messages.push(`Potência insuficiente: Sistema consome ~${totalTdp}W (Rec: ${Math.ceil(recommended)}W), fonte tem ${product.specs.wattage}W`);
    }
  }
  if (categoryContext === "storage") {
    const name = (product.name || "").toLowerCase();
    if (name.includes("externo") || name.includes("external") || name.includes("usb")) {
      valid = false;
      messages.push(`Apenas SSD interno é permitido`);
    }
    const isNvme = name.includes("nvme") || name.includes("m.2") || name.includes("m2");
    if (isNvme && config.motherboard && config.motherboard.specs?.has_m2 === false) {
      valid = false;
      messages.push(`Placa-mãe sem slot M.2 para NVMe`);
    }
  }
  return { valid, messages };
}

export function validateBuild(config: PCConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (config.cpu && config.motherboard) {
    const cpuSocket = config.cpu.specs?.socket || deriveSocketFromName(config.cpu.name);
    const moboSocket = config.motherboard.specs?.socket || deriveSocketFromName(config.motherboard.name);
    if (!cpuSocket || !moboSocket || cpuSocket !== moboSocket) {
      errors.push(`Incompatibilidade Crítica: CPU (${cpuSocket || "indefinido"}) e Placa-mãe (${moboSocket || "indefinido"}) têm sockets diferentes.`);
    }
  }
  if (config.ram && config.motherboard) {
    const moboName = (config.motherboard.name || "").toLowerCase();
    const moboRam = config.motherboard.specs?.ram_type || (moboName.includes("ddr5") ? "DDR5" : moboName.includes("ddr4") ? "DDR4" : undefined);
    const ramType = config.ram.specs?.ram_type || ((config.ram.name || "").toLowerCase().includes("ddr5") ? "DDR5" : (config.ram.name || "").toLowerCase().includes("ddr4") ? "DDR4" : undefined);
    if (!moboRam || !ramType || ramType !== moboRam) {
      errors.push(`Incompatibilidade Crítica: Memória (${ramType || "indefinida"}) não encaixa na Placa-mãe (${moboRam || "indefinida"}).`);
    }
  }
  if (config.psu) {
    const cpuTdp = config.cpu?.specs?.tdp || 65;
    const gpuTdp = config.gpu?.specs?.tdp || 0;
    const totalReq = (cpuTdp + gpuTdp + 100) * 1.3;
    if ((config.psu.specs?.wattage || 0) < totalReq) {
      warnings.push(`Alerta de Energia: A fonte pode estar operando no limite. Recomendado: ${Math.ceil(totalReq)}W.`);
    }
  }
  if (config.case && config.motherboard) {
    const moboFF = config.motherboard.specs?.form_factor;
    if (moboFF && !config.case.specs?.supported_form_factors?.includes(moboFF)) {
      errors.push(`Incompatibilidade Física: A placa-mãe ${moboFF} não cabe no gabinete selecionado.`);
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}
