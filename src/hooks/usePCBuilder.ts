import React from "react";
import { Product, Category } from "@/lib/utils";
import { accessoryIds, PCConfig, Step, TechProduct, ValidationResult } from "@/src/types/pcBuilder";
import { normalizeText, parsePrice, enrichProduct, checkCompatibility, validateBuild } from "@/src/utils/pcBuilderUtils";
import { STEPS } from "@/src/types/pcBuilder";
import { searchProducts } from "@/lib/searchUtils";

export function usePCBuilder(initialProducts: Product[], categories: Category[]) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [minPrice, setMinPrice] = React.useState<string>("");
  const [maxPrice, setMaxPrice] = React.useState<string>("");
  const [config, setConfig] = React.useState<PCConfig>({ cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null });
  const [extras, setExtras] = React.useState<Record<string, { product: TechProduct; quantity: number }[]>>({ licenses: [], monitor: [], keyboard: [], mouse: [], headset: [], netadapters: [], peripherals: [], chairs: [] });

  const products = React.useMemo(() => initialProducts.map(p => enrichProduct(p)), [initialProducts]);
  const currentStep: Step = STEPS[currentStepIndex];

  const prerequisitesSatisfied = React.useCallback((stepId: string, cfg: PCConfig) => {
    if (stepId === "motherboard") return !!cfg.cpu;
    if (stepId === "storage") return !!cfg.motherboard;
    if (stepId === "ram") return !!cfg.motherboard;
    if (stepId === "gpu") return !!cfg.motherboard;
    if (stepId === "psu") return !!cfg.cpu;
    if (stepId === "case") return !!cfg.motherboard;
    return true;
  }, []);

  const blockedByPrereq = !prerequisitesSatisfied(currentStep.id, config);

  React.useEffect(() => { setSearchTerm(""); }, [currentStepIndex]);

  const stepProducts = React.useMemo(() => {
    if (!prerequisitesSatisfied(currentStep.id, config)) return [];
    const potentialParents = [currentStep.parentSlug, ...((currentStep.parentSlugs || []))];
    const parentCat = categories.find(c => potentialParents.includes(c.slug) || potentialParents.includes(c.name.toLowerCase()));
    let allowedCategoryIds: string[] = [];
    let allowedNames: string[] = [];
    let allowedSlugs: string[] = currentStep.targetSlugs || [];
    if (parentCat) {
      const subCategories = categories.filter(c => c.parent_id === parentCat.id);
      const matches = subCategories.filter(sub => currentStep.targetSlugs?.some(slug => sub.slug === slug));
      allowedCategoryIds = matches.map(m => m.id);
      allowedNames = matches.map(m => m.name.toLowerCase());
    }
    const categoriesByNameNorm = new Map<string, Category>();
    categories.forEach(c => categoriesByNameNorm.set(normalizeText(c.name), c));
    const categoriesBySlug = new Map<string, Category>();
    categories.forEach(c => categoriesBySlug.set(c.slug, c));
    const filtered = products.filter((p: TechProduct) => {
      const normalizedProductCat = normalizeText(p.category);
      const normalizedProductName = normalizeText(p.name || "");
      const catObj = categoriesByNameNorm.get(normalizedProductCat) || categoriesBySlug.get(p.category) || categories.find(c => normalizeText(c.slug) === normalizedProductCat);
      const strictNames = allowedNames.map(n => normalizeText(n));
      const strictSlugs = (allowedSlugs || []).map(s => normalizeText(s));
      const nameMatchStrict = strictNames.length > 0 && strictNames.includes(normalizedProductCat);
      const slugMatchStrict = strictSlugs.length > 0 && strictSlugs.includes(normalizedProductCat);
      const idMatchStrict = !!(catObj && allowedCategoryIds.includes(catObj.id));
      const baseMatch = nameMatchStrict || slugMatchStrict || idMatchStrict;
      if (!baseMatch) {
        const nameMatchesStep = currentStep.categoryKeywords.some(k => normalizedProductName.includes(normalizeText(k)));
        if (!nameMatchesStep) return false;
      }
      if (currentStep.filterKeywords && !currentStep.filterKeywords.some(k => normalizedProductName.includes(normalizeText(k)))) return false;
      if (currentStep.id !== "storage") {
        const storageTerms = ["ssd","hd","nvme","m2","m.2","sata","disco","armazenamento"];
        const hasStorageTerm = storageTerms.some(t => normalizedProductName.includes(normalizeText(t)));
        if (hasStorageTerm) return false;
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
      const min = parseFloat(minPrice.replace(/\./g, "").replace(",", "."));
      const max = parseFloat(maxPrice.replace(/\./g, "").replace(",", "."));
      const hasMin = minPrice !== "" && !isNaN(min);
      const hasMax = maxPrice !== "" && !isNaN(max);
      const priceVal = parsePrice(p.price);
      if (hasMin && priceVal < min) return false;
      if (hasMax && priceVal > max) return false;
      return true;
    });
    let result = filtered;
    if (searchTerm) result = searchProducts(result, searchTerm);
    result = result.sort((a: TechProduct, b: TechProduct) => parsePrice(a.price) - parsePrice(b.price));
    return result.map((product: TechProduct) => {
      const status = checkCompatibility(product, config, currentStep.id);
      return { product, status };
    }).filter(({ status }) => status.valid);
  }, [products, currentStep, config, searchTerm, categories, minPrice, maxPrice, prerequisitesSatisfied]);

  const handleSelect = React.useCallback((product: TechProduct, isValid: boolean) => {
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
    setConfig(prev => ({ ...prev, [currentStep.id]: product }));
    if (currentStepIndex < STEPS.length - 1) setTimeout(() => setCurrentStepIndex(prev => prev + 1), 300);
  }, [currentStep, currentStepIndex]);

  const handleRemove = React.useCallback((stepId: keyof PCConfig) => {
    setConfig(prev => ({ ...prev, [stepId]: null }));
    const stepIdx = STEPS.findIndex(s => s.id === stepId);
    if (stepIdx !== -1) setCurrentStepIndex(stepIdx);
  }, []);

  const clearExtrasForStep = React.useCallback((stepId: string) => {
    setExtras(prev => ({ ...prev, [stepId]: [] }));
    const stepIdx = STEPS.findIndex(s => s.id === stepId);
    if (stepIdx !== -1) setCurrentStepIndex(stepIdx);
  }, []);

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
  const validationResult: ValidationResult = validateBuild(config);
  const isComplete = Object.values(config).every(v => v !== null);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return {
    STEPS,
    currentStepIndex,
    setCurrentStepIndex,
    currentStep,
    prerequisitesSatisfied,
    blockedByPrereq,
    searchTerm,
    setSearchTerm,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    config,
    setConfig,
    extras,
    setExtras,
    stepProducts,
    handleSelect,
    handleRemove,
    clearExtrasForStep,
    totalPrice,
    formatCurrency,
    validationResult,
    isComplete
  };
}
