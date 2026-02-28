import { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import { getProducts } from '@/lib/db'
import ProductCarousel from '@/components/ProductCarousel'
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
  Printer,
  DollarSign,
  Camera,
  Users,
  Handshake,
  Smartphone
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Venda seu PC Usado em Consignação Campinas | Avaliação Justa',
  description: 'Transforme seu computador ou notebook usado em dinheiro. Avaliação justa, segurança total e pagamento garantido em Campinas. Venda sem dor de cabeça.',
  keywords: [
    'venda pc usado campinas',
    'consignacao informatica',
    'vender notebook usado',
    'avaliacao pc gamer',
    'loja compra pc usado',
    'vender macbook campinas',
    'compro seu pc',
    'troca pc gamer',
    'balao da informatica usados',
    'reciclagem eletronicos campinas'
  ],
  alternates: {
    canonical: 'https://www.balao.info/consignacao',
  },
  openGraph: {
    title: 'Venda seu Equipamento Usado | Balão da Informática',
    description: 'Nós vendemos para você. Segurança, vitrine na loja física e pagamento garantido.',
    url: 'https://www.balao.info/consignacao',
    type: 'website',
    locale: 'pt_BR',
    images: ['/images/og-consignacao.jpg']
  }
}

export const dynamic = 'force-dynamic'

function BlockHero() {
  const breadcrumbItems = [
    { name: 'Home', item: 'https://www.balao.info' },
    { name: 'Consignação', item: 'https://www.balao.info/consignacao' }
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white overflow-hidden">
      <JsonLd data={[
        generateOrganizationSchema(),
        generateBreadcrumbSchema(breadcrumbItems)
      ]} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/40 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[800px] md:h-[800px] bg-green-600/20 rounded-full blur-[60px] md:blur-[120px] animate-pulse"></div>

      <div className="container relative z-10 px-4 text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
          <DollarSign className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
          Transforme Equipamento em Dinheiro
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-green-200 to-green-900 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-in fade-in zoom-in-50 duration-1000 leading-[0.9] py-2">
          VENDA SEU<br />
          <span className="text-stroke-white text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">USADO</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-3xl text-slate-300 max-w-4xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 px-2">
          Avaliação justa e venda rápida. Deixe a burocracia com a gente e receba o <strong className="text-green-500 font-bold">pagamento garantido</strong>.
        </p>

        <div className="pt-4 md:pt-8 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 px-4">
          <Link 
             href="https://wa.me/5519993916723?text=Quero%20vender%20meu%20computador%20usado!"
             target="_blank"
             className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all shadow-lg shadow-green-600/30 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
             <Camera className="w-5 h-5" />
             Avaliar Meu Equipamento
          </Link>
          <Link 
             href="#como-funciona"
             className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-base md:text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 backdrop-blur-sm w-full sm:w-auto"
          >
             <Settings className="w-5 h-5" />
             Como Funciona
          </Link>
        </div>
      </div>
      
      {/* Marquee Benefits */}
      <div className="absolute bottom-0 w-full bg-white/5 border-t border-white/10 py-4 md:py-6 backdrop-blur-sm overflow-hidden">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 md:gap-16 opacity-60 text-green-200 font-bold tracking-widest text-xs md:text-xl">
           <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> SEGURANÇA TOTAL</span>
           <span className="flex items-center gap-2"><Users className="w-4 h-4" /> VITRINE NA LOJA</span>
           <span className="flex items-center gap-2"><Handshake className="w-4 h-4" /> SEM CURIOSOS</span>
           <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> PAGAMENTO PIX</span>
        </div>
      </div>
    </section>
  );
}

