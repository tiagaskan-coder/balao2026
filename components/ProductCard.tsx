"use client";

import { Product } from "@/lib/utils";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if wrapped in Link
    addToCart(product);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex flex-col h-full group">
      <Link href={`/product/${product.id}`} className="flex-1">
        <div className="relative pt-[100%] bg-gray-50 overflow-hidden">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img
                src={product.image}
                alt={product.name}
                className="absolute top-0 left-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
             />
        </div>
        <div className="p-4">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.category || "Hardware"}</div>
            <h3 className="font-medium text-gray-800 line-clamp-2 mb-2 h-10 leading-5" title={product.name}>
                {product.name}
            </h3>
            
            <div className="mt-4">
                <p className="text-xs text-gray-400 line-through">
                    {/* Fake original price calculation for visual effect */}
                    R$ {(parseFloat(product.price.replace("R$", "").replace(/\./g, "").replace(",", ".")) * 1.2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-[#E60012]">R$</span>
                    <span className="text-2xl font-extrabold text-[#E60012]">
                        {product.price.replace("R$", "").trim()}
                    </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                    à vista no PIX
                </p>
            </div>
        </div>
      </Link>
      
      <div className="p-4 pt-0 mt-auto">
        <button 
            onClick={handleAddToCart}
            className="w-full bg-[#0033C6] hover:bg-blue-800 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
        >
            <ShoppingCart size={18} />
            Comprar
        </button>
      </div>
    </div>
  );
}
