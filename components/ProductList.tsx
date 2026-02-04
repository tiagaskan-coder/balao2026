"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { LayoutGrid, Grid2x2, ArrowUpDown } from "lucide-react";

type ViewMode = "small" | "large" | "list";
type SortMode = "default" | "price-asc" | "price-desc";

export default function ProductList({ 
    products,
    categories,
    searchQuery,
    tags
}: { 
    products: Product[],
    categories?: string[],
    searchQuery?: string,
    tags?: string[]
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("small");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  
  // Client-side sorting
  const sortedProducts = useMemo(() => {
    let result = [...products];

    if (sortMode !== "default") {
      result.sort((a, b) => {
        const priceA = parseFloat(a.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
        const priceB = parseFloat(b.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
        return sortMode === "price-asc" ? priceA - priceB : priceB - priceA;
      });
    }

    return result;
  }, [products, sortMode]);

  const getGridClasses = () => {
    switch (viewMode) {
      case "small":
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5";
      case "large":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3";
      case "list":
        return "grid-cols-1";
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 lg:px-0">
        
        {/* Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 font-medium whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown size={16} /> Ordenar por:
            </span>
            <select 
                value={sortMode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortMode(e.target.value as SortMode)}
                className="bg-white border border-gray-200 text-gray-700 text-sm rounded-md focus:ring-red-500 focus:border-red-500 block w-full p-2 outline-none cursor-pointer hover:border-red-300 transition-colors"
            >
                <option value="default">Relevância</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
            </select>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            
            <span className="text-sm text-gray-500 font-medium mr-2 hidden sm:inline">Visualização:</span>
            
            <button
            onClick={() => setViewMode("small")}
            className={`p-2 rounded-md transition-all ${
                viewMode === "small" 
                ? "bg-[#E60012] text-white shadow-md" 
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
            title="Menores (Grade Compacta)"
            >
            <LayoutGrid size={20} />
            </button>

            <button
            onClick={() => setViewMode("large")}
            className={`p-2 rounded-md transition-all ${
                viewMode === "large" 
                ? "bg-[#E60012] text-white shadow-md" 
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
            title="Grandes (Grade Expandida)"
            >
            <Grid2x2 size={20} />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid gap-6 ${getGridClasses()}`}>
        {sortedProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            variant={viewMode === "list" ? "list" : "grid"}
          />
        ))}
      </div>

      {/* Footer message */}
      <div className="h-20 w-full flex justify-center items-center mt-4">
           {products.length > 0 && <span className="text-gray-300 text-sm">Mostrando todos os {products.length} produtos.</span>}
      </div>
    </div>
  );
}