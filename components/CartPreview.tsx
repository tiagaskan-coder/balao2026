
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag } from "lucide-react";

export default function CartPreview({ onClose }: { onClose?: () => void }) {
  const { items, cartCount, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 p-6 z-50 animate-in fade-in slide-in-from-top-2">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingBag size={48} className="text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Seu carrinho está vazio</p>
          <Link 
            href="/" 
            className="mt-4 text-[#E60012] font-bold text-sm hover:underline"
            onClick={onClose}
          >
            Começar a comprar
          </Link>
        </div>
      </div>
    );
  }

  // Show max 3 items
  const previewItems = items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <span className="font-bold text-gray-800 flex items-center gap-2">
          Meu Carrinho <span className="text-xs bg-[#E60012] text-white px-2 py-0.5 rounded-full">{cartCount}</span>
        </span>
        <span className="text-xs text-gray-500 font-medium">
            Subtotal: {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      {/* Items List */}
      <div className="max-h-[320px] overflow-y-auto">
        {previewItems.map((item) => (
          <div key={item.id} className="flex gap-3 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
            {/* Image */}
            <div className="relative w-16 h-16 bg-white border border-gray-100 rounded-md shrink-0 overflow-hidden">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-1" title={item.name}>
                {item.name}
              </h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">Qtd: {item.quantity}</span>
                <span className="text-sm font-bold text-[#E60012]">
                   {item.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        {hasMore && (
            <div className="text-center mb-3 text-xs text-gray-500">
                E mais {items.length - 3} produto(s)...
            </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
             <Link 
                href="/cart" 
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
                onClick={onClose}
             >
                Ver Carrinho
             </Link>
             <Link 
                href="/cart" 
                className="flex items-center justify-center px-4 py-2 bg-[#E60012] rounded text-white font-bold text-sm hover:bg-[#cc0010] shadow-md transition-all active:scale-95"
                onClick={onClose}
             >
                Finalizar
             </Link>
        </div>
      </div>
    </div>
  );
}