function BlockDivider({ text, subtext }: { text: string, subtext?: string }) {
  return (
    <section className="relative py-16 md:py-32 flex flex-col items-center justify-center text-center overflow-hidden bg-black border-y border-zinc-800">
       <div className="absolute inset-0 bg-green-900/10"></div>
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
       
       <div className="relative z-10 container px-4">
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 uppercase leading-none mb-4 drop-shadow-xl break-words">
             {text}
          </h2>
          {subtext && (
             <p className="text-sm sm:text-xl md:text-2xl text-green-500 font-bold tracking-widest uppercase animate-pulse">
                {subtext}
             </p>
          )}
       </div>
    </section>
  )
}

function StepCard({ number, title, description, icon: Icon }: { number: string, title: string, description: string, icon: any }) {
   return (
      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
         <div className="relative p-8 bg-zinc-900 ring-1 ring-zinc-800 rounded-xl leading-none flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
               <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-full text-green-400 font-bold text-xl border border-green-500/20">
                  {number}
               </div>
               <Icon className="w-8 h-8 text-zinc-500 group-hover:text-green-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">{title}</h3>
            <p className="text-zinc-400 text-lg leading-relaxed">{description}</p>
         </div>
      </div>
   )
}

function BlockSteps() {
   return (
      <section id="como-funciona" className="py-20 bg-zinc-950 relative overflow-hidden">
         <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               <StepCard 
                  number="1"
                  title="Contato"
                  description="Envie fotos e especificações do seu equipamento pelo nosso WhatsApp."
                  icon={Smartphone}
               />
               <StepCard 
                  number="2"
                  title="Avaliação"
                  description="Nossos técnicos avaliam o estado e definimos juntos um preço justo de venda."
                  icon={Search}
               />
               <StepCard 
                  number="3"
                  title="Exposição"
                  description="Seu produto fica exposto em nossa loja física e site para milhares de clientes."
                  icon={Users}
               />
               <StepCard 
                  number="4"
                  title="Pagamento"
                  description="Assim que vendido, transferimos o valor combinado via PIX para sua conta."
                  icon={DollarSign}
               />
            </div>
         </div>
      </section>
   )
}

function BlockUrgency() {
   return (
      <section className="py-20 bg-green-600 text-white text-center relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
         <div className="container mx-auto px-4 max-w-4xl space-y-8 relative z-10">
            <h2 className="text-4xl md:text-7xl font-black tracking-tight">
               QUER VENDER RÁPIDO?
            </h2>
            <p className="text-xl md:text-3xl font-medium opacity-90">
               Temos uma lista de espera de compradores procurando equipamentos usados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
               <a 
                  href="https://wa.me/5519993916723?text=Quero%20vender%20hoje!"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white text-green-900 px-8 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto"
               >
                  <DollarSign className="w-6 h-6 animate-pulse" />
                  AVALIAR AGORA
               </a>
            </div>
            <p className="text-sm opacity-75 mt-4 font-mono">
               Campinas e Região • Pagamento Seguro • Sem Burocracia
            </p>
         </div>
      </section>
   );
}

export default async function ConsignacaoPage() {
  const allProducts = await getProducts()
  
  // Helper para filtrar o que aceitamos (simulação com produtos novos)
  const acceptedExamples = allProducts.filter(p => {
    const text = (p.name + " " + (p.description || "")).toLowerCase()
    return ['notebook', 'pc', 'gamer', 'placa', 'video'].some(k => text.includes(k))
  }).slice(0, 12)

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans">
      <Header />
      <main className="flex-1">
        
        <BlockHero />

        <BlockSteps />

        <BlockDivider text="O QUE ACEITAMOS" subtext="Equipamentos com Alta Procura" />

        <section className="bg-zinc-900 py-20 relative">
           <div className="container mx-auto px-4">
              <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12 text-lg">
                 Aceitamos equipamentos em bom estado, com menos de 5 anos de uso. 
                 Notebooks, PCs Gamer, Placas de Vídeo e Monitores são os mais procurados.
              </p>
              <ProductCarousel 
                 title="Exemplos do que Vendemos" 
                 products={acceptedExamples} 
              />
           </div>
        </section>

        {/* CTA FINAL */}
        <BlockUrgency />

      </main>
    </div>
  )
}