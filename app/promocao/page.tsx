import React from "react";
import LandingPage from "@/components/LandingPage";
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

      <section className="sr-only">
        <div className="max-w-7xl mx-auto prose prose-blue">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ofertas de Informática em Campinas e Região</h2>
          <p className="text-gray-600 mb-4">
            Não perca as melhores <strong>promoções de peças de computador em Campinas</strong>. Nossa página de ofertas é atualizada diariamente com descontos reais em processadores, placas de vídeo, SSDs e periféricos. Cobrimos qualquer oferta anunciada pela concorrência local (sob consulta).
          </p>
          <p className="text-gray-600 mb-4">
            Fique atento aos nossos saldões de estoque e ofertas de Black Friday o ano todo. Se você mora em Campinas, Sumaré, Hortolândia ou Valinhos, aproveite a comodidade de comprar online e retirar na loja física, economizando no frete.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Itens frequentemente em promoção:</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>SSDs NVMe 500GB e 1TB</li>
            <li>Memória RAM DDR4 e DDR5 Gamer</li>
            <li>Fontes Corsair e MSI com certificação 80 Plus</li>
            <li>Kits Upgrade (Placa-mãe + Processador + Memória)</li>
          </ul>
        </div>
      </section>
    </>
  );
}
