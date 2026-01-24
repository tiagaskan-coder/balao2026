"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ productName }: { productName: string }) {
  const handleWhatsAppClick = () => {
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      const message = `Olá, gostaria de consultar a disponibilidade do produto: ${productName} - ${window.location.href}`;
      const url = `https://wa.me/5519987510267?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <button 
      onClick={handleWhatsAppClick}
      className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-md font-medium hover:bg-[#128C7E] transition-colors shadow-sm"
      title="Verificar disponibilidade no WhatsApp"
    >
      <MessageCircle size={20} />
      <span>Verificar disponibilidade no WhatsApp</span>
    </button>
  );
}
