"use client";

import React, { useState } from "react";
import { Product } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { LayoutGrid, Grid2x2, List, Grid3x3 } from "lucide-react";

type ViewMode = "small" | "large" | "list";

export default function ProductList({ products }: { products: Product[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("small");

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
      <div className="flex justify-end items-center gap-2 px-4 lg:px-0">
        <span className="text-sm text-gray-500 font-medium mr-2">Visualização:</span>
        
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

      {/* Grid */}
      <div className={`grid gap-4 px-4 lg:px-0 pb-10 ${getGridClasses()}`}>
        {products.map((product) => (
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
