"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Product } from "@/lib/utils";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { LayoutGrid, Grid2x2, ArrowUpDown } from "lucide-react";

type ViewMode = "small" | "large" | "list";
type SortMode = "default" | "price-asc" | "price-desc";

export default function ProductList({ 
    products: initialProducts,
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
  
  // Products state - initialized with server data
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  // Update products when initial props change (e.g. navigation)
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    // If initial products < 20, probably no more products
    setHasMore(initialProducts.length >= 20);
  }, [initialProducts, categories, searchQuery, tags]);

  const loadMore = useCallback(async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      
      try {
          const nextPage = page + 1;
          const params = new URLSearchParams();
          params.set('page', nextPage.toString());
          params.set('limit', '20'); // Fetch 20 more
          
          if (categories && categories.length > 0) {
              categories.forEach(c => params.append('category', c));
          }
          
          if (searchQuery) params.set('search', searchQuery);

          if (tags && tags.length > 0) {
              params.set('tags', tags.join(','));
          }
          
          const res = await fetch(`/api/products?${params.toString()}`);
          if (!res.ok) throw new Error("Failed to fetch");
          
          const data = await res.json();
          
          // Handle both array response (legacy) and object response (paginated)
          let newProducts: Product[] = [];
          let serverHasMore = false;

          if (Array.isArray(data)) {
              newProducts = data;
              serverHasMore = newProducts.length >= 20; // Guessing
          } else {
              newProducts = data.products || [];
              serverHasMore = data.hasMore;
          }
          
          if (newProducts.length > 0) {
              setProducts(prev => {
                  // Avoid duplicates
                  const existingIds = new Set(prev.map(p => p.id));
                  const uniqueNew = newProducts.filter((p: Product) => !existingIds.has(p.id));
                  return [...prev, ...uniqueNew];
              });
              setPage(nextPage);
              setHasMore(serverHasMore);
          } else {
              setHasMore(false);
          }
      } catch (err) {
          console.error("Error loading more products:", err);
          setHasMore(false);
      } finally {
          setLoading(false);
      }
  }, [page, loading, hasMore, categories, searchQuery, tags]);

  useEffect(() => {
      const observer = new IntersectionObserver(
          entries => {
              if (entries[0].isIntersecting && hasMore && !loading) {
                  loadMore();
              }
          },
          { threshold: 0.1, rootMargin: '200px' } // Load 200px before end
      );

      if (observerTarget.current) {
          observer.observe(observerTarget.current);
      }

      return () => {
          if (observerTarget.current) {
              observer.unobserve(observerTarget.current);
          }
      };
  }, [loadMore, hasMore, loading]);

  // Client-side sorting for current list
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
        
        {/* Skeletons when loading */}
        {loading && (
             Array.from({ length: viewMode === "small" ? 5 : 3 }).map((_, i) => (
                 <ProductSkeleton key={`skeleton-${i}`} />
             ))
        )}
      </div>

      {/* Observer Target */}
      <div ref={observerTarget} className="h-20 w-full flex justify-center items-center mt-4">
           {!hasMore && products.length > 0 && <span className="text-gray-300 text-sm">Você viu todos os produtos.</span>}
      </div>
    </div>
  );
}
