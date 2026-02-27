"use client";

import React, { useState } from "react";
import { usePdv } from "../store";
import { Trash2, Minus, Plus, CreditCard, User, ShoppingCart } from "lucide-react";
import CustomerForm from "./CustomerForm";
import PaymentModal from "./PaymentModal";

export default function CartSidebar() {
  const { state, dispatch } = usePdv();
  const [showPayment, setShowPayment] = useState(false);

  const total = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleQuantity = (id: string, current: number, delta: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity: current + delta } });
  };

  const handleRemove = (id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: id });
  };

  const handleCheckout = () => {
    if (state.cart.length === 0) return;
    dispatch({ type: "SET_STEP", payload: "customer" });
  };

  if (state.step === "customer") {
    return <CustomerForm onBack={() => dispatch({ type: "SET_STEP", payload: "cart" })} onNext={() => setShowPayment(true)} />;
  }
  
  // Se payment modal estiver separado, ou renderizado condicionalmente
  if (showPayment || state.step === "payment") {
      return <PaymentModal onBack={() => {
          setShowPayment(false);
          dispatch({ type: "SET_STEP", payload: "customer" });
      }} />;
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl w-full max-w-md ml-auto">
      <div className="p-4 border-b border-gray-200 bg-blue-600 text-white flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ShoppingCart size={20} />
          Carrinho de Compras
        </h2>
        <span className="bg-blue-500 px-2 py-1 rounded text-xs font-mono">
          {state.cart.length} itens
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
            <ShoppingCart size={48} className="mb-4" />
            <p>Seu carrinho está vazio</p>
          </div>
        ) : (
          state.cart.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 relative group">
              <div className="w-16 h-16 bg-white rounded flex items-center justify-center p-1 border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{item.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 bg-white rounded border border-gray-200 px-1">
                    <button 
                      onClick={() => handleQuantity(item.id, item.quantity, -1)}
                      className="p-1 hover:text-blue-600 disabled:opacity-30"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantity(item.id, item.quantity, 1)}
                      className="p-1 hover:text-blue-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleRemove(item.id)}
                className="absolute -top-2 -right-2 bg-white text-red-500 p-1 rounded-full shadow border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>Total</span>
            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
          </div>
        </div>
        
        <button
          onClick={handleCheckout}
          disabled={state.cart.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <User size={20} />
          Identificar Cliente
        </button>
      </div>
    </div>
  );
}
