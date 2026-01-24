"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function ShareButton({ title, text }: { title: string, text: string }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast("Link copiado para a área de transferência!", "success");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
      // Fallback for older browsers or if clipboard permission denied
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        showToast("Link copiado para a área de transferência!", "success");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        showToast("Não foi possível copiar o link", "error");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className={`flex items-center gap-2 transition-all font-medium px-4 py-2 border rounded-md 
        ${copied 
          ? "bg-green-50 text-green-600 border-green-200" 
          : "text-gray-500 hover:text-[#E60012] border-gray-200 hover:bg-gray-50"
        }`}
    >
      {copied ? <Check size={20} /> : <Share2 size={20} />}
      {copied ? "Copiado!" : "Compartilhar"}
    </button>
  );
}
