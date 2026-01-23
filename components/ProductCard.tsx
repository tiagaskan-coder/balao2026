"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  // Helper to calculate installment price
  const getInstallmentPrice = (priceStr: string) => {
    try {
      // Remove R$, dots, replace comma with dot
      const numeric = parseFloat(
        priceStr
          .replace("R$", "")
          .trim()
          .replace(/\./g, "")
          .replace(",", ".")
      );
      
      if (isNaN(numeric)) return "---";

      const installment = numeric / 12;
      return installment.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (e) {
      return "---";
    }
  };

  const getOriginalPrice = (priceStr: string) => {
     try {
      const numeric = parseFloat(
        priceStr
          .replace("R$", "")
          .trim()
          .replace(/\./g, "")
          .replace(",", ".")
      );
      if (isNaN(numeric)) return "";
      return (numeric * 1.2).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
     } catch (e) {
         return "";
     }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative">
      <Link href={`/product/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-white p-2">
           <Image
             src={product.image}
             alt={product.name}
             fill
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
             className="object-contain group-hover:scale-105 transition-transform duration-300"
           />
        </div>
        <div className="mt-auto">
            <div className="mb-2">
                <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                    {product.category || "Hardware"}
                </span>
            </div>
            <h3 className="text-sm font-medium text-gray-800 line-clamp-3 mb-2 min-h-[3.6rem] hover:text-[#E60012] transition-colors" title={product.name}>
            {product.name}
            </h3>
            <div className="flex flex-col gap-0.5 mb-3">
                <span className="text-xs text-gray-400 line-through">
                    {getOriginalPrice(product.price)}
                </span>
                <div className="text-[#E60012] font-bold text-2xl">
                    {product.price}
                </div>
                <div className="text-xs text-gray-500">
                    à vista no PIX
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    ou 12x de R$ {getInstallmentPrice(product.price)} sem juros
                </div>
            </div>
        </div>
      </Link>
      <button className="w-full bg-[#E60012] text-white py-2.5 rounded-md font-bold uppercase text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm hover:shadow-md">
        <ShoppingCart size={18} />
        Comprar
      </button>
    </div>
  );
}
