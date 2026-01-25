import React from "react";
import LandingPage from "@/components/LandingPage";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";
import { Gift } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ServicosOfertasPage() {
  const products = await getProducts();
  const destaque = [
    ...searchProducts(products, "pc gamer"),
    ...searchProducts(products, "notebook"),
    ...searchProducts(products, "promoção"),
  ].slice(0, 12);

  return (
    <>
      <LandingPage
        title="Serviços e Ofertas"
        subtitle="Tudo para seu computador, com preço e atendimento de confiança"
        description="Montagem de PC, upgrades, assistência técnica, consignação de usados e ofertas imperdíveis. Fale com nossa equipe e resolva tudo em um só lugar, com transparência e garantia."
        benefits={[
          "Montagem profissional com testes completos",
          "Upgrades rápidos: SSD, RAM, fonte e GPU",
          "Assistência técnica e limpeza avançada",
          "Consignação de PCs e notebooks usados",
          "Atendimento imediato pelo WhatsApp"
        ]}
        ctaText="Falar no WhatsApp"
        icon={<Gift size={48} />}
      />

      <div className="px-4 sm:px-6 lg:px-8 my-8">
        <ProductCarousel title="Mais Procurados" products={destaque} />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 my-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="/pcgamer" className="block bg-white border rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">PC Gamer</h3>
            <p className="text-sm text-gray-600 mt-1">Monte o seu com performance e garantia.</p>
          </a>
          <a href="/notebooks" className="block bg-white border rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">Notebooks</h3>
            <p className="text-sm text-gray-600 mt-1">Modelos para trabalho, estudo e lazer.</p>
          </a>
          <a href="/promocao" className="block bg-white border rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">Promoção</h3>
            <p className="text-sm text-gray-600 mt-1">Ofertas especiais e descontos exclusivos.</p>
          </a>
          <a href="/manutencao" className="block bg-white border rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">Manutenção</h3>
            <p className="text-sm text-gray-600 mt-1">Assistência técnica especializada.</p>
          </a>
          <a href="/consignacao" className="block bg-white border rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">Consignação</h3>
            <p className="text-sm text-gray-600 mt-1">Venda seu usado com segurança.</p>
          </a>
          <a href="/monteseupc" className="block bg-white border rounded-lg p-6 hover:shadow-md transition">
            <h3 className="text-lg font-bold text-gray-800">Monte seu PC</h3>
            <p className="text-sm text-gray-600 mt-1">Ferramenta guiada com compatibilidade automática.</p>
          </a>
        </div>
      </div>
    </>
  );
}
