"use client";

import React, { useState } from "react";
import { usePdv } from "../store";
import { ArrowLeft, Check, Printer, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { generatePixPayload } from "@/lib/pix";
import { createOrder } from "../actions";

export default function PaymentModal({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = usePdv();
  const [loading, setLoading] = useState(false);
  const [pixPayload, setPixPayload] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const total = state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleGeneratePix = () => {
    // CNPJ Balão da Informática: 34397947000108
    const payload = generatePixPayload({
      key: "34397947000108",
      name: "BALAO DA INFORMATICA",
      city: "SAO PAULO", // Assumindo cidade sede, ajuste conforme necessário
      amount: total,
      txid: `PDV${Date.now().toString().slice(-8)}` // ID único curto
    });
    setPixPayload(payload);
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const result = await createOrder({
        customer: state.customer,
        items: state.cart,
        total,
        paymentMethod: "pix",
        origin: "pdv",
        sellerId: state.sellerId
      });
      
      if (result.success && result.orderId) {
        setOrderId(result.orderId);
        dispatch({ type: "SET_STEP", payload: "success" });
        // Aqui poderia disparar impressão automática
      } else {
        alert("Erro ao criar pedido: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao finalizar.");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrint = () => {
      window.print();
  };
  
  const handleNewOrder = () => {
      dispatch({ type: "RESET" });
      onBack();
  };

  if (state.step === "success") {
      return (
        <>
        <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl w-full max-w-md ml-auto p-6 items-center justify-center text-center space-y-6 no-print">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Check size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Venda Realizada!</h2>
            <p className="text-gray-600">O pedido #{orderId?.slice(0,8)} foi registrado com sucesso.</p>
            
            <div className="flex flex-col w-full gap-3">
                <button 
                    onClick={handlePrint}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <Printer size={20} />
                    Imprimir Comprovante
                </button>
                <button 
                    onClick={handleNewOrder}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    Nova Venda
                </button>
            </div>
        </div>
        
        <div id="printable-receipt" className="hidden">
            <div className="p-2 max-w-[80mm] mx-auto font-mono text-xs text-black">
                <div className="text-center mb-4">
                    <h1 className="font-bold text-lg uppercase">Balão da Informática</h1>
                    <p>CNPJ: 34.397.947/0001-08</p>
                    <p className="mt-2">Pedido #{orderId?.slice(0,8)}</p>
                    <p>{new Date().toLocaleString('pt-BR')}</p>
                </div>
                
                <div className="mb-4 border-b border-black border-dashed pb-2">
                    <p><strong>Cliente:</strong> {state.customer.name}</p>
                    <p><strong>CPF/CNPJ:</strong> {state.customer.cpf_cnpj}</p>
                </div>
                
                <div className="mb-4">
                    {state.cart.map((item) => (
                        <div key={item.id} className="flex justify-between mb-1">
                            <span className="truncate w-3/5">{item.name}</span>
                            <span className="w-1/12 text-center">x{item.quantity}</span>
                            <span className="w-1/4 text-right">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>
                
                <div className="text-right font-bold text-sm border-t border-black border-dashed pt-2">
                    TOTAL: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                </div>
                
                <div className="text-center mt-8 text-[10px]">
                    <p>Obrigado pela preferência!</p>
                    <p>www.balao.info</p>
                </div>
            </div>
        </div>
        </>
      );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl w-full max-w-md ml-auto">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Pagamento</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between text-lg font-bold text-gray-900 mb-2">
                <span>Total a Pagar</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
            </div>
            <p className="text-sm text-gray-500">Itens: {state.cart.length}</p>
        </div>

        <div className="space-y-4">
            <button 
                onClick={handleGeneratePix}
                className={`w-full py-4 px-4 rounded-lg border-2 flex items-center justify-between transition-all ${pixPayload ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-500'}`}
            >
                <div className="flex items-center gap-3">
                    <QrCode size={24} className="text-gray-700" />
                    <span className="font-medium text-gray-900">Pix (QR Code)</span>
                </div>
                {pixPayload && <Check className="text-green-600" size={20} />}
            </button>
            
            {pixPayload && (
                <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg bg-white animate-in fade-in zoom-in duration-300">
                    <QRCodeSVG value={pixPayload} size={200} />
                    <p className="mt-4 text-sm text-gray-500 text-center">Escaneie o QR Code para pagar</p>
                    <button 
                        onClick={() => navigator.clipboard.writeText(pixPayload)}
                        className="mt-2 text-blue-600 text-sm font-medium hover:underline"
                    >
                        Copiar Código Pix
                    </button>
                </div>
            )}
            
            {/* Outros métodos poderiam ser adicionados aqui */}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleFinalize}
          disabled={loading || !pixPayload} // Por enquanto força gerar pix, mas poderia ser opcional
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
             <>
               <Check size={20} />
               Confirmar Pagamento
             </>
          )}
        </button>
      </div>
    </div>
  );
}
