"use client";

import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, Truck, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    city: "",
    state: ""
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalizeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const orderData = {
            customer: {
                ...formData
            },
            items: items.map(item => {
                 // Parse price string to number for consistency with API expectation
                 const priceStr = item.price.replace("R$", "").replace(/\./g, "").replace(",", ".");
                 const price = parseFloat(priceStr) || 0;
                 return {
                    name: item.name,
                    image: item.image,
                    quantity: item.quantity,
                    price: price
                 };
            }),
            total: cartTotal
        };

        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            clearCart();
            router.push('/thank-you');
        } else {
            alert("Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.");
            console.error("Order failed:", result);
        }
    } catch (error) {
        console.error("Error submitting order:", error);
        alert("Erro de conexão. Verifique sua internet.");
    } finally {
        setLoading(false);
    }
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
            {/* Left Column: Items & Form */}
            <div className="flex-1 space-y-6">
                {/* Cart Items */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Itens do Pedido</h2>
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 border-b pb-6 last:border-0 last:pb-0">
                                    <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="font-bold text-[#E60012]">{item.price}</div>
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border rounded-md">
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:bg-gray-100 text-gray-600"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:bg-gray-100 text-gray-600"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                        <Truck className="text-[#E60012]" size={20} />
                        Dados para Entrega e Contato
                    </h2>
                    
                    <form id="checkout-form" onSubmit={handleFinalizeOrder} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent"
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (WhatsApp) *</label>
                                <input 
                                    type="text" 
                                    name="phone" 
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input 
                                type="email" 
                                name="email" 
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                                <input 
                                    type="text" 
                                    name="cep" 
                                    required
                                    value={formData.cep}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent"
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Rua, Av) *</label>
                                <input 
                                    type="text" 
                                    name="address" 
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent"
                                    placeholder="Nome da rua"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                                <input 
                                    type="text" 
                                    name="number" 
                                    required
                                    value={formData.number}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent"
                                    placeholder="123"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                                <input 
                                    type="text" 
                                    name="complement" 
                                    value={formData.complement}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent"
                                    placeholder="Apto, Bloco, etc."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                                <input 
                                    type="text" 
                                    name="city" 
                                    required
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent"
                                    placeholder="Cidade"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF) *</label>
                                <input 
                                    type="text" 
                                    name="state" 
                                    required
                                    maxLength={2}
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent uppercase"
                                    placeholder="SP"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Summary */}
            <div className="w-full lg:w-96">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <CreditCard className="text-[#E60012]" size={20} />
                        Resumo
                    </h3>
                    
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
                        type="submit"
                        form="checkout-form"
                        disabled={loading}
                        className="w-full bg-[#E60012] text-white py-3 rounded-md font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 mb-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processando...' : 'Finalizar Pedido'}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                    
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    >
                        Continuar Comprando
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-4">
                        Ao finalizar o pedido, você receberá um e-mail de confirmação.
                    </p>
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
