"use client";

import { Product } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function RelatedProducts({ 
  currentProduct, 
  allProducts 
}: { 
  currentProduct: Product; 
  allProducts: Product[]; 
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter related products
  // 1. Same Category
  // 2. Similar Price (optional, but good for relevance)
  // 3. Exclude current
  const related = allProducts
    .filter(p => 
        p.id !== currentProduct.id && 
        (p.category === currentProduct.category || p.name.split(' ')[0] === currentProduct.name.split(' ')[0])
    )
    .slice(0, 10); // Limit to 10

  if (related.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = 300;
        scrollContainerRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Produtos Relacionados</h2>
        <div className="flex gap-2">
            <button 
                onClick={() => scroll('left')}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors"
            >
                <ChevronLeft size={20} />
            </button>
            <button 
                onClick={() => scroll('right')}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-600 transition-colors"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {related.map(product => (
            <div key={product.id} className="min-w-[280px] w-[280px] snap-start">
                <ProductCard product={product} />
            </div>
        ))}
      </div>
    </div>
  );
}