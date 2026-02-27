"use client";

import React from "react";
import { Trash2, Minus, Plus, CreditCard, ShoppingCart } from "lucide-react";
import { usePdv, PdvCartItem } from "../store";
import SellerSelector from "./SellerSelector";

export default function CartSidebar() {
  const { state, dispatch, total } = usePdv();
  const { cart, sellerId } = state;

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return;
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: qty } });
  };

  const remove = (id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl w-full max-w-md ml-auto">
      <div className="p-4 border-b border-gray-200 bg-red-600 text-white flex justify-between items-center shadow-md">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart />
          Carrinho de Compras
        </h2>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          {cart.length} itens
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
            <ShoppingCart size={64} className="mb-4 text-gray-300" />
            <p className="text-lg">Seu carrinho está vazio</p>
            <p className="text-sm">Adicione produtos para começar a venda</p>
          </div>
        ) : (
          cart.map((item: PdvCartItem) => (
            <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex gap-3 group hover:border-red-200 transition-colors">
              <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={item.image_url} alt={item.name} className="object-contain w-full h-full mix-blend-multiply" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <h4 className="font-medium text-gray-800 line-clamp-2 text-sm leading-tight group-hover:text-red-600 transition-colors" title={item.name}>{item.name}</h4>
                <div className="flex justify-between items-end mt-2">
                  <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                    <button 
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Unit: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}</p>
                    <p className="font-bold text-red-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => remove(item.id)}
                className="text-gray-400 hover:text-red-500 self-start p-1 transition-colors"
                title="Remover item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="mb-4">
          <SellerSelector 
            selectedSeller={sellerId} 
            onSellerSelect={(id) => dispatch({ type: "SET_SELLER", payload: id })} 
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 font-medium">Subtotal</span>
          <span className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
          </span>
        </div>
        
        <button
          onClick={() => {
            if (!sellerId) {
              alert("Por favor, selecione um vendedor antes de finalizar.");
              return;
            }
            dispatch({ type: "SET_STEP", payload: "customer" });
          }}
          disabled={cart.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <CreditCard size={24} />
          <span className="text-lg">Finalizar Venda</span>
        </button>
      </div>
    </div>
  );
}
