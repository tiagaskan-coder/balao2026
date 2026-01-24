"use client";

import { useState, useEffect, useMemo } from "react";
import { Product, CarouselImage, Category } from "@/lib/utils";
import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";
import Carousel from "@/components/Carousel";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

interface StoreContainerProps {
  initialProducts: Product[];
  categories: Category[];
  carouselImages: CarouselImage[];
}

export default function StoreContainer({ 
  initialProducts, 
  categories, 
  carouselImages 
}: StoreContainerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL Params
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");
  
  // Filter States
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Helper to parse price
  const parsePrice = (priceStr: string) => {
    try {
        return parseFloat(priceStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
    } catch {
        return 0;
    }
  };

  // Derive Data
  const { brands, minPrice, maxPrice } = useMemo(() => {
    let min = Infinity;
    let max = 0;
    const uniqueBrands = new Set<string>();

    initialProducts.forEach(p => {
        const price = parsePrice(p.price);
        if (price < min) min = price;
        if (price > max) max = price;
        
        // Simple heuristic: First word is brand
        // You might want to refine this list manually or with a better heuristic
        const brand = p.name.split(" ")[0].trim(); 
        if (brand.length > 2) uniqueBrands.add(brand);
    });

    return {
        brands: Array.from(uniqueBrands).sort(),
        minPrice: min === Infinity ? 0 : min,
        maxPrice: max === 0 ? 1000 : max
    };
  }, [initialProducts]);

  // Initialize Price Range once
  useEffect(() => {
     setPriceRange([minPrice, maxPrice]);
  }, [minPrice, maxPrice]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
        const price = parsePrice(p.price);
        
        // Category Filter
        if (categoryParam && categoryParam !== "Todos os Produtos" && p.category !== categoryParam) {
            return false;
        }

        // Search Filter
        if (searchParam && !p.name.toLowerCase().includes(searchParam.toLowerCase())) {
            return false;
        }

        // Price Filter
        if (price < priceRange[0] || price > priceRange[1]) {
            return false;
        }

        // Brand Filter
        if (selectedBrands.length > 0) {
            const brand = p.name.split(" ")[0].trim();
            if (!selectedBrands.includes(brand)) return false;
        }

        return true;
    });
  }, [initialProducts, categoryParam, searchParam, priceRange, selectedBrands]);

  // Handlers
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
        prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([minPrice, maxPrice]);
    router.push("/");
  };

  return (
    <div className="flex container mx-auto flex-1 py-6 gap-6 relative">
      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="bg-[#E60012] text-white p-3 rounded-full shadow-lg flex items-center gap-2"
        >
            <SlidersHorizontal size={20} />
            Filtros
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Wrapper) */}
      <div className={`
        fixed inset-0 z-50 bg-black/50 lg:hidden transition-opacity
        ${isMobileFiltersOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `} onClick={() => setIsMobileFiltersOpen(false)} />

      <div className={`
        lg:block
        fixed lg:static inset-y-0 left-0 z-50 w-80 lg:w-64 bg-white lg:bg-transparent shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isMobileFiltersOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
          <div className="lg:hidden p-4 flex justify-between items-center border-b">
              <h2 className="font-bold text-lg">Filtros</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)}><X size={24} /></button>
          </div>
          
          <Sidebar 
            categories={categories} 
            brands={brands}
            selectedBrands={selectedBrands}
            onBrandToggle={handleBrandToggle}
            priceRange={priceRange}
            minMaxPrice={[minPrice, maxPrice]}
            onPriceChange={handlePriceChange}
          />
      </div>

      <main className="flex-1 w-full min-w-0">
        {/* Carousel Banner (Only on Home/No Search) */}
        {!searchParam && !categoryParam && (
            <div className="mb-6 px-4 lg:px-0">
                {carouselImages.length > 0 ? (
                    <Carousel images={carouselImages} />
                ) : (
                    <div className="w-full h-48 md:h-64 bg-gradient-to-r from-[#E60012] to-red-800 rounded-lg flex items-center justify-center text-white text-3xl font-bold shadow-md">
                        Ofertas Imperdíveis
                    </div>
                )}
            </div>
        )}

        {/* Header Results */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 px-4 lg:px-0 gap-4">
            <div>
                <h1 className="text-xl font-bold text-gray-800">
                    {categoryParam || (searchParam ? `Resultados para: "${searchParam}"` : "Destaques")}
                </h1>
                <span className="text-sm text-gray-500">{filteredProducts.length} produtos encontrados</span>
            </div>
            
            {(selectedBrands.length > 0 || priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                <button 
                    onClick={clearFilters}
                    className="text-sm text-[#E60012] hover:underline flex items-center gap-1"
                >
                    <X size={14} />
                    Limpar Filtros
                </button>
            )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm mx-4 lg:mx-0">
            <p className="text-xl font-medium">Nenhum produto encontrado com os filtros selecionados.</p>
            {initialProducts.length === 0 && (
                <p className="mt-4 text-sm bg-blue-50 text-blue-700 inline-block px-4 py-2 rounded-md">
                    Dica: Configure as chaves do Supabase no .env.local e acesse a área administrativa.
                </p>
            )}
            </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 px-4 lg:px-0 pb-10">
            {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
        )}
      </main>
    </div>
  );
}