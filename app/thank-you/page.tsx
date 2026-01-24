"use client";

import Link from "next/link";
import { CheckCircle, Home, Copy, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { generatePixPayload } from "@/lib/pix";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const [pixPayload, setPixPayload] = useState("");
  const [copied, setCopied] = useState(false);
  
  const totalParam = searchParams.get("total");
  const orderId = searchParams.get("orderId");
  const total = totalParam ? parseFloat(totalParam) : 0;

  useEffect(() => {
    if (total > 0) {
      // Use the provided CNPJ as key
      const payload = generatePixPayload({
        key: "34397947000108",
        name: "BALAO CASTELO",
        city: "SAO PAULO",
        amount: total,
        txid: orderId ? orderId.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '') : "***" // Ensure txid is alphanumeric for Pix compliance if needed, though standard allows more. Limits length.
      });
      setPixPayload(payload);
    }
  }, [total, orderId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido Realizado!</h1>
        <p className="text-gray-600 mb-6">
          Obrigado pela sua compra.
          {orderId && <span className="block text-sm font-medium mt-1">Pedido #{orderId.slice(0, 8)}</span>}
        </p>

        {/* Pix Payment Section */}
        {pixPayload && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg" alt="Pix" className="h-6" />
              Pagamento via Pix
            </h2>
            
            <div className="mb-4 flex justify-center">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixPayload)}`} 
                 alt="QR Code Pix" 
                 className="w-48 h-48 border-4 border-white shadow-sm rounded-md"
               />
            </div>
            
            <p className="text-sm text-gray-600 mb-3 font-medium">
              Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </p>

            <div className="relative">
              <textarea 
                readOnly
                value={pixPayload}
                className="w-full text-xs p-3 bg-white border border-gray-300 rounded-md h-20 resize-none focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-500 break-all"
              />
              <button
                onClick={handleCopy}
                className="absolute bottom-2 right-2 bg-white p-1.5 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                title="Copiar código Pix"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-500" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Escaneie o QR Code ou copie o código acima para pagar no seu banco.
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <Link 
            href="/" 
            className="block w-full bg-[#E60012] text-white py-3 rounded-md font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Voltar para a Loja
          </Link>
          
          <Link 
            href="/cart" 
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Ver meu Carrinho
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-400">
          Se tiver alguma dúvida, entre em contato conosco pelo WhatsApp.
        </div>
      </div>
  );
}

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-center">Carregando...</div>}>
        <ThankYouContent />
      </Suspense>
    </div>
  );
}
