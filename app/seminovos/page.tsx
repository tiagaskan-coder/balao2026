import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts, getCategories } from "@/lib/db";
import { Product, Category } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import HeroCTA from "@/components/HeroCTA";
import { Laptop2, ShieldCheck, BadgeCheck, Truck, Award, Star, CheckCircle2 } from "lucide-react";

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

function BrandStrip() {
  const brands = ["Dell", "HP", "Lenovo", "Acer", "Asus", "Apple"];
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="text-xs font-semibold text-gray-500 uppercase">
        Trabalhamos com:
      </div>
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 text-sm font-semibold text-gray-700">
        {brands.map((b) => (
          <span
            key={b}
            className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200"
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
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white p-5 flex flex-col justify-between shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-100 font-semibold">
            Nosso diferencial
          </p>
          <h3 className="text-xl font-extrabold mt-1 mb-2 tracking-tight">
            PAGUE AO RECEBER NA SUA CASA
          </h3>
        </div>
        <p className="text-xs text-emerald-50">
          Você recebe o notebook em casa, confere o equipamento e só então realiza o pagamento.
        </p>
      </div>
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-500 text-white p-5 flex flex-col justify-between shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-wide text-indigo-200 font-semibold">
            Entrega grátis
          </p>
          <h3 className="text-lg font-bold mt-1 mb-2">
            Frete grátis para Campinas e região selecionada
          </h3>
        </div>
        <p className="text-xs text-indigo-100">
          Estoque físico em Campinas, com envio rápido e seguro direto da loja.
        </p>
      </div>
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 text-white p-5 flex flex-col justify-between shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-900/80 font-semibold">
            Estoque ao vivo 24h
          </p>
          <h3 className="text-lg font-bold mt-1 mb-2">
            Se o anúncio está ativo, o notebook está disponível
          </h3>
        </div>
        <p className="text-xs text-amber-900/90">
          Estoque em tempo real: acabou o estoque, o anúncio sai do ar automaticamente.
        </p>
      </div>
    </div>
  );
}

function PayOnDeliveryBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 shadow-2xl p-8 md:p-12 text-white transform hover:scale-[1.01] transition-all duration-300">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="space-y-2">
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 border border-white/30">
            Diferencial Exclusivo
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter drop-shadow-sm">
            PAGUE AO RECEBER <br className="hidden md:block" />
            <span className="text-yellow-300">NA SUA CASA</span>
          </h2>
          <p className="text-lg md:text-xl text-emerald-50 max-w-2xl font-medium leading-relaxed">
            Sem risco nenhum! Você recebe o notebook, testa tudo no conforto do seu lar 
            e só faz o pagamento quando estiver 100% satisfeito.
          </p>
        </div>
        
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-inner">
          <ul className="space-y-3 text-left">
            <li className="flex items-center gap-3 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-yellow-300" />
              <span>Entrega Grátis em Campinas</span>
            </li>
            <li className="flex items-center gap-3 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-yellow-300" />
              <span>Teste antes de pagar</span>
            </li>
            <li className="flex items-center gap-3 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-yellow-300" />
              <span>Pix, Cartão ou Dinheiro</span>
            </li>
          </ul>
        </div>
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

function WhyBalaoSection() {
  return (
    <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
            Por que o seminovo do Balão vale a pena?
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Seminovo com cara de novo, garantia real e pagamento seguro
          </h2>
          <p className="text-sm text-gray-600 mt-2 max-w-xl">
            Se o anúncio está ativo, o notebook está disponível. Nosso estoque é ao vivo 24h por dia
            e cada equipamento é preparado como se fosse novo.
          </p>
        </div>
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          Estoque ao vivo • Atualizado em tempo real
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div className="flex gap-3">
          <div className="mt-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Garantia de 6 meses</h3>
            <p className="text-gray-600">
              Assistência direto com a Balão da Informática, sem burocracia nem surpresa.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="mt-1">
            <Laptop2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Equipamentos revisados</h3>
            <p className="text-gray-600">
              Limpeza interna, testes de desempenho, bateria avaliada e Windows 11 instalado.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="mt-1">
            <Truck className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Entrega grátis</h3>
            <p className="text-gray-600">
              Entrega grátis para Campinas e região selecionada, com envio rápido e seguro.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="mt-1">
            <BadgeCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pague ao receber</h3>
            <p className="text-gray-600">
              Você confere o notebook na sua casa e só então faz o pagamento.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="mt-1">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Carregador e embalagem</h3>
            <p className="text-gray-600">
              Acompanha carregador original ou compatível revisado e embalagem protegida para transporte.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="mt-1">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Atendimento humano</h3>
            <p className="text-gray-600">
              Equipe especializada para ajudar você a escolher o melhor seminovo para o seu uso.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 text-white px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-lg">
        <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-100">
          Diferencial exclusivo Balão
        </div>
        <div className="text-xl md:text-3xl font-black tracking-tight text-center md:text-left">
          PAGUE AO RECEBER NA SUA CASA
        </div>
        <p className="text-xs md:text-sm text-emerald-100 max-w-md">
          Mais segurança para você: o notebook chega pronto para uso, você confere tudo com calma e só
          então realiza o pagamento.
        </p>
      </div>
    </section>
  );
}

export default async function SeminovosPage() {
  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const rootCategory = categories.find(
    (c: Category) => c.slug === "semi-novo"
  );

  const validCategories = new Set<string>();

  if (rootCategory) {
    validCategories.add(rootCategory.name);
    const stack = [rootCategory.id];
    while (stack.length > 0) {
      const currentId = stack.pop() as string;
      const children = categories.filter((c) => c.parent_id === currentId);
      for (const child of children) {
        validCategories.add(child.name);
        stack.push(child.id);
      }
    }
  }

  const seminovos = allProducts.filter((p: Product) => {
    if (!rootCategory) return false;
    if (!p.category) return false;
    return validCategories.has(p.category);
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
                  o notebook está disponível para você, com estoque ao vivo 24h por dia.
                </p>
                <ul className="space-y-2 text-sm text-gray-100">
                  <li>• Garantia de 6 meses direto com a Balão da Informática</li>
                  <li>• Windows 11 + Office 2021 Trial instalados e atualizados</li>
                  <li>• Acompanha carregador original ou compatível revisado</li>
                  <li>• Estoque físico em Campinas, com retirada na loja ou envio</li>
                  <li>• Entrega grátis e opção de pagar ao receber na sua casa</li>
                </ul>
                <div className="mt-8">
                   <HeroCTA />
                </div>
              </div>
              <div className="space-y-4">
                <BrandStrip />
                <SecondaryBanners />
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white">
             <div className="container mx-auto px-4 max-w-6xl">
                 <PayOnDeliveryBanner />
             </div>
        </section>

        <section id="ofertas" className="py-10 md:py-14 bg-gray-50">
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
            <WhyBalaoSection />
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

