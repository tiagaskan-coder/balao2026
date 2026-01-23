"use client";

import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    // Generate WhatsApp message
    const message = `Olá! Gostaria de finalizar meu pedido no Balão da Informática:\n\n${items
      .map(
        (item) =>
          `* ${item.quantity}x ${item.name} - ${item.price}`
      )
      .join("\n")}\n\n*Total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}*`;

    // Replace with actual number if available, or just a placeholder
    const phoneNumber = "5511999999999"; 
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ShoppingBag className="text-[#E60012]" />
            Carrinho de Compras
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <ShoppingBag size={40} />
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-6">Aproveite nossas ofertas e adicione produtos incríveis!</p>
            <Link 
                href="/" 
                className="inline-flex items-center gap-2 bg-[#E60012] text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-colors"
            >
                Continuar Comprando
                <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 border-b pb-6 last:border-0 last:pb-0">
                                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="font-bold text-[#E60012]">{item.price}</div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center border rounded-md">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1 hover:bg-gray-100 text-gray-600"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:bg-gray-100 text-gray-600"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="w-full lg:w-96">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Resumo do Pedido</h3>
                    
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} itens)</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Frete</span>
                            <span className="text-green-600">Grátis</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        className="w-full bg-[#00B140] text-white py-3 rounded-md font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 mb-3"
                    >
                        Finalizar pelo WhatsApp
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    </button>
                    
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    >
                        Continuar Comprando
                    </button>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
