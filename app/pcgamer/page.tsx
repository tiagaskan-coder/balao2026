import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import { getProducts, getCategories } from "@/lib/db";
import { Product, Category } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import HeroCTA from "@/components/HeroCTA";
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
  title: "PC Gamer em Campinas | Balão da Informática",
  description:
    "PC Gamer de alta performance em Campinas. Montagem profissional, setups personalizados e garantia local. Processadores Intel/AMD e Placas RTX.",
  openGraph: {
    title: "PC Gamer em Campinas | Balão da Informática",
    description:
      "PC Gamer de alta performance. Montagem profissional, setups personalizados e garantia local.",
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

      <div className="container relative z-10 px-4 text-center space-y-8">
        
        {/* Floating Element - Left */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-64 h-64 hidden 2xl:block opacity-60 pointer-events-none">
           <Image src="/images/prizes/headset.png" alt="Headset Gamer" fill className="object-contain drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] animate-float" />
        </div>

        {/* Floating Element - Right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-96 h-96 hidden 2xl:block opacity-80 pointer-events-none">
           <Image src="/images/prizes/pc.png" alt="PC Gamer High End" fill className="object-contain drop-shadow-[0_0_50px_rgba(139,92,246,0.5)] animate-float-delayed" />
        </div>

        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Gamepad2 className="w-4 h-4 animate-bounce" />
          Campinas e Região
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-violet-200 to-violet-900 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-none">
          PC GAMER<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">INSANO</span>
        </h1>
        
        <p className="text-xl md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Chega de lag. Domine o jogo com máquinas projetadas para <strong className="text-violet-400 font-bold">performance extrema</strong> e visual impecável.
        </p>

        <div className="pt-8 flex justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <HeroCTA />
        </div>
      </div>
      
      {/* Marquee Games */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 text-violet-200 font-bold tracking-widest text-sm md:text-xl">
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
    <section className="min-h-[80vh] flex items-center bg-zinc-950 text-white py-20 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
       
       <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-8 rounded-3xl hover:border-violet-500 transition-colors group">
                   <Cpu className="w-12 h-12 text-violet-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-2xl font-bold mb-2">Processadores</h3>
                   <p className="text-zinc-400">Intel Core i9 / i7 / i5 e AMD Ryzen 9 / 7 / 5 de última geração.</p>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-8 rounded-3xl hover:border-fuchsia-500 transition-colors group">
                   <MonitorPlay className="w-12 h-12 text-fuchsia-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-2xl font-bold mb-2">Placas de Vídeo</h3>
                   <p className="text-zinc-400">RTX 4090, 4080, 4070, 4060. Ray Tracing e DLSS no máximo.</p>
                </div>
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 p-8 rounded-3xl hover:border-cyan-500 transition-colors group col-span-2">
                   <Zap className="w-12 h-12 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
                   <h3 className="text-2xl font-bold mb-2">Alta Performance</h3>
                   <p className="text-zinc-400">Memórias DDR5 de alta frequência e SSDs NVMe Gen4 com velocidades absurdas de leitura e escrita.</p>
                </div>
             </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-8 text-right lg:text-left">
             <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                FPS NO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">TALO</span>
             </h2>
             <p className="text-2xl md:text-3xl font-medium text-zinc-300 leading-snug">
                Não jogue para participar. Jogue para ganhar. Cada frame conta na hora do clutch.
             </p>
             <div className="flex flex-col lg:flex-row gap-6 justify-end lg:justify-start">
                <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                   <div className="text-4xl font-black text-green-400">300+</div>
                   <div className="text-sm font-bold uppercase tracking-wider text-zinc-500">FPS<br/>Competitivo</div>
                </div>
                <div className="flex items-center gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                   <div className="text-4xl font-black text-purple-400">4K</div>
                   <div className="text-sm font-bold uppercase tracking-wider text-zinc-500">Resolução<br/>Ultra</div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

function BlockCustom() {
  return (
    <section className="min-h-[70vh] flex items-center bg-slate-100 text-slate-900 py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900">
                MONTE DO<br/>
                <span className="text-blue-600">SEU JEITO</span>
              </h2>
              <p className="text-2xl text-slate-600 leading-relaxed">
                 Tem uma configuração dos sonhos em mente? Nós tornamos realidade. Escolha gabinete, cooler, fans RGB e muito mais.
              </p>
              <ul className="space-y-4 text-xl font-semibold text-slate-700">
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    <span>Orçamento personalizado via WhatsApp</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    <span>Compatibilidade de peças verificada</span>
                 </li>
                 <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    <span>Sugestões de upgrade futuro</span>
                 </li>
              </ul>
           </div>
           <div className="flex-1 relative">
              {/* Placeholder for visual representation */}
              <div className="relative aspect-square bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full blur-3xl opacity-20 absolute inset-0"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-slate-200">
                 <Wrench className="w-24 h-24 text-blue-600 mb-6 mx-auto" />
                 <h3 className="text-3xl font-bold text-center mb-4">Consultoria Grátis</h3>
                 <p className="text-center text-slate-600 text-lg mb-8">
                    Não sabe qual peça escolher? Nossos especialistas te ajudam a montar o melhor setup para o seu orçamento.
                 </p>
                 <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    Chamar Especialista
                 </button>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

function BlockAssembly() {
    return (
      <section className="min-h-[60vh] flex items-center bg-zinc-900 text-white py-20 border-y border-zinc-800">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-12">
               COMPROU NA INTERNET? <br/>
               <span className="text-emerald-400">A GENTE MONTA!</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
               <div className="bg-zinc-800 p-8 rounded-3xl border border-zinc-700 hover:border-emerald-500 transition-all hover:-translate-y-2">
                  <PackageCheck className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Recebemos suas Peças</h3>
                  <p className="text-zinc-400">
                     Pode comprar na Kabum, Terabyte, Pichau... Traga as caixas lacradas que nós cuidamos do resto.
                  </p>
               </div>
               <div className="bg-zinc-800 p-8 rounded-3xl border border-zinc-700 hover:border-emerald-500 transition-all hover:-translate-y-2">
                  <Zap className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Montagem Premium</h3>
                  <p className="text-zinc-400">
                     Cable management impecável (fios escondidos), aplicação de pasta térmica de prata e fixação segura.
                  </p>
               </div>
               <div className="bg-zinc-800 p-8 rounded-3xl border border-zinc-700 hover:border-emerald-500 transition-all hover:-translate-y-2">
                  <MonitorPlay className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Drivers e BIOS</h3>
                  <p className="text-zinc-400">
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
      <section className="min-h-[60vh] flex items-center bg-red-950 text-white py-20 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
         <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 font-bold mb-6">
                  <Flame className="w-5 h-5 animate-pulse" />
                  Stress Test Aprovado
               </div>
               <h2 className="text-5xl md:text-8xl font-black leading-none mb-6">
                  TESTADO<br/>NO LIMITE
               </h2>
               <p className="text-xl md:text-2xl text-red-100 opacity-80 leading-relaxed">
                  Não entregamos o PC apenas "ligando". Todas as máquinas passam por baterias de testes de stress de CPU e GPU para garantir que não haverá superaquecimento ou telas azuis durante sua gameplay.
               </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
               <div className="bg-black/40 backdrop-blur p-6 rounded-2xl border border-red-500/30">
                  <ThermometerSun className="w-10 h-10 text-red-500 mb-3" />
                  <div className="text-3xl font-bold">Temperatura</div>
                  <div className="text-sm opacity-70">Monitoramento térmico</div>
               </div>
               <div className="bg-black/40 backdrop-blur p-6 rounded-2xl border border-red-500/30">
                  <Zap className="w-10 h-10 text-yellow-500 mb-3" />
                  <div className="text-3xl font-bold">Voltagem</div>
                  <div className="text-sm opacity-70">Estabilidade de energia</div>
               </div>
            </div>
         </div>
      </section>
   );
}

function BlockUrgency() {
   return (
      <section className="py-20 bg-emerald-600 text-white text-center">
         <div className="container mx-auto px-4 max-w-4xl space-y-8">
            <h2 className="text-4xl md:text-6xl font-black">
               PRONTO PARA O PRÓXIMO NÍVEL?
            </h2>
            <p className="text-xl md:text-2xl font-medium opacity-90">
               Não perca mais partidas por causa de FPS baixo. Garanta sua máquina hoje.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
               <button className="bg-white text-emerald-900 px-8 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl flex items-center justify-center gap-3">
                  <MessageCircle className="w-6 h-6" />
                  CHAMAR NO WHATSAPP AGORA
               </button>
            </div>
            <p className="text-sm opacity-75 mt-4">
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

        {/* BLOCO 2: PERFORMANCE */}
        <BlockPerformance />

        {/* BLOCO 3: CUSTOMIZAÇÃO */}
        <BlockCustom />

        {/* PRODUTOS - GRID */}
        <section id="ofertas" className="py-20 bg-zinc-50 min-h-[50vh]">
          <div className="container mx-auto px-4">
             <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4">SETUP GAMER PRONTO</h2>
                <div className="w-24 h-2 bg-violet-600 mx-auto rounded-full"></div>
                <p className="mt-4 text-xl text-slate-600">Máquinas montadas e configuradas. É só ligar e jogar.</p>
             </div>
             
             {gamerProducts.length === 0 ? (
               <div className="bg-white border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center text-gray-500 text-xl">
                 Carregando estoque gamer atualizado...
               </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                   {gamerProducts.map((item) => (
                     <ProductCard key={item.id} product={item} />
                   ))}
                 </div>
             )}
          </div>
        </section>

        {/* BLOCO 4: MONTAGEM DE PEÇAS (SERVIÇO) */}
        <BlockAssembly />

        {/* BLOCO 5: STRESS TEST */}
        <BlockTesting />

        {/* BLOCO 6: ENTREGA (Reusing delivery block logic but simpler/darker if needed, or just standard) */}
        <section className="min-h-[50vh] flex items-center bg-slate-900 text-white py-20">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div>
                  <Truck className="w-20 h-20 text-blue-400 mb-6" />
                  <h2 className="text-5xl font-black mb-6">ENTREGA RÁPIDA</h2>
                  <p className="text-xl text-slate-300 mb-6">
                     Campinas e região recebem via motoboy. Outras cidades via transportadora com seguro total.
                  </p>
               </div>
               <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
                  <h3 className="text-2xl font-bold mb-4 text-blue-300">Região Metropolitana de Campinas</h3>
                  <ul className="space-y-3">
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400"/> Campinas</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400"/> Sumaré</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400"/> Hortolândia</li>
                     <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400"/> Paulínia</li>
                  </ul>
               </div>
            </div>
        </section>

        {/* BLOCO 7: GARANTIA */}
        <section className="py-20 bg-white">
           <div className="container mx-auto px-4 text-center">
              <ShieldCheck className="w-24 h-24 text-violet-600 mx-auto mb-6" />
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">GARANTIA REAL</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
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
