import React from "react";
import LandingPage from "@/components/LandingPage";
import SeoContent from "@/components/SeoContent";
import { Tag } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";

export const dynamic = 'force-dynamic';

export default async function PromocaoPage() {
  const products = await getProducts();
  let related = searchProducts(products, "promoção");
  if (related.length < 8) {
    const fallback = searchProducts(products, "oferta");
    related = [...related, ...fallback].slice(0, 12);
    if (related.length < 8) {
      related = products.slice(0, 12);
    }
  }

  return (
    <>
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
      <div className="px-4 sm:px-6 lg:px-8 my-8">
        <ProductCarousel title="Ofertas em Destaque" products={related} />
      </div>

      <SeoContent title="Ofertas de Informática em Campinas e Região">
          <p className="text-gray-600 mb-4">
            As melhores <strong>promoções de peças de computador em Campinas</strong> estão aqui. Cobrimos ofertas da concorrência local (sob consulta).
          </p>
          <ul className="list-none pl-0 text-gray-600 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-xl">🔥</span>
              <span><strong>Ofertas Diárias:</strong> Descontos reais em processadores, placas de vídeo, SSDs e periféricos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">📦</span>
              <span><strong>Retirada Local:</strong> Compre online e retire na loja em Campinas para economizar o frete.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">🏷️</span>
              <span><strong>Destaques:</strong> SSDs NVMe, Memória RAM DDR4/DDR5, Fontes Corsair/MSI e Kits Upgrade.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">📍</span>
              <span><strong>Região:</strong> Atendemos Campinas, Sumaré, Hortolândia e Valinhos.</span>
            </li>
          </ul>
      </SeoContent>
    </>
  );
}
