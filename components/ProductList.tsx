"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { LayoutGrid, Grid2x2, List, ArrowUpDown, Filter } from "lucide-react";

type ViewMode = "small" | "large" | "list";
type SortMode = "default" | "price-asc" | "price-desc";

export default function ProductList({ products }: { products: Product[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("small");
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const sortedProducts = useMemo(() => {
    if (sortMode === "default") return products;

    return [...products].sort((a, b) => {
      const priceA = parseFloat(a.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
      const priceB = parseFloat(b.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());

      return sortMode === "price-asc" ? priceA - priceB : priceB - priceA;
    });
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
            
            {/* Price Filter */}
            <div className="relative">
                <button 
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className={`p-2 rounded-md transition-all flex items-center gap-2 ${
                        showPriceFilter || (minPrice || maxPrice)
                        ? "bg-white text-[#E60012] border border-[#E60012]" 
                        : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                    }`}
                    title="Filtrar por Preço"
                >
                    <Filter size={20} />
                    <span className="hidden sm:inline text-sm font-medium">Preço</span>
                </button>
                
                {showPriceFilter && (
                    <div className="absolute top-full right-0 mt-2 bg-white p-4 rounded-lg shadow-xl border border-gray-100 z-50 w-64">
                        <h4 className="font-bold text-gray-700 mb-3 text-sm">Faixa de Preço (R$)</h4>
                        <div className="flex items-center gap-2 mb-3">
                            <input 
                                type="number" 
                                placeholder="Min" 
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:border-[#E60012] outline-none"
                            />
                            <span className="text-gray-400">-</span>
                            <input 
                                type="number" 
                                placeholder="Max" 
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-sm focus:border-[#E60012] outline-none"
                            />
                        </div>
                        <button 
                            onClick={() => setShowPriceFilter(false)}
                            className="w-full bg-[#E60012] text-white py-2 rounded text-sm font-bold hover:bg-red-700 transition-colors"
                        >
                            Aplicar
                        </button>
                    </div>
                )}
            </div>

            <div className="w-px h-8 bg-gray-200 mx-2 hidden sm:block"></div>

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

            <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-all ${
                viewMode === "list" 
                ? "bg-[#E60012] text-white shadow-md" 
                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
            }`}
            title="Lista"
            >
            <List size={20} />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid gap-6 ${getGridClasses()}`}>
        {filteredAndSortedProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            variant={viewMode === "list" ? "list" : "grid"}
          />
        ))}
      </div>
    </div>
  );
}
