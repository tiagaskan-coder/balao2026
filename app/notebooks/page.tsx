import React from "react";
import LandingPage from "@/components/LandingPage";
import SeoContent from "@/components/SeoContent";
import { Laptop } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";

export const dynamic = 'force-dynamic';

export default async function NotebooksPage() {
  const products = await getProducts();
  const related = searchProducts(products, "notebook").slice(0, 12);

  return (
    <>
      <LandingPage
        title="Notebooks para Trabalho e Estudo"
        subtitle="Mobilidade, performance e custo-benefício"
        description="Dos modelos básicos aos avançados, temos o notebook ideal para você. Marcas confiáveis, garantia e suporte especializado. Configurações otimizadas para produtividade, estudo e uso profissional."
        benefits={[
          "Modelos com SSD e tela de alta qualidade",
          "Equipamentos novos e seminovos com garantia",
          "Opções com Windows e Linux",
          "Suporte técnico e upgrades",
          "Condições especiais no PIX"
        ]}
        ctaText="Consultar modelos no WhatsApp"
        icon={<Laptop size={48} />}
      />
      <div className="px-4 sm:px-6 lg:px-8 my-8">
        <ProductCarousel title="Notebooks em Destaque" products={related} />
      </div>

      <SeoContent title="Notebooks em Campinas: Performance e Mobilidade">
          <p className="text-gray-600 mb-4">
            Encontrar o <strong>melhor preço de notebook em Campinas</strong> é no Balão da Informática. Oferecemos laptops para estudo, escritório e alta performance.
          </p>
          <ul className="list-none pl-0 text-gray-600 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-xl">🎮</span>
              <span><strong>Notebooks Gamer:</strong> Modelos Acer Nitro, Dell G15 e Lenovo Legion para jogos e renderização.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">💼</span>
              <span><strong>Trabalho e Estudo:</strong> Ultrabooks leves, máquinas empresariais com Windows Pro e Chromebooks.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">⚡</span>
              <span><strong>Upgrade Imediato:</strong> Turbinamos seu notebook novo com mais RAM e SSD na hora da compra.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">🏆</span>
              <span><strong>Marcas Confiáveis:</strong> Dell, Lenovo, Acer, Asus e Samsung com garantia e nota fiscal.</span>
            </li>
          </ul>
      </SeoContent>
    </>
  );
}
