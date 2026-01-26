import { Product, Category } from "@/lib/utils";
import { Cpu, CircuitBoard, MemoryStick, Box, Zap, HardDrive, Monitor, Key, Keyboard, Mouse, Network, Armchair, Headphones } from "lucide-react";

export type PCSpecs = {
  socket?: string;
  tdp?: number;
  ram_type?: string;
  form_factor?: string;
  supported_form_factors?: string[];
  wattage?: number;
  slots_ram?: number;
  max_memory?: number;
  has_m2?: boolean;
  pcie_x16?: boolean;
};

export type TechProduct = Product & { specs?: PCSpecs };

export type PCConfig = {
  cpu: TechProduct | null;
  motherboard: TechProduct | null;
  ram: TechProduct | null;
  gpu: TechProduct | null;
  storage: TechProduct | null;
  psu: TechProduct | null;
  case: TechProduct | null;
};

export type CompatibilityStatus = { valid: boolean; messages: string[] };
export type ValidationResult = { valid: boolean; errors: string[]; warnings: string[] };

export type Step = {
  id: string;
  label: string;
  icon: any;
  categoryKeywords: string[];
  targetSlugs?: string[];
  parentSlug: string;
  parentSlugs?: string[];
  filterKeywords?: string[];
};

export const STEPS: Step[] = [
  { id: "cpu", label: "Processador", icon: Cpu, categoryKeywords: ["processador", "cpu"], targetSlugs: ["processadores", "processadores-cpu"], parentSlug: "hardware" },
  { id: "motherboard", label: "Placa-mãe", icon: CircuitBoard, categoryKeywords: ["placa-mãe", "placa mae", "motherboard", "placas-mãe", "placas-mae", "placa-mae"], targetSlugs: ["placas-mae", "placas-mãe", "placa-mae"], parentSlug: "hardware" },
  { id: "storage", label: "Armazenamento", icon: HardDrive, categoryKeywords: ["ssd", "hd", "disco", "armazenamento", "nvme", "sata"], targetSlugs: ["ssd-hd-nvme", "ssd", "hd"], parentSlug: "hardware" },
  { id: "ram", label: "Memória RAM", icon: MemoryStick, categoryKeywords: ["memória ram", "memoria ram", "ram"], targetSlugs: ["memoria-ram"], parentSlug: "hardware" },
  { id: "gpu", label: "Placa de Vídeo", icon: Monitor, categoryKeywords: ["placa de vídeo", "placa de video", "gpu", "rtx", "rx", "gtx"], targetSlugs: ["placas-de-video", "placas-de-video-gpu", "placa-de-video"], parentSlug: "hardware" },
  { id: "psu", label: "Fonte", icon: Zap, categoryKeywords: ["fonte", "alimentação", "psu"], targetSlugs: ["fontes-alimentacao", "fontes-de-alimentacao", "fontes"], parentSlug: "hardware" },
  { id: "case", label: "Gabinete", icon: Box, categoryKeywords: ["gabinete", "case", "torre"], targetSlugs: ["gabinetes", "gabinete"], parentSlug: "hardware" },
  { id: "licenses", label: "Licenças", icon: Key, categoryKeywords: ["licenças", "licencas", "windows", "office"], targetSlugs: ["licencas", "windows", "microsoft-office", "antivirus", "softwares-design", "softwares-edicao"], parentSlug: "licencas" },
  { id: "monitor", label: "Monitores", icon: Monitor, categoryKeywords: ["monitor"], targetSlugs: ["monitores","monitor-gamer","monitor-curvo","monitor-profissional","monitor-ultrawide","monitor-4k"], parentSlug: "monitores", parentSlugs: ["monitores","monitores-displays"] },
  { id: "keyboard", label: "Teclados", icon: Keyboard, categoryKeywords: ["teclado"], targetSlugs: ["teclados-gamer-mecanicos","teclados"], parentSlug: "perifericos" },
  { id: "mouse", label: "Mouses", icon: Mouse, categoryKeywords: ["mouse"], targetSlugs: ["mouses-gamer","mouses"], parentSlug: "perifericos" },
  { id: "headset", label: "Fones de Ouvido", icon: Headphones, categoryKeywords: ["fone", "headset", "headphone"], targetSlugs: ["headsets-fones","fones-ouvido"], parentSlug: "perifericos" },
  { id: "netadapters", label: "Adaptadores de Rede", icon: Network, categoryKeywords: ["rede","wifi","ethernet","lan"], targetSlugs: ["adaptadores-conversores"], parentSlug: "acessorios", filterKeywords: ["rede","wifi","ethernet","lan","pci","usb","adaptador","conversor"] },
  { id: "peripherals", label: "Outros Periféricos", icon: Box, categoryKeywords: ["webcam","microfone","mousepad","controle","joystick","volante"], targetSlugs: ["perifericos","webcams","microfones","mousepads","controles-joysticks","volantes-simuladores"], parentSlug: "perifericos" },
  { id: "chairs", label: "Cadeiras", icon: Armchair, categoryKeywords: ["cadeira"], targetSlugs: ["cadeiras-gamer","cadeiras-ergonomicas"], parentSlug: "escritorio" },
];

export const accessoryIds = new Set(["licenses","monitor","keyboard","mouse","headset","netadapters","peripherals","chairs"]);
