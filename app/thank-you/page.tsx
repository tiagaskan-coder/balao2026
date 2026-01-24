import Link from "next/link";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pedido Realizado!</h1>
        <p className="text-gray-600 mb-8">
          Obrigado pela sua compra. Enviamos um e-mail com os detalhes do seu pedido.
        </p>
        
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
    </div>
  );
}
