import React from "react";
import LandingPage from "@/components/LandingPage";
import SeoContent from "@/components/SeoContent";
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

      <SeoContent title="Loja de PC Gamer em Campinas: Monte sua Máquina dos Sonhos">
          <p className="text-gray-600 mb-4">
            O Balão da Informática é referência em <strong>PC Gamer em Campinas</strong>, trabalhando com as melhores marcas globais como ASUS, MSI, Intel e AMD.
          </p>
          <ul className="list-none pl-0 text-gray-600 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-xl">🚀</span>
              <span><strong>Alta Performance:</strong> Setups para rodar jogos em 4K ou Competitivo (CS2, Valorant, Fortnite) com alto FPS.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">🛠️</span>
              <span><strong>Montagem Personalizada:</strong> Escolha as peças e nossos especialistas montam com cable management profissional.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">💎</span>
              <span><strong>Hardware High-End:</strong> RTX 4060/4090, Ryzen 9, Core i9, Water Coolers e Gabinetes RGB.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">🚚</span>
              <span><strong>Entrega Regional:</strong> Campinas, Sumaré, Hortolândia e Paulínia.</span>
            </li>
          </ul>
      </SeoContent>
    </>
  );
}
