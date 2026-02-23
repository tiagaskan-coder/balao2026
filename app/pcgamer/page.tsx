import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts, getCategories } from "@/lib/db";
import { Product, Category } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import HeroCTA from "@/components/HeroCTA";
import PcGamerSearchGrid from "@/components/PcGamerSearchGrid";
import { 
  Gamepad2, 
  Cpu, 
  Zap, 
  Wrench, 
  MonitorPlay, 
  Flame, 
  Truck, 
  ShieldCheck, 
  MessageCircle, 
  PackageCheck,
  ThermometerSun
} from "lucide-react";

export const metadata: Metadata = {
  title: "PC Gamer em Campinas com Entrega Rápida | Balão da Informática",
  description:
    "PC Gamer de alta performance em Campinas com montagem profissional, setups personalizados, garantia local e entrega rápida para Campinas, região metropolitana e envio para todo o Brasil.",
  keywords: [
    "pc gamer campinas",
    "pc gamer brasil",
    "computador gamer campinas",
    "pc gamer montagem profissional",
    "pc gamer entrega rápida campinas",
  ],
  openGraph: {
    title: "PC Gamer em Campinas com Entrega Rápida | Balão da Informática",
    description:
      "PC Gamer de alta performance com montagem profissional, garantia local e entrega rápida em Campinas e região.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

function BlockHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Gamepad2 className="w-4 h-4 animate-bounce" />
          Campinas e Região
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-violet-200 to-violet-900 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-none">
          PC GAMER<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">INSANO</span>
        </h1>
        
        <p className="text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Chega de lag. Domine o jogo com máquinas projetadas para <strong className="text-violet-400 font-bold">performance extrema</strong> e visual impecável.
        </p>

        <div className="pt-8 flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <HeroCTA />
        </div>
      </div>
      
      {/* Marquee Games */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-violet-200 font-bold tracking-widest text-xs md:text-xl">
           <span>CS2</span>
           <span>VALORANT</span>
           <span>WARZONE</span>
           <span>GTA V</span>
           <span>FORTNITE</span>
           <span>MINECRAFT RTX</span>
           <span>CYBERPUNK</span>
        </div>
      </div>
    </section>
  );
}

function BlockPerformance() {
  return (
    <section className="min-h-[80vh] flex items-center bg-zinc-950 text-white py-12 md:py-20 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
       
       <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 md:p-8 rounded-3xl hover:border-violet-500 transition-colors group">
                   <Cpu className="w-10 h-10 md:w-12 md:h-12 text-violet-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl md:text-2xl font-bold mb-2">Processadores</h3>
                   <p className="text-sm md:text-base text-zinc-400">Intel Core i9 / i7 / i5 e AMD Ryzen 9 / 7 / 5 de última geração.</p>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 md:p-8 rounded-3xl hover:border-fuchsia-500 transition-colors group">
                   <MonitorPlay className="w-10 h-10 md:w-12 md:h-12 text-fuchsia-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl md:text-2xl font-bold mb-2">Placas de Vídeo</h3>
                   <p className="text-sm md:text-base text-zinc-400">RTX 4090, 4080, 4070, 4060. Ray Tracing e DLSS no máximo.</p>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-6 md:p-8 rounded-3xl hover:border-cyan-500 transition-colors group col-span-1 sm:col-span-2">
                   <Zap className="w-10 h-10 md:w-12 md:h-12 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-xl md:text-2xl font-bold mb-2">Alta Performance</h3>
                   <p className="text-sm md:text-base text-zinc-400">Memórias DDR5 de alta frequência e SSDs NVMe Gen4 com velocidades absurdas de leitura e escrita.</p>
                </div>
             </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-6 md:space-y-8 text-center lg:text-left">
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                FPS NO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">TALO</span>
             </h2>
             <p className="text-xl md:text-3xl font-medium text-zinc-300 leading-snug">
                Não jogue para participar. Jogue para ganhar. Cada frame conta na hora do clutch.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                   <div className="text-3xl md:text-4xl font-black text-green-400">300+</div>
                   <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500 text-left">FPS<br/>Competitivo</div>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                   <div className="text-3xl md:text-4xl font-black text-purple-400">4K</div>
                   <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-500 text-left">Resolução<br/>Ultra</div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

function BlockCustom() {
  return (
    <section className="py-12 bg-slate-100 text-slate-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
           <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 flex flex-col justify-center h-full">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
                MONTE DO<br/>
                <span className="text-blue-600">SEU JEITO</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                 Tem uma configuração dos sonhos em mente? Nós tornamos realidade. Escolha gabinete, cooler, fans RGB e muito mais.
              </p>
              <ul className="space-y-3 text-lg font-semibold text-slate-700">
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Orçamento personalizado via WhatsApp</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Compatibilidade de peças verificada</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span>Sugestões de upgrade futuro</span>
                 </li>
              </ul>
           </div>
           
           <div className="relative">
              <div className="relative bg-white p-8 rounded-3xl shadow-lg border border-slate-200 h-full flex flex-col justify-center items-center text-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                    <Wrench className="w-20 h-20 text-blue-600 mb-4 mx-auto" />
                    <h3 className="text-3xl font-bold mb-3">Consultoria Grátis</h3>
                    <p className="text-slate-600 text-lg mb-6 max-w-md mx-auto">
                       Não sabe qual peça escolher? Nossos especialistas te ajudam a montar o melhor setup para o seu orçamento.
                    </p>
                    <a 
                       href="https://wa.me/5519987510267?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20consultoria%20gr%C3%A1tis%20para%20meu%20PC%20Gamer!" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 inline-block"
                    >
                       Chamar Especialista
                    </a>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

function BlockAssembly() {
    return (
      <section className="min-h-[60vh] flex items-center bg-zinc-900 text-white py-12 md:py-20 border-y border-zinc-800">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-6xl font-black mb-8 md:mb-12">
               COMPROU NA INTERNET? <br/>
               <span className="text-emerald-400">A GENTE MONTA!</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
               <div className="bg-zinc-800 p-8 rounded-3xl border border-zinc-700 hover:border-emerald-500 transition-all hover:-translate-y-2">
                  <PackageCheck className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 mx-auto mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold mb-4">Recebemos suas Peças</h3>
                  <p className="text-zinc-400 text-sm md:text-base">
                     Pode comprar na Kabum, Terabyte, Pichau... Traga as caixas lacradas que nós cuidamos do resto.
                  </p>
               </div>
               <div className="bg-zinc-800 p-8 rounded-3xl border border-zinc-700 hover:border-emerald-500 transition-all hover:-translate-y-2">
                  <Zap className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 mx-auto mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold mb-4">Montagem Premium</h3>
                  <p className="text-zinc-400 text-sm md:text-base">
                     Cable management impecável (fios escondidos), aplicação de pasta térmica de prata e fixação segura.
                  </p>
               </div>
               <div className="bg-zinc-800 p-8 rounded-3xl border border-zinc-700 hover:border-emerald-500 transition-all hover:-translate-y-2">
                  <MonitorPlay className="w-12 h-12 md:w-16 md:h-16 text-emerald-400 mx-auto mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold mb-4">Drivers e BIOS</h3>
                  <p className="text-zinc-400 text-sm md:text-base">
                     Atualizamos a BIOS, instalamos Windows e todos os drivers. Você pega o PC pronto para jogar.
                  </p>
               </div>
            </div>
         </div>
      </section>
    );
}

function BlockTesting() {
   return (
      <section className="min-h-[60vh] flex items-center bg-red-950 text-white py-12 md:py-20 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
         <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 font-bold mb-6 text-sm">
                  <Flame className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                  Stress Test Aprovado
               </div>
               <h2 className="text-4xl md:text-8xl font-black leading-none mb-6">
                  TESTADO<br/>NO LIMITE
               </h2>
               <p className="text-lg md:text-2xl text-red-100 opacity-80 leading-relaxed">
                  Não entregamos o PC apenas "ligando". Todas as máquinas passam por baterias de testes de stress de CPU e GPU para garantir que não haverá superaquecimento ou telas azuis durante sua gameplay.
               </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
               <div className="bg-black/40 backdrop-blur p-6 rounded-2xl border border-red-500/30 text-center md:text-left">
                  <ThermometerSun className="w-8 h-8 md:w-10 md:h-10 text-red-500 mb-3 mx-auto md:mx-0" />
                  <div className="text-xl md:text-3xl font-bold">Temperatura</div>
                  <div className="text-xs md:text-sm opacity-70">Monitoramento térmico</div>
               </div>
               <div className="bg-black/40 backdrop-blur p-6 rounded-2xl border border-red-500/30 text-center md:text-left">
                  <Zap className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 mb-3 mx-auto md:mx-0" />
                  <div className="text-xl md:text-3xl font-bold">Voltagem</div>
                  <div className="text-xs md:text-sm opacity-70">Estabilidade de energia</div>
               </div>
            </div>
         </div>
      </section>
   );
}

function BlockUrgency() {
   return (
      <section className="py-12 md:py-20 bg-emerald-600 text-white text-center">
         <div className="container mx-auto px-4 max-w-4xl space-y-8">
            <h2 className="text-3xl md:text-6xl font-black">
               PRONTO PARA O PRÓXIMO NÍVEL?
            </h2>
            <p className="text-lg md:text-2xl font-medium opacity-90">
               Não perca mais partidas por causa de FPS baixo. Garanta sua máquina hoje.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 md:pt-8">
               <a 
                  href="https://wa.me/5519987510267?text=Ol%C3%A1%2C%20estou%20pronto%20para%20o%20pr%C3%B3ximo%20n%C3%ADvel%20e%20quero%20um%20PC%20Gamer!"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-emerald-900 px-6 py-4 md:px-8 md:py-5 rounded-full font-black text-lg md:text-xl hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3 w-full sm:w-auto inline-flex"
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

export default async function PcGamerPage() {
  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const rootCategory = categories.find(
    (c: Category) => c.slug === "pc-gamer"
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

  const gamerProducts = allProducts.filter((p: Product) => {
    if (!rootCategory) return false;
    if (!p.category) return false;
    return validCategories.has(p.category);
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />
      <main className="flex-1">
        
        {/* BLOCO 1: HERO */}
        <BlockHero />

        {/* PRODUTOS - GRID 1 (MOVIDO PARA CIMA) */}
        <section id="ofertas" className="py-12 md:py-20 bg-zinc-50 min-h-[50vh]">
          <div className="container mx-auto px-4">
             <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-4">SETUP GAMER PRONTO</h2>
                <div className="w-16 md:w-24 h-2 bg-violet-600 mx-auto rounded-full"></div>
                <p className="mt-4 text-lg md:text-xl text-slate-600">Máquinas montadas e configuradas. É só ligar e jogar.</p>
             </div>
             
             {gamerProducts.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-8 md:p-12 text-center text-gray-500 text-lg md:text-xl">
                 Carregando estoque gamer atualizado...
               </div>
             ) : (
               <PcGamerSearchGrid initialProducts={gamerProducts} />
             )}
          </div>
        </section>

        {/* BLOCO 2: PERFORMANCE */}
        <BlockPerformance />

        {/* BLOCO 3: CUSTOMIZAÇÃO */}
        <BlockCustom />

        {/* BLOCO 4: MONTAGEM DE PEÇAS (SERVIÇO) */}
        <BlockAssembly />

        {/* BLOCO 5: STRESS TEST */}
        <BlockTesting />

        {/* PRODUTOS - GRID 2 (NOVO BLOCO DE OFERTAS) */}
        <section id="mais-ofertas" className="py-12 md:py-20 bg-white min-h-[50vh]">
          <div className="container mx-auto px-4">
             <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-4">MAIS OFERTAS GAMER</h2>
                <div className="w-16 md:w-24 h-2 bg-fuchsia-600 mx-auto rounded-full"></div>
                <p className="mt-4 text-lg md:text-xl text-slate-600">Encontre o setup perfeito para você.</p>
             </div>
             
             {gamerProducts.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-8 md:p-12 text-center text-gray-500 text-lg md:text-xl">
                 Carregando estoque gamer atualizado...
               </div>
             ) : (
               <PcGamerSearchGrid initialProducts={gamerProducts} />
             )}
          </div>
        </section>

        {/* BLOCO 6: ENTREGA (Reusing delivery block logic but simpler/darker if needed, or just standard) */}
        <section className="min-h-[50vh] flex items-center bg-slate-900 text-white py-12 md:py-20">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div className="text-center md:text-left">
                  <Truck className="w-16 h-16 md:w-20 md:h-20 text-blue-400 mb-6 mx-auto md:mx-0" />
                  <h2 className="text-4xl md:text-5xl font-black mb-6">ENTREGA RÁPIDA</h2>
                  <p className="text-lg md:text-xl text-slate-300 mb-6">
                     Campinas e região recebem via motoboy. Outras cidades via transportadora com seguro total.
                  </p>
               </div>
               <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-blue-300">Região Metropolitana de Campinas</h3>
                  <ul className="space-y-3">
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Campinas</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Sumaré</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Hortolândia</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400 shrink-0"/> Paulínia</li>
                  </ul>
               </div>
            </div>
        </section>

        {/* BLOCO 7: GARANTIA */}
        <section className="py-12 md:py-20 bg-white">
           <div className="container mx-auto px-4 text-center">
              <ShieldCheck className="w-16 h-16 md:w-24 md:h-24 text-violet-600 mx-auto mb-6" />
              <h2 className="text-3xl md:text-6xl font-black text-slate-900 mb-6">GARANTIA REAL</h2>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
                 Nada de enviar peça para a China ou esperar 30 dias. A garantia é conosco, na loja física em Campinas.
              </p>
           </div>
        </section>

        {/* BLOCO 8: CTA FINAL */}
        <BlockUrgency />

      </main>
    </div>
  );
}
