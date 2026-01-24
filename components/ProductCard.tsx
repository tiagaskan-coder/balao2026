"use client";

import { Product } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if wrapped in Link
    addToCart(product);
    showToast("Adicionado ao carrinho!");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 flex flex-col h-full group">
      <Link href={`/product/${product.id}`} className="flex-1">
        <div className="relative pt-[100%] bg-gray-50 overflow-hidden">
             <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                priority={false}
                unoptimized
             />
        </div>
        <div className="p-4">
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{product.category || "Hardware"}</div>
            <h3 className="font-medium text-gray-800 line-clamp-2 mb-2 h-10 leading-5" title={product.name}>
                {product.name}
            </h3>
            
            <div className="mt-4">
                <p className="text-xs text-gray-400 line-through">
                    {/* Reverse calculation: product.price is Cash Price (85% of List) */}
                    {(parseFloat(product.price.replace("R$", "").replace(/\./g, "").replace(",", ".")) / 0.85).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
            className="w-full bg-[#E60012] hover:bg-[#cc0010] active:scale-95 transform text-white font-bold py-2 px-4 rounded transition-all flex items-center justify-center gap-2"
        >
            <ShoppingCart size={18} />
            Comprar
        </button>
      </div>
    </div>
  );
}
