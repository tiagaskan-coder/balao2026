import React from "react";
import LandingPage from "@/components/LandingPage";
import { Gamepad } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";

export const dynamic = 'force-dynamic';

export default async function PcGamerPage() {
  const products = await getProducts();
  const related = searchProducts(products, "pc gamer").slice(0, 12);

  return (
    <>
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
      <div className="px-4 sm:px-6 lg:px-8 my-8">
        <ProductCarousel title="Mais Procurados em PC Gamer" products={related} />
      </div>
    </>
  );
}
