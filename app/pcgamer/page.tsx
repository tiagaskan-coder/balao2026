import React from "react";
import LandingPage from "@/components/LandingPage";
import { Gamepad } from "lucide-react";

export default function PcGamerPage() {
  return (
    <LandingPage
      title="PC Gamer de Alta Performance"
      subtitle="Domine qualquer jogo com as melhores máquinas do mercado"
      description="Montamos PCs Gamer personalizados para todos os níveis e orçamentos. Desde máquinas de entrada até setups high-end para streaming e renderização. Peças das melhores marcas com garantia e suporte especializado."
      benefits={[
        "Montagem profissional e organização de cabos",
        "Testes rigorosos de stress e temperatura",
        "Garantia estendida e suporte técnico",
        "Consultoria gratuita para escolher as melhores peças",
        "Melhores preços de Campinas e região"
      ]}
      ctaText="Montar meu PC Gamer Agora"
      icon={<Gamepad size={48} />}
    />
  );
}
