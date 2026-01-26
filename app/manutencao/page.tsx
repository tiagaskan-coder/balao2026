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
            Procurando por <strong>conserto de notebook em Campinas</strong> ou manutenção de computadores? O Balão da Informática oferece serviços técnicos de alta qualidade para resolver qualquer problema do seu equipamento. Nossa equipe é especializada em reparos de placas-mãe, troca de telas de notebook, upgrade de SSD e memória RAM, além de remoção de vírus e formatação.
          </p>
          <p className="text-gray-600 mb-4">
            Atendemos toda a região de Campinas, incluindo <strong>Barão Geraldo, Cambuí, Centro, Taquaral e Ouro Verde</strong>. Se você precisa de uma assistência técnica confiável, rápida e com preço justo, venha nos visitar. Somos referência em <em>manutenção de PC Gamer</em> e limpeza preventiva para evitar superaquecimento.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Serviços de Informática que oferecemos:</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Troca de bateria e teclado de notebook</li>
            <li>Reparo de carcaça e dobradiça</li>
            <li>Limpeza interna e troca de pasta térmica (Silver/Gold)</li>
            <li>Instalação de Windows e drivers</li>
            <li>Recuperação de dados de HD e SSD</li>
          </ul>
      </SeoContent>
    </>
  );
}
