"use client";

import { MessageCircle, Instagram } from "lucide-react";

export default function SocialButtons({ productName }: { productName: string }) {
  const handleWhatsAppClick = () => {
    if (typeof window !== "undefined") {
      const message = `Olá, gostaria de consultar a disponibilidade do produto: ${productName} - ${window.location.href}`;
      const url = `https://wa.me/5519987510267?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  const handleInstagramClick = () => {
     window.open('https://www.instagram.com/balaodainformatica_castelo/', '_blank');
  };

  const buttonClass = "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-md font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm md:text-base";

  return (
    <div className="flex flex-1 gap-3 w-full md:w-auto">
      <button 
        onClick={handleWhatsAppClick}
        className={`${buttonClass} bg-[#25D366] hover:bg-[#128C7E]`}
        title="Falar no WhatsApp"
      >
        <MessageCircle size={20} />
        <span>WhatsApp</span>
      </button>

      <button 
        onClick={handleInstagramClick}
        className={`${buttonClass} bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90`}
        title="Ver no Instagram"
      >
        <Instagram size={20} />
        <span>Instagram</span>
      </button>
    </div>
  );
}
