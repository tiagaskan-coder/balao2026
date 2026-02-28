import { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/db'
import ProductCarousel from '@/components/ProductCarousel'
import { ALL_SERVICES, SERVICE_CATEGORIES } from './data'
import JsonLd, { generateOrganizationSchema, generateBreadcrumbSchema } from '@/components/JsonLd'
import { 
  CheckCircle, 
  MessageCircle, 
  Search,
  Truck, 
  Award,
  MapPin,
  ChevronDown,
  Star,
  Wrench,
  ShieldCheck,
  Zap,
  Cpu,
  Server,
  Wifi,
  Activity,
  MousePointer2,
  Settings,
  Lock,
  Printer
} from 'lucide-react'
import { Product } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Assistência Técnica Especializada Campinas e Nacional | Balão da Informática',
  description: 'Conserto de Notebooks, PC Gamer e MacBooks. Serviço expresso em Campinas, Sumaré, Hortolândia e Valinhos. Atendimento Nacional via Correios com Garantia.',
  keywords: [
    'conserto notebook campinas',
    'assistência técnica pc gamer',
    'reparo macbook nacional',
    'formatação expressa',
    'troca de tela notebook',
    'upgrade ssd campinas',
    'loja de informática valinhos',
    'manutenção computadores sumaré',
    'envio correios reparo',
    'balão da informática serviços'
  ],
  alternates: {
    canonical: 'https://www.balao.info/servicos-e-ofertas',
  },
  openGraph: {
    title: 'Assistência Técnica Premium | Campinas e Todo Brasil',
    description: 'Especialistas em Hardware e Software. Serviço Expresso em Campinas e Região. Envie de todo Brasil com segurança.',
    url: 'https://www.balao.info/servicos-e-ofertas',
    type: 'website',
    locale: 'pt_BR',
    images: ['/images/og-servicos.jpg']
  }
}

export const dynamic = 'force-dynamic'

// Mapeamento de palavras-chave por categoria para relevância de produtos
const categoryKeywords: Record<string, string[]> = {
  'software': ['office', 'windows', 'antivirus', 'software', 'sistema', 'digital', 'licença'],
  'hardware': ['placa', 'memoria', 'ssd', 'hd', 'processador', 'cooler', 'fonte', 'gabinete', 'monitor'],
  'network': ['roteador', 'cabo', 'rede', 'wifi', 'switch', 'adaptador', 'usb'],
  'performance': ['gamer', 'rtx', 'gtx', 'ryzen', 'core', 'ram', 'nvme', 'kit'],
  'corporate': ['servidor', 'workstation', 'impressora', 'toner', 'cartucho', 'scanner', 'nobreak']
}

// --- COMPONENTS DE BLOCO ---

function BlockHero() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Serviços e Ofertas', item: 'https://www.balao.info/servicos-e-ofertas' }
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[800px] md:h-[800px] bg-red-600/20 rounded-full blur-[60px] md:blur-[120px] animate-pulse"></div>

      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Wrench className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
          Assistência Técnica Premium
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-red-200 to-red-900 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-[0.9] py-2">
          REPARO<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">EXTREMO</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-2">
          Do software ao hardware. Recuperamos seu equipamento com <strong className="text-red-500 font-bold">peças originais</strong> e garantia total.
        </p>

        <div className="pt-4 md:pt-8 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 px-4">
          <Link 
             href="https://wa.me/5519993916723?text=Ol%C3%A1%2C%20preciso%20de%20assist%C3%AAncia%20t%C3%A9cnica!"
             target="_blank"
             className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all shadow-lg shadow-red-600/30 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
             <MessageCircle className="w-5 h-5" />
             Orçamento Rápido
          </Link>
          <Link 
             href="#servicos"
             className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm w-full sm:w-auto"
          >
             Ver Serviços
          </Link>
        </div>
      </div>
      
      {/* Marquee Techs */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-red-200 font-bold tracking-widest text-xs md:text-xl">
           <span>DIAGNÓSTICO</span>
           <span>REPARO PLACA</span>
           <span>BIOS</span>
           <span>BGA</span>
           <span>LIMPEZA</span>
           <span>UPGRADE</span>
           <span>REDES</span>
        </div>
      </div>
    </section>
  );
}

function BlockDivider({ text, subtext }: { text: string, subtext?: string }) {
  return (
    <section className="relative py-16 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden bg-black border-y border-zinc-800">
       <div className="absolute inset-0 bg-red-900/10"></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
       
       <div className="relative z-10 container px-4">
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 uppercase leading-none mb-4 drop-shadow-xl break-words">
             {text}
          </h2>
          {subtext && (
             <p className="text-sm sm:text-xl md:text-2xl text-red-500 font-bold tracking-widest uppercase animate-pulse">
                {subtext}
             </p>
          )}
       </div>
    </section>
  )
}

