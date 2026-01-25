import React from "react";
import LandingPage from "@/components/LandingPage";
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
    </>
  );
}
