import React from "react";
import LandingPage from "@/components/LandingPage";
import { Wrench } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";

export const dynamic = 'force-dynamic';

export default async function ManutencaoPage() {
  const products = await getProducts();
  const upgrade = [
    ...searchProducts(products, "ssd"),
    ...searchProducts(products, "memoria"),
    ...searchProducts(products, "fonte"),
  ].slice(0, 12);

  return (
    <>
      <LandingPage
        title="Assistência Técnica Especializada"
        subtitle="Reparo rápido e confiável para seu PC ou Notebook"
        description="Seu computador está lento, travando ou não liga? Nossa equipe técnica resolve! Realizamos formatação, limpeza, troca de peças, reparo de placa-mãe, recuperação de dados e muito mais. Serviço transparente e com garantia."
        benefits={[
          "Diagnóstico rápido e preciso",
          "Técnicos certificados e experientes",
          "Laboratório próprio com equipamentos modernos",
          "Limpeza completa e troca de pasta térmica de alta qualidade",
          "Orçamento sem compromisso"
        ]}
        ctaText="Agendar Manutenção"
        icon={<Wrench size={48} />}
      />
      <div className="px-4 sm:px-6 lg:px-8 my-8">
        <ProductCarousel title="Peças para Upgrade Rápido" products={upgrade} />
      </div>
    </>
  );
}
