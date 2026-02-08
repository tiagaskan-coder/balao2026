"use client";

import { useEffect } from "react";

export default function VoiceWidget() {
  useEffect(() => {
    // Carregar o script do widget
    const script = document.createElement("script");
    script.src = "/voice-widget/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup se necessário (remover o container criado pelo script)
      const container = document.querySelector(".voice-widget-container");
      if (container) {
        container.remove();
      }
      document.body.removeChild(script);
    };
  }, []);

  return null; // O script injeta o HTML
}
