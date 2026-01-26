import React from "react";
import LandingPage from "@/components/LandingPage";
import { Handshake } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";

export const dynamic = 'force-dynamic';

export default async function ConsignacaoPage() {
  const products = await getProducts();
  const related = [
    ...searchProducts(products, "notebook"),
    ...searchProducts(products, "pc"),
  ].slice(0, 12);

  return (
    <>
      <LandingPage
        title="Venda seu Usado em Consignação"
        subtitle="Transforme seu equipamento parado em dinheiro"
        description="Tem um PC ou notebook parado? Traga para a Balão da Informática! Avaliamos seu equipamento e o colocamos à venda em nossa loja. Você define o preço mínimo e nós cuidamos de todo o processo de venda, fotos, anúncios e atendimento."
        benefits={[
          "Avaliação justa do seu equipamento",
          "Exposição na loja física e online",
          "Segurança total na negociação",
          "Nós lidamos com os compradores para você",
          "Pagamento garantido após a venda"
        ]}
        ctaText="Avaliar meu Equipamento"
        icon={<Handshake size={48} />}
      />
      <div className="px-4 sm:px-6 lg:px-8 my-8">
        <ProductCarousel title="Equipamentos em Destaque" products={related} />
      </div>

      <section className="sr-only">
        <div className="max-w-7xl mx-auto prose prose-blue">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Venda seu Computador ou Notebook Usado em Campinas</h2>
          <p className="text-gray-600 mb-4">
            Quer vender seu PC usado mas não quer ter dor de cabeça com anúncios e negociações inseguras? O sistema de <strong>consignação de informática em Campinas</strong> do Balão da Informática é a solução ideal. Nós avaliamos seu equipamento, higienizamos e o expomos em nossa loja física e site, garantindo a melhor visibilidade para uma venda rápida.
          </p>
          <p className="text-gray-600 mb-4">
            Somos a melhor opção de <em>compra e venda de usados em Campinas</em>. Aceitamos notebooks, computadores completos, monitores e peças de hardware (placas de vídeo, processadores). Traga seu equipamento para uma avaliação gratuita em nossa loja.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Por que consignar com a gente?</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Avaliação de mercado justa e transparente</li>
            <li>Segurança total: nós lidamos com os curiosos e golpistas</li>
            <li>Exposição para milhares de clientes locais na RMC</li>
            <li>Pagamento garantido assim que o produto for vendido</li>
          </ul>
        </div>
      </section>
    </>
  );
}
