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

      <section className="sr-only">
        <div className="max-w-7xl mx-auto prose prose-blue">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Notebooks em Campinas: Performance e Mobilidade</h2>
          <p className="text-gray-600 mb-4">
            Encontrar o <strong>melhor preço de notebook em Campinas</strong> ficou fácil. No Balão da Informática, oferecemos uma linha completa de laptops para todas as necessidades. Temos desde notebooks básicos para estudo e escritório (Core i3, Ryzen 3) até máquinas potentes para arquitetura, engenharia e design gráfico (Core i7, Ryzen 7, Placa de Vídeo Dedicada).
          </p>
          <p className="text-gray-600 mb-4">
            Trabalhamos com marcas renomadas como <em>Dell, Lenovo, Acer, Asus e Samsung</em>. Todos os nossos notebooks possuem garantia e nota fiscal. Além disso, se você precisa turbinar seu equipamento novo, já realizamos o upgrade de memória RAM e SSD na hora da compra.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Categorias de Notebooks:</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Notebooks Gamer (Acer Nitro, Dell G15, Lenovo Legion)</li>
            <li>Ultrabooks leves e finos</li>
            <li>Notebooks empresariais com Windows Pro</li>
            <li>Chromebooks para estudantes</li>
          </ul>
        </div>
      </section>
    </>
  );
}
