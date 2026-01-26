import React from "react";
import LandingPage from "@/components/LandingPage";
import SeoContent from "@/components/SeoContent";
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

      <SeoContent title="Assistência Técnica de Informática Especializada em Campinas">
          <p className="text-gray-600 mb-4">
            Procurando por <strong>conserto de notebook em Campinas</strong> ou manutenção de computadores? O Balão da Informática oferece serviços técnicos de alta qualidade.
          </p>
          <ul className="list-none pl-0 text-gray-600 space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-xl">📍</span>
              <span><strong>Atendimento Regional:</strong> Barão Geraldo, Cambuí, Centro, Taquaral e Ouro Verde.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">🔧</span>
              <span><strong>Especialidades:</strong> Reparo de placa-mãe, troca de tela, upgrade de SSD/RAM e formatação.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">❄️</span>
              <span><strong>Prevenção:</strong> Limpeza completa e troca de pasta térmica (Silver/Gold) para evitar superaquecimento.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">💻</span>
              <span><strong>Serviços Extras:</strong> Troca de bateria/teclado, reparo de carcaça, instalação de Windows e recuperação de dados.</span>
            </li>
          </ul>
      </SeoContent>
    </>
  );
}
