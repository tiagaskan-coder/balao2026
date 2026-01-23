"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({ title, text }: { title: string, text: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-2 text-gray-500 hover:text-[#E60012] transition-colors font-medium px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
    >
      <Share2 size={20} />
      Compartilhar
    </button>
  );
}
