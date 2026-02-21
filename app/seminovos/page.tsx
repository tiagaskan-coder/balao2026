import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts } from "@/lib/db";
import { Product } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { Laptop2, ShieldCheck, BadgeCheck, Truck, Award, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Notebooks Seminovos em Campinas | Balão da Informática",
  description:
    "Notebooks usados e seminovos com garantia de 6 meses em Campinas. Estoque real, Windows 11 + Office 2021 Trial instalados e equipamentos testados.",
  openGraph: {
    title: "Notebooks Seminovos em Campinas | Balão da Informática",
    description:
      "Compre notebooks usados com garantia em Campinas. Estoque real, equipamentos testados e prontos para uso.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function NotebookMedia({ item }: { item: Product }) {
  const firstImage = item.image_urls?.[0];
  const video = item.video_url;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="aspect-video bg-black flex items-center justify-center">
          {firstImage ? (
            <img
              src={firstImage}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center text-gray-500 text-sm">
              Sem imagem
            </div>
          )}
        </div>
        <div className="aspect-video bg-black/90 flex items-center justify-center">
          {video ? (
            <video
              src={video}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : firstImage ? (
            <img
              src={firstImage}
              alt={item.name}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="flex items-center justify-center text-gray-500 text-sm">
              Vídeo em breve
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow">
          <ShieldCheck className="w-3 h-3 mr-1" />
          6 meses de garantia
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow">
          <Laptop2 className="w-3 h-3 mr-1" />
          Pronto para uso
        </span>
      </div>
    </div>
  );
}

function NotebookBlock({ item }: { item: Product }) {
  return (
    <section
      className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row gap-0"
      id={item.id}
    >
      <div className="md:w-1/2 p-4 md:p-6 border-b md:border-b-0 md:border-r border-gray-100">
        <NotebookMedia item={item} />
      </div>
      <div className="md:w-1/2 p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
            {item.name}
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            Modelo: <span className="font-medium text-gray-700">{item.model}</span>
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-600">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
              {item.processor}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
              {item.ram}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
              {item.storage}
            </span>
            {item.gpu && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200">
                GPU: {item.gpu}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Garantia Balão</p>
                <p className="text-gray-600 text-xs">
                  6 meses de garantia e excelentes condições para você comprar com segurança.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Estoque real</p>
                <p className="text-gray-600 text-xs">
                  Se o anúncio está ativo, o item está disponível para retirada ou envio.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Laptop2 className="w-4 h-4 text-indigo-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Windows 11 + Office 2021</p>
                <p className="text-gray-600 text-xs">
                  Sistema Windows 11 instalado e Office 2021 em versão Trial, prontos para uso.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">Carregador e bateria revisados</p>
                <p className="text-gray-600 text-xs">
                  Acompanha carregador original ou compatível. Bateria: {item.battery}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Produtos semi novos selecionados pela Balão da Informática, com garantia e suporte.
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandStrip() {
  const brands = ["Dell", "HP", "Lenovo", "Acer", "Asus", "Apple"];
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4 overflow-x-auto">
      <div className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
        Trabalhamos com:
      </div>
      <div className="flex items-center gap-4 text-sm font-semibold text-gray-700">
        {brands.map((b) => (
          <span
            key={b}
            className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 whitespace-nowrap"
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

function SecondaryBanners() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-300 font-semibold">
            Acessórios essenciais
          </p>
          <h3 className="text-lg font-bold mt-1 mb-2">
            Mochilas, mouses e teclados para completar seu setup
          </h3>
        </div>
        <p className="text-xs text-slate-300">
          Combine seu notebook seminovo com periféricos selecionados para produtividade.
        </p>
      </div>
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-500 text-white p-5 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold">
            Upgrades sob medida
          </p>
          <h3 className="text-lg font-bold mt-1 mb-2">
            Mais RAM e SSD para deixar seu seminovo ainda mais rápido
          </h3>
        </div>
        <p className="text-xs text-indigo-100">
          Serviço feito na loja com garantia Balão da Informática.
        </p>
      </div>
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 text-white p-5 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-900/80 font-semibold">
            Oportunidades limitadas
          </p>
          <h3 className="text-lg font-bold mt-1 mb-2">
            Cada anúncio é único: acabou o estoque, acabou a oferta
          </h3>
        </div>
        <p className="text-xs text-amber-900/90">
          Garanta agora seu notebook seminovo com garantia em Campinas.
        </p>
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-bold text-gray-900">Clientes satisfeitos</h3>
      </div>
      <p className="text-sm text-gray-600">
        Quem compra na Balão da Informática leva não só um equipamento revisado, mas também
        atendimento humano e suporte técnico de verdade. Veja alguns depoimentos reais:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <blockquote className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-gray-700">
            “Comprei um notebook seminovo para faculdade e chegou impecável. Ótimo custo-benefício
            e atendimento rápido.”
          </p>
          <p className="mt-2 text-xs text-gray-500">– Ana Paula, Cambuí</p>
        </blockquote>
        <blockquote className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-gray-700">
            “Meu equipamento veio formatado, com Windows atualizado e pronto para trabalhar. Recomendo
            muito a Balão.”
          </p>
          <p className="mt-2 text-xs text-gray-500">– Marcelo, Centro de Campinas</p>
        </blockquote>
        <blockquote className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-gray-700">
            “Já comprei e também trouxe notebook para manutenção. Sempre saio satisfeito com o serviço.”
          </p>
          <p className="mt-2 text-xs text-gray-500">– Renata, Barão Geraldo</p>
        </blockquote>
      </div>
    </section>
  );
}

export default async function SeminovosPage() {
  const allProducts = await getProducts();
  const seminovos = allProducts.filter((p: Product) => {
    const category = (p.category || "").toLowerCase();
    const slug = (p.slug || "").toLowerCase();
    return category.includes("semi-novo") || slug.includes("semi-novo");
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 text-xs font-semibold mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Estoque real de notebooks seminovos em Campinas
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                  Notebooks seminovos com garantia e teste completo de hardware
                </h1>
                <p className="text-sm md:text-base text-gray-200 mb-6 leading-relaxed">
                  Cada equipamento passa por uma revisão rigorosa: limpeza interna, testes de
                  desempenho, bateria avaliada e Windows 11 instalado. Se o anúncio está ativo,
                  o notebook está disponível para você.
                </p>
                <ul className="space-y-2 text-sm text-gray-100">
                  <li>• Garantia de 6 meses direto com a Balão da Informática</li>
                  <li>• Windows 11 + Office 2021 Trial instalados e atualizados</li>
                  <li>• Acompanha carregador original ou compatível revisado</li>
                  <li>• Estoque físico em Campinas, com retirada na loja ou envio</li>
                </ul>
              </div>
              <div className="space-y-4">
                <BrandStrip />
                <SecondaryBanners />
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            {seminovos.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-8 text-center text-sm text-gray-500">
                Em breve você verá aqui a seleção de notebooks seminovos disponíveis em Campinas.
              </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {seminovos.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
            )}
          </div>
        </section>

        <section className="pb-12">
          <div className="container mx-auto px-4 max-w-6xl space-y-6">
            <Testimonials />
            <div className="text-[11px] text-gray-500 leading-relaxed">
              Melhor preço de notebooks usados em Campinas, Cambuí, Centro e toda região
              metropolitana. Notebooks seminovos com garantia, suporte técnico especializado e
              condições especiais de pagamento. Assistência e venda de PCs em Campinas, Barão
              Geraldo, Taquaral, Sousas, Joaquim Egídio, Nova Campinas, Guanabara, Ouro Verde e
              região metropolitana.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

