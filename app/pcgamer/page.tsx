import React from "react";
import LandingPage from "@/components/LandingPage";
import { Gamepad } from "lucide-react";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";

export const dynamic = 'force-dynamic';

export default async function PcGamerPage() {
  const products = await getProducts();
  const related = searchProducts(products, "pc gamer").slice(0, 12);

  return (
    <>
      <LandingPage
        title="PC Gamer de Alta Performance"
        subtitle="Domine qualquer jogo com as melhores máquinas do mercado"
        description="Montamos PCs Gamer personalizados para todos os níveis e orçamentos. Desde máquinas de entrada até setups high-end para streaming e renderização. Peças das melhores marcas com garantia e suporte especializado."
        benefits={[
          "Montagem profissional e organização de cabos",
          "Testes rigorosos de stress e temperatura",
          "Garantia estendida e suporte técnico",
          "Consultoria gratuita para escolher as melhores peças",
          "Melhores preços de Campinas e região"
        ]}
        ctaText="Montar meu PC Gamer Agora"
        icon={<Gamepad size={48} />}
      />
      <div className="px-4 sm:px-6 lg:px-8 my-8">
        <ProductCarousel title="Mais Procurados em PC Gamer" products={related} />
      </div>

      <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto prose prose-blue">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loja de PC Gamer em Campinas: Monte sua Máquina dos Sonhos</h2>
          <p className="text-gray-600 mb-4">
            O Balão da Informática é a sua <strong>loja de PC Gamer em Campinas</strong>. Trabalhamos com as melhores marcas do mundo hardware: ASUS, Gigabyte, MSI, Galax, Intel, AMD, Corsair e Kingston. Se você quer rodar os jogos mais recentes em 4K ou precisa de alta taxa de FPS para o competitivo (CS2, Valorant, Fortnite), nós temos o setup ideal.
          </p>
          <p className="text-gray-600 mb-4">
            Além de computadores prontos, oferecemos o serviço de <em>montagem de PC Gamer personalizada</em>. Você escolhe as peças e nossos técnicos especialistas montam com cable management profissional e testes de stress. Entregamos em toda a região de Campinas, Sumaré, Hortolândia e Paulínia.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Hardware High-End Disponível:</h3>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Placas de Vídeo NVIDIA RTX 4060, 4070, 4080 e 4090</li>
            <li>Processadores Intel Core i5, i7, i9 e AMD Ryzen 5, 7, 9</li>
            <li>Water Coolers e Gabinetes Gamer com RGB</li>
            <li>Monitores 144Hz, 165Hz e 240Hz</li>
          </ul>
        </div>
      </section>
    </>
  );
}
