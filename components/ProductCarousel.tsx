"use client";

import React, { useRef } from "react";
import { Product } from "@/lib/utils";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProductCarouselProps {
  title: string;
  products: Product[];
  categoryId?: string;
}

export default function ProductCarousel({ title, products, categoryId }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4 lg:px-0">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex gap-2">
            {categoryId && (
                <Link 
                    href={`/?category=${encodeURIComponent(categoryId)}`}
                    className="text-sm text-[#E60012] hover:underline font-medium mr-4 flex items-center"
                >
                    Ver todos
                </Link>
            )}
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-gray-600"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 text-gray-600"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 px-4 lg:px-0 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-none w-[200px] md:w-[240px] snap-start">
            <ProductCard product={product} variant="grid" />
          </div>
        ))}
      </div>
    </div>
  );
}
