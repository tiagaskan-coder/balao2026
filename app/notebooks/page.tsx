import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts, getCategories } from "@/lib/db";
import { Product, Category } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from "@/components/JsonLd";
import Image from "next/image";
import HeroCTA from "@/components/HeroCTA";
import NotebooksSearchGrid from "@/components/NotebooksSearchGrid";
import { 
  Laptop, 
  Battery, 
  Wifi, 
  Briefcase, 
  GraduationCap, 
  Zap, 
  ShieldCheck, 
  MessageCircle, 
  CheckCircle,
  Truck,
  Award,
  Cpu,
  HardDrive
} from "lucide-react";

export const metadata: Metadata = {
  title: "Notebooks em Campinas: Performance e Mobilidade | Balão da Informática",
  description:
    "Encontre o notebook ideal para trabalho, estudo ou games. Dell, Lenovo, Acer e Apple com garantia e entrega rápida em Campinas e região.",
  keywords: [
    "notebook campinas",
    "comprar notebook campinas",
    "notebook dell campinas",
    "macbook campinas",
    "notebook gamer campinas",
    "loja de notebook campinas",
  ],
  openGraph: {
    title: "Notebooks em Campinas: Performance e Mobilidade | Balão da Informática",
    description:
      "Notebooks novos e seminovos com garantia, upgrade na hora e entrega rápida em Campinas.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function BlockHero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Laptop className="w-4 h-4 animate-bounce" />
          Campinas e Região
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-200 to-blue-900 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-none">
          NOTEBOOKS<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">PREMIUM</span>
        </h1>
        
        <p className="text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Mobilidade sem abrir mão da potência. Máquinas ideais para <strong className="text-blue-400 font-bold">Trabalho, Estudo e Games</strong>.
        </p>

        <div className="pt-8 flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <a 
             href="#ofertas"
             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-600/30 hover:scale-105 flex items-center gap-2"
          >
             Ver Ofertas
          </a>
        </div>
      </div>
      
      {/* Marquee Brands */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-blue-200 font-bold tracking-widest text-xs md:text-xl">
           <span>DELL</span>
           <span>LENOVO</span>
           <span>ACER</span>
           <span>APPLE</span>
           <span>SAMSUNG</span>
           <span>ASUS</span>
           <span>HP</span>
        </div>
      </div>
    </section>
  );
}

function BlockFeatures() {
  return (
    <section className="min-h-[70vh] flex items-center bg-zinc-950 text-white py-12 md:py-20 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
       
       <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 md:p-8 rounded-3xl hover:border-blue-500 transition-colors group">
                   <Briefcase className="w-10 h-10 md:w-12 md:h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl md:text-2xl font-bold mb-2">Corporativo</h3>
                   <p className="text-sm md:text-base text-zinc-400">Linhas Latitude, ThinkPad e ProBook. Durabilidade e segurança para sua empresa.</p>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 md:p-8 rounded-3xl hover:border-cyan-500 transition-colors group">
                   <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl md:text-2xl font-bold mb-2">Estudos</h3>
                   <p className="text-sm md:text-base text-zinc-400">Modelos leves com bateria de longa duração, ideais para levar à faculdade.</p>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 md:p-8 rounded-3xl hover:border-indigo-500 transition-colors group col-span-1 sm:col-span-2">
                   <Zap className="w-10 h-10 md:w-12 md:h-12 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl md:text-2xl font-bold mb-2">Performance & Gamer</h3>
                   <p className="text-sm md:text-base text-zinc-400">Notebooks com RTX 3050/4060 e telas de alta frequência para jogos e renderização.</p>
                </div>
             </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-6 md:space-y-8 text-center lg:text-left">
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                PODER <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">PORTÁTIL</span>
             </h2>
             <p className="text-xl md:text-3xl font-medium text-zinc-300 leading-snug">
                Leve seu escritório ou setup gamer para onde você for. Liberdade total sem perder desempenho.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                   <Battery className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
                   <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500 text-left">Autonomia<br/>Estendida</div>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                   <Wifi className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
                   <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500 text-left">Wi-Fi 6<br/>Ultra Rápido</div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

function BlockUpgrade() {
  return (
    <section className="py-12 bg-slate-100 text-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
           <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 flex flex-col justify-center h-full">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
                UPGRADE<br/>
                <span className="text-blue-600">NA HORA</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                 Achou o notebook perfeito mas quer mais memória ou espaço? Turbinamos sua máquina no momento da compra.
              </p>
              <ul className="space-y-3 text-lg font-semibold text-slate-700">
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Instalação de SSD NVMe (até 10x mais rápido)</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Aumento de Memória RAM (Multitarefa fluido)</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Clonagem de Sistema e Dados</span>
                 </li>
              </ul>
           </div>
           
           <div className="relative">
              <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-slate-200 h-full flex flex-col justify-center items-center text-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                    <div className="flex justify-center gap-4 mb-6">
                        <Cpu className="w-16 h-16 text-blue-600" />
                        <HardDrive className="w-16 h-16 text-cyan-600" />
                    </div>
                    <h3 className="text-3xl font-bold mb-3">Consultoria Grátis</h3>
                    <p className="text-slate-600 text-lg mb-6 max-w-md mx-auto">
                       Não sabe se o notebook suporta upgrade? Nossos técnicos avaliam as possibilidades na hora.
                    </p>
                    <a 
                       href="https://wa.me/5519987510267?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20sobre%20upgrade%20para%20meu%20notebook!" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 inline-block"
                    >
                       Falar com Técnico
                    </a>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

function BlockQuality() {
   return (
      <section className="min-h-[50vh] flex items-center bg-blue-950 text-white py-12 md:py-20 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
         <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-300 font-bold mb-6 text-sm">
                  <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
                  Qualidade Garantida
               </div>
               <h2 className="text-4xl md:text-7xl font-black leading-none mb-6">
                  REVISADOS E<br/>GARANTIDOS
               </h2>
               <p className="text-lg md:text-2xl text-blue-100 opacity-80 leading-relaxed">
                  Todos os equipamentos, novos ou seminovos, passam por rigorosa inspeção de 20 pontos. Tela, teclado, bateria, dobradiças e conectores testados à exaustão.
               </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
               <div className="bg-black/40 backdrop-blur p-6 rounded-2xl border border-blue-500/30 text-center md:text-left">
                  <Award className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 mb-3 mx-auto md:mx-0" />
                  <div className="text-xl md:text-3xl font-bold">Garantia</div>
                  <div className="text-xs md:text-sm opacity-70">Direto na loja</div>
               </div>
               <div className="bg-black/40 backdrop-blur p-6 rounded-2xl border border-blue-500/30 text-center md:text-left">
                  <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-500 mb-3 mx-auto md:mx-0" />
                  <div className="text-xl md:text-3xl font-bold">Nota Fiscal</div>
                  <div className="text-xs md:text-sm opacity-70">Procedência total</div>
               </div>
            </div>
         </div>
      </section>
   );
}

function BlockUrgency() {
   return (
      <section className="py-12 md:py-20 bg-cyan-600 text-white text-center">
         <div className="container mx-auto px-4 max-w-4xl space-y-8">
            <h2 className="text-3xl md:text-6xl font-black">
               PRECISA PARA HOJE?
            </h2>
            <p className="text-lg md:text-2xl font-medium opacity-90">
               Temos diversos modelos a pronta entrega. Retire na loja ou receba via motoboy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 md:pt-8">
               <a 
                  href="https://wa.me/5519987510267?text=Ol%C3%A1%2C%20preciso%20de%20um%20notebook%20com%20urg%C3%AAncia!"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-cyan-900 px-6 py-4 md:px-8 md:py-5 rounded-full font-black text-lg md:text-xl hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3 w-full sm:w-auto inline-flex"
               >
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                  CHAMAR NO WHATSAPP AGORA
               </a>
            </div>
            <p className="text-xs md:text-sm opacity-75 mt-4">
               Atendimento rápido • Orçamento sem compromisso
            </p>
         </div>
      </section>
   );
}

// Icon helper
function CheckCircle2({ className }: { className?: string }) {
   return (
      <svg 
         xmlns="http://www.w3.org/2000/svg" 
         width="24" 
         height="24" 
         viewBox="0 0 24 24" 
         fill="none" 
         stroke="currentColor" 
         strokeWidth="2" 
         strokeLinecap="round" 
         strokeLinejoin="round" 
         className={className}
      >
         <circle cx="12" cy="12" r="10"/>
         <path d="m9 12 2 2 4-4"/>
      </svg>
   )
}

export default async function NotebooksPage() {
  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  // Filter logic for Notebooks (similar to PC Gamer but for Notebooks)
  // We can look for "notebook" in category name or slug
  const notebookProducts = allProducts.filter((p: Product) => {
    const name = p.name.toLowerCase();
    const category = p.category?.toLowerCase() || "";
    // Basic filter for notebooks
    return (
      category.includes("notebook") || 
      category.includes("laptop") || 
      name.includes("notebook") ||
      name.includes("macbook") ||
      name.includes("dell") || // Often notebooks
      name.includes("lenovo") // Often notebooks
    ) && !category.includes("pc gamer") && !name.includes("pc gamer"); 
    // Exclude PC Gamer explicitly if overlap exists, though unlikely with good categorization
  });

  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Notebooks', item: 'https://www.balao.info/notebooks' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <Header />
      <main className="flex-1">
        
        {/* BLOCO 1: HERO */}
        <BlockHero />

        {/* PRODUTOS - GRID 1 */}
        <section id="ofertas" className="py-12 md:py-20 bg-zinc-50 min-h-[50vh]">
          <div className="container mx-auto px-4">
             <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-4">DESTAQUES DA SEMANA</h2>
                <div className="w-16 md:w-24 h-2 bg-blue-600 mx-auto rounded-full"></div>
                <p className="mt-4 text-lg md:text-xl text-slate-600">As melhores oportunidades em custo-benefício e performance.</p>
             </div>
             
             {notebookProducts.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-8 md:p-12 text-center text-gray-500 text-lg md:text-xl">
                 Carregando estoque de notebooks...
               </div>
             ) : (
               <NotebooksSearchGrid initialProducts={notebookProducts} />
             )}
          </div>
        </section>

        {/* BLOCO 2: FEATURES */}
        <BlockFeatures />

        {/* BLOCO 3: UPGRADE */}
        <BlockUpgrade />

        {/* BLOCO 4: QUALITY */}
        <BlockQuality />

        {/* BLOCO 5: ENTREGA */}
        <section className="min-h-[50vh] flex items-center bg-slate-900 text-white py-12 md:py-20">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div className="text-center md:text-left">
                  <Truck className="w-16 h-16 md:w-20 md:h-20 text-blue-400 mb-6 mx-auto md:mx-0" />
                  <h2 className="text-4xl md:text-5xl font-black mb-6">ENTREGA EXPRESSA</h2>
                  <p className="text-lg md:text-xl text-slate-300 mb-6">
                     Receba seu notebook no mesmo dia em Campinas e Região. Enviamos para todo Brasil com seguro.
                  </p>
               </div>
               <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-blue-300">Região Metropolitana de Campinas</h3>
                  <ul className="space-y-3">
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Campinas</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Valinhos</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Vinhedo</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Sumaré</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Hortolândia</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Paulínia</li>
                  </ul>
               </div>
            </div>
        </section>

        {/* BLOCO 6: CTA FINAL */}
        <BlockUrgency />

      </main>
    </div>
  );
}