function ServiceCard({ service }: { service: any }) {
  const Icon = service.icon
  return (
    <div className="group bg-zinc-900/50 backdrop-blur border border-zinc-800 p-4 md:p-6 rounded-3xl hover:border-red-500 transition-all hover:bg-zinc-900/80">
      <details className="w-full group/details">
        <summary className="flex items-start cursor-pointer list-none relative select-none">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 items-start">
             <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-red-500 group-hover:bg-red-500/10 transition-all shrink-0 border border-zinc-700 group-hover:border-red-500/30">
                <Icon className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-2 pr-6 sm:pr-0">
                    {service.title}
                </h3>
                <p className="text-zinc-400 mt-2 text-sm leading-relaxed pr-8">
                    {service.shortDescription}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 group-open/details:hidden">
                  <span className="text-red-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Ver Detalhes
                  </span>
                </div>
             </div>
          </div>
          <div className="absolute right-0 top-0 text-zinc-500 transition-transform duration-300 group-open/details:rotate-180">
              <ChevronDown className="w-5 h-5" />
          </div>
        </summary>
        
        <div className="mt-6 pt-6 border-t border-zinc-800 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Search className="w-4 h-4" /> Sintomas
                    </h4>
                    <ul className="space-y-2 mb-6">
                        {service.symptoms?.map((s: string, i: number) => (
                            <li key={i} className="text-zinc-300 flex items-start gap-2 text-sm">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>

                    <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Wrench className="w-4 h-4" /> O que fazemos
                    </h4>
                    <ul className="space-y-2">
                        {service.process?.map((p: string, i: number) => (
                            <li key={i} className="text-zinc-300 flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50">
                    <p className="text-zinc-400 text-sm italic leading-relaxed mb-6">
                        "{service.longDescription}"
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm pt-4 border-t border-zinc-700/50">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span>Garantia: <span className="text-white font-bold">{service.warranty}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Truck className="w-4 h-4 text-blue-400" />
                            <span>Prazo: <span className="text-white font-bold">{service.time}</span></span>
                        </div>
                    </div>
                    <Link 
                        href={`https://wa.me/5519993916723?text=Olá, gostaria de um orçamento para: ${service.title}`}
                        target="_blank"
                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-bold text-center text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Orçamento via WhatsApp
                    </Link>
                </div>
            </div>
        </div>
      </details>
    </div>
  )
}

function BlockCategory({ category, isDark = true, reverse = false }: { category: any, isDark?: boolean, reverse?: boolean }) {
  const categoryServices = ALL_SERVICES.filter(s => s.categoryId === category.id)
  
  return (
    <section id={category.id} className={`py-12 md:py-20 relative overflow-hidden ${isDark ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {isDark && (
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] pointer-events-none"></div>
      )}
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`flex flex-col lg:flex-row gap-8 lg:gap-20 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
           
           {/* Header da Categoria */}
           <div className="lg:w-1/3 space-y-4 md:space-y-8 relative lg:sticky lg:top-24 h-fit z-10">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-xs md:text-sm font-bold uppercase tracking-widest ${isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-100 border-red-200 text-red-700'}`}>
                 <category.icon className="w-3 h-3 md:w-4 md:h-4" />
                 {category.title}
              </div>
              
              <h2 className={`text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                 {category.title.split(' ').slice(0, 2).join(' ')} <br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    {category.title.split(' ').slice(2).join(' ')}
                 </span>
              </h2>
              
              <p className={`text-sm sm:text-base md:text-xl font-medium leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                 {category.description}
              </p>

              <div className="block pt-2">
                 <Link 
                    href="https://wa.me/5519993916723"
                    target="_blank"
                    className={`inline-flex items-center gap-2 md:gap-3 font-bold text-base md:text-lg hover:underline ${isDark ? 'text-red-400' : 'text-red-600'}`}
                 >
                    Falar com Técnico <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                 </Link>
              </div>
           </div>

           {/* Lista de Serviços */}
           <div className="lg:w-2/3 grid grid-cols-1 gap-4 md:gap-6">
              {categoryServices.map((service, idx) => (
                 <div key={idx} className={isDark ? '' : 'shadow-lg shadow-slate-200'}>
                    <ServiceCard service={service} />
                 </div>
              ))}
           </div>

        </div>
      </div>
    </section>
  )
}

function BlockUrgency() {
   return (
      <section className="py-20 bg-red-600 text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="container mx-auto px-4 max-w-4xl space-y-8 relative z-10">
            <h2 className="text-4xl md:text-7xl font-black tracking-tight">
               SEU PC PAROU?
            </h2>
            <p className="text-xl md:text-3xl font-medium opacity-90">
               Não entre em pânico. Resolvemos 90% dos problemas em até 24 horas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
               <a 
                  href="https://wa.me/5519993916723?text=SOS%20Meu%20PC%20Parou!"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-red-900 px-8 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto"
               >
                  <Activity className="w-6 h-6 animate-pulse" />
                  SOS EMERGÊNCIA
               </a>
            </div>
            <p className="text-sm opacity-75 mt-4 font-mono">
               Plantão WhatsApp • Atendimento Rápido • Campinas e Região
            </p>
         </div>
      </section>
   );
}

export default async function ServicesPage() {
  const allProducts = await getProducts()
  
  // Helper para parsear preço
  const parsePrice = (p: string) => {
    if (!p) return 0
    const clean = p.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(clean) || 0
  }

  // Set para rastrear produtos já exibidos
  const usedProductIds = new Set<string>()

  // Função para obter produtos únicos
  const getUniqueRelevantProducts = (categoryId: string, count: number) => {
    const keywords = categoryKeywords[categoryId] || []
    
    const relevant = allProducts.filter(p => {
      if (usedProductIds.has(p.id)) return false
      const text = (p.name + " " + (p.description || "")).toLowerCase()
      return keywords.some(k => text.includes(k))
    }).sort((a, b) => parsePrice(a.price) - parsePrice(b.price))

    let result = relevant.slice(0, count)
    
    if (result.length < count) {
      const remaining = allProducts
        .filter(p => !usedProductIds.has(p.id) && !result.find(r => r.id === p.id))
        .sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
      
      result = [...result, ...remaining.slice(0, count - result.length)]
    }

    result.forEach(p => usedProductIds.add(p.id))
    return result
  }

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans">
      <main className="flex-1">
        
        {/* HERO */}
        <BlockHero />

        {/* ANCORAS RAPIDAS */}
        <div className="bg-zinc-900 border-b border-zinc-800 py-4 overflow-x-auto sticky top-0 z-50 backdrop-blur-md bg-zinc-900/80">
           <div className="container mx-auto px-4 flex gap-4 min-w-max">
              {SERVICE_CATEGORIES.map((cat) => (
                 <a 
                    key={cat.id} 
                    href={`#${cat.id}`}
                    className="px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors text-sm font-bold flex items-center gap-2"
                 >
                    <cat.icon className="w-4 h-4" />
                    {cat.title}
                 </a>
              ))}
           </div>
        </div>

        {/* CATEGORIAS */}
        <div id="servicos">
            <BlockCategory category={SERVICE_CATEGORIES[0]} isDark={true} /> {/* Software */}
            
            {/* OFERTAS SOFTWARE */}
            <section className="bg-zinc-950 py-12 border-t border-zinc-900">
               <div className="container mx-auto px-4">
                  <ProductCarousel 
                     title="Licenças e Software" 
                     products={getUniqueRelevantProducts('software', 8)} 
                  />
               </div>
            </section>

            <BlockDivider text="HARDWARE" subtext="Reparo de Precisão" />

            <BlockCategory category={SERVICE_CATEGORIES[1]} isDark={false} reverse={true} /> {/* Hardware (Light) */}
            
            {/* OFERTAS HARDWARE */}
            <section className="bg-slate-100 py-12 border-t border-slate-200">
               <div className="container mx-auto px-4">
                  <ProductCarousel 
                     title="Peças para Upgrade" 
                     products={getUniqueRelevantProducts('hardware', 8)} 
                  />
               </div>
            </section>

            <BlockDivider text="PERFORMANCE" subtext="Extraia o Máximo" />

            <BlockCategory category={SERVICE_CATEGORIES[3]} isDark={true} /> {/* Performance */}
            
            <BlockDivider text="CONECTIVIDADE" subtext="Redes e Internet" />

            <BlockCategory category={SERVICE_CATEGORIES[2]} isDark={false} reverse={true} /> {/* Redes (Light) */}

            <BlockDivider text="CORPORATIVO" subtext="Soluções B2B" />

            <BlockCategory category={SERVICE_CATEGORIES[4]} isDark={true} /> {/* Corporativo */}
        </div>

        {/* CTA FINAL */}
        <BlockUrgency />

      </main>
    </div>
  )
}
