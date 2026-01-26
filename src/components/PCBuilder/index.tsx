"use client";
import React from "react";
import { Product, Category } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import StepSidebar from "./StepSidebar";
import ValidationChecklist from "./ValidationChecklist";
import PriceSummary from "./PriceSummary";
import SearchFilters from "./SearchFilters";
import ProductGrid from "./ProductGrid";
import { usePCBuilder } from "@/src/hooks/usePCBuilder";
import { accessoryIds } from "@/src/types/pcBuilder";

type Props = { products: Product[]; categories: Category[] };

export default function PCBuilder({ products, categories }: Props) {
  const {
    STEPS,
    currentStepIndex,
    setCurrentStepIndex,
    currentStep,
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
    stepProducts,
    handleSelect,
    handleRemove,
    clearExtrasForStep,
    totalPrice,
    formatCurrency,
    validationResult,
    isComplete
  } = usePCBuilder(products, categories);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!validationResult.valid) {
      alert("Corrija os erros de compatibilidade antes de adicionar ao carrinho.");
      return;
    }
    Object.values(config).forEach(item => { if (item) addToCart(item); });
    Object.entries(extras).forEach(([_, list]) => { list.forEach(x => { for (let i = 0; i < x.quantity; i++) addToCart(x.product); }); });
    alert("Setup adicionado ao carrinho com sucesso!");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/3 space-y-6">
        <StepSidebar
          currentStepIndex={currentStepIndex}
          setCurrentStepIndex={setCurrentStepIndex}
          config={config}
          extras={extras}
          handleRemove={handleRemove}
          clearExtrasForStep={clearExtrasForStep}
        />
        <ValidationChecklist validationResult={validationResult} isComplete={isComplete} />
        <PriceSummary
          totalPrice={totalPrice}
          formatCurrency={formatCurrency}
          isComplete={isComplete}
          validationValid={validationResult.valid}
          onAddToCart={handleAddToCart}
          onClear={() => { setConfig({ cpu: null, motherboard: null, ram: null, gpu: null, storage: null, psu: null, case: null }); }}
          showPSULink={currentStep.id === "psu"}
        />
      </div>
      <div className="w-full lg:w-2/3">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Escolha seu {currentStep.label}</h1>
            <p className="text-gray-500">
              Selecione um componente compatível abaixo. O sistema verifica automaticamente a compatibilidade.
            </p>
            <SearchFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              placeholder={`Buscar ${currentStep.label.toLowerCase()}...`}
            />
          </div>
          {blockedByPrereq || stepProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-3">!</div>
              <h3 className="text-lg font-medium text-gray-900">
                {blockedByPrereq ? "Selecione o componente anterior para continuar" : "Nenhum produto compatível encontrado"}
              </h3>
            </div>
          ) : (
            <ProductGrid
              items={stepProducts}
              currentStepId={currentStep.id}
              selectedId={(config[currentStep.id as keyof typeof config] as any)?.id || null}
              extrasForStep={extras[currentStep.id] || []}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
