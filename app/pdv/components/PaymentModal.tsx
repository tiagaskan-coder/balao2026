"use client";

import React, { useState } from "react";
import { X, CreditCard, Banknote, QrCode, Printer, CheckCircle, AlertTriangle } from "lucide-react";
import { usePdv } from "../store";
import { createOrder } from "../actions";

export default function PaymentModal() {
  const { state, dispatch, total } = usePdv();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const handlePayment = async (method: string) => {
    setLoading(true);
    setError("");

    try {
      // Simulação de processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const res = await createOrder({
        customer: state.customer,
        items: state.cart,
        total: total,
        paymentMethod: method,
        origin: "pdv",
        sellerId: state.sellerId
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      setOrderId(res.orderId);
      setSuccess(true);
      
      // Se for Pix, poderia gerar o QR Code aqui
      // Se for Térmica, disparar impressão
      if (method === "pix") {
         // Lógica de Pix
      }

    } catch (err: any) {
      setError(err.message || "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = () => {
    dispatch({ type: "RESET" });
  };

  if (success) {
    return (
      <div className="absolute inset-0 z-50 bg-gray-900/50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Venda Finalizada!</h2>
            <p className="text-gray-600 mb-8">O pedido #{orderId} foi registrado com sucesso.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handlePrint}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-gray-100 transition-all hover:border-gray-200 group"
              >
                <Printer className="w-8 h-8 text-gray-600 mb-2 group-hover:text-gray-900" />
                <span className="font-medium text-gray-900">Imprimir Cupom</span>
              </button>
              
              <button 
                onClick={handleNewSale}
                className="flex flex-col items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-xl border-2 border-red-100 transition-all hover:border-red-200 group"
              >
                <ShoppingCart className="w-8 h-8 text-red-600 mb-2 group-hover:text-red-700" />
                <span className="font-medium text-red-900">Nova Venda</span>
              </button>
            </div>
          </div>
          
          {/* Área de impressão oculta (apenas para window.print) */}
          <div className="hidden print:block fixed inset-0 bg-white p-0">
             <div className="w-[80mm] mx-auto p-2 font-mono text-xs">
                <div className="text-center mb-4">
                  <h1 className="font-bold text-lg">BALÃO DA INFORMÁTICA</h1>
                  <p>Rua Exemplo, 123 - Centro</p>
                  <p>CNPJ: 34.397.947/0001-08</p>
                  <p>{new Date().toLocaleString()}</p>
                </div>
                <div className="border-b border-black mb-2">
                  <p>Cliente: {state.customer.name || "Consumidor Final"}</p>
                  {state.customer.cpf_cnpj && <p>CPF/CNPJ: {state.customer.cpf_cnpj}</p>}
                </div>
                <div className="border-b border-black mb-2"></div>
                <table className="w-full mb-4">
                  <thead>
                    <tr className="text-left">
                      <th>Item</th>
                      <th className="text-right">Qtd</th>
                      <th className="text-right">Vl. Tot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.cart.map((item) => (
                      <tr key={item.id}>
                        <td className="truncate max-w-[40mm]">{item.name}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-black pt-2 mb-4">
                   <div className="flex justify-between font-bold text-sm">
                      <span>TOTAL</span>
                      <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                   </div>
                </div>
                <div className="text-center text-[10px] mb-8">
                   <p>Obrigado pela preferência!</p>
                   <p>www.balao.info</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CreditCard className="text-red-600" />
          Pagamento
        </h2>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total a Pagar</p>
          <p className="text-2xl font-bold text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => handlePayment("pix")}
          disabled={loading}
          className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-100 hover:border-red-500 hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <QrCode className="w-10 h-10 text-gray-400 group-hover:text-red-600 mb-3 transition-colors" />
          <span className="font-bold text-gray-700 group-hover:text-red-700">PIX</span>
          <span className="text-xs text-gray-500 mt-1">Aprovação Imediata</span>
        </button>

        <button
          onClick={() => handlePayment("credit_card")}
          disabled={loading}
          className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-100 hover:border-red-500 hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard className="w-10 h-10 text-gray-400 group-hover:text-red-600 mb-3 transition-colors" />
          <span className="font-bold text-gray-700 group-hover:text-red-700">Cartão</span>
          <span className="text-xs text-gray-500 mt-1">Crédito ou Débito</span>
        </button>

        <button
          onClick={() => handlePayment("cash")}
          disabled={loading}
          className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-100 hover:border-red-500 hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Banknote className="w-10 h-10 text-gray-400 group-hover:text-red-600 mb-3 transition-colors" />
          <span className="font-bold text-gray-700 group-hover:text-red-700">Dinheiro</span>
          <span className="text-xs text-gray-500 mt-1">Pagamento no Caixa</span>
        </button>
      </div>

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600 mb-4"></div>
          <p>Processando pagamento...</p>
        </div>
      )}
    </div>
  );
}

// Icone ShoppingCart não foi importado no topo, vou adicionar
function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
