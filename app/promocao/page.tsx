import React from "react";
import LandingPage from "@/components/LandingPage";
import { Tag } from "lucide-react";

export default function PromocaoPage() {
  return (
    <LandingPage
      title="Ofertas e Promoções Exclusivas"
      subtitle="Os melhores preços em hardware e periféricos de Campinas"
      description="Aproveite nossas ofertas relâmpago e descontos especiais em toda a linha de informática. Placas de vídeo, processadores, monitores, periféricos e muito mais com preços que cobrem qualquer oferta da concorrência."
      benefits={[
        "Descontos reais e promoções semanais",
        "Preços especiais para pagamento à vista no PIX",
        "Combos e kits upgrade com valor reduzido",
        "Produtos open-box com garantia total",
        "Negociação direta pelo WhatsApp"
      ]}
      ctaText="Ver Promoções no WhatsApp"
      icon={<Tag size={48} />}
    />
  );
}
