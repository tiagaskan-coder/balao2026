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
    </>
  );
}
