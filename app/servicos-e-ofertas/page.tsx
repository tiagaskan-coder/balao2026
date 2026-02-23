import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProductById } from '@/lib/db'
import OfferCountdown from '@/components/OfferCountdown'
import { 
  CheckCircle, 
  MessageCircle, 
  Wrench, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Zap, 
  Truck, 
  Award,
  Monitor,
  Smartphone,
  Wifi,
  Database,
  Search,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Serviços de Informática e Ofertas Especiais | Balão da Informática Campinas',
  description:
    'Assistência técnica especializada em notebooks e computadores em Campinas. Promoções exclusivas de iPhone, Apple Watch e Monitores com entrega rápida. Mão de obra qualificada e garantia.',
  keywords: [
    'assistência técnica informática campinas',
    'conserto de notebook campinas',
    'montagem de pc gamer campinas',
    'iphone 17 pro max preço',
    'apple watch se 3 promoção',
    'monitor dell 27 polegadas',
    'formatação de computador campinas',
    'limpeza de pc gamer',
    'balão da informática serviços'
  ],
  openGraph: {
    title: 'Serviços de TI e Ofertas Relâmpago | Balão da Informática',
    description:
      'Confira nossas ofertas imperdíveis e serviços de assistência técnica especializada em Campinas. Qualidade, garantia e preço justo.',
    url: '/servicos-e-ofertas',
    type: 'website',
    images: ['/images/og-servicos.jpg']
  },
  robots: { index: true, follow: true }
}

const FEATURED_SERVICES = [
  {
    title: "Manutenção Especializada de Notebooks",
    description: "Reparo avançado de placa-mãe, troca de telas, teclados, baterias e carcaças. Soluções para equipamentos que não ligam, esquentam ou travam.",
    icon: Smartphone, // Using Smartphone as closest match for mobile devices/laptops if Laptop not imported
    details: ["Reballing de BGA", "Reparo de circuito de carga", "Troca de DC-Jack", "Limpeza química"]
  },
  {
    title: "Montagem e Otimização de PC Gamer",
    description: "Montagem profissional com cable management impecável. Otimização de BIOS, curvas de ventoinha e testes de estabilidade para máxima performance.",
    icon: Cpu,
    details: ["Consultoria de peças", "Overclock seguro", "Instalação de Water Cooler", "Personalização RGB"]
  },
  {
    title: "Upgrades de Performance (SSD e RAM)",
    description: "Deixe seu computador até 10x mais rápido com a instalação de SSDs NVMe e expansão de memória RAM. Clonagem de sistema sem perda de dados.",
    icon: HardDrive,
    details: ["Clonagem de HD para SSD", "Dual Channel", "Instalação de Heatsinks", "Backup de dados"]
  },
  {
    title: "Redes e Infraestrutura Wi-Fi",
    description: "Projetos de rede cabeada e Wi-Fi para residências e empresas. Configuração de roteadores, repetidores e servidores para conexão estável.",
    icon: Wifi,
    details: ["Cabeamento estruturado", "Configuração de Mesh", "Servidores de Arquivos", "VPN"]
  },
  {
    title: "Recuperação de Dados e Backup",
    description: "Recuperação profissional de arquivos deletados ou de HDs danificados. Implementação de rotinas de backup automático local e em nuvem.",
    icon: Database,
    details: ["Recuperação de HD/SSD", "Backup em Nuvem", "Restauração de Sistema", "Proteção de Dados"]
  },
  {
    title: "Limpeza e Manutenção Preventiva",
    description: "Aumente a vida útil do seu equipamento. Limpeza interna completa, troca de pasta térmica de alta condutividade e higienização externa.",
    icon: Wrench,
    details: ["Pasta térmica Silver/Gold", "Limpeza de contatos", "Desoxidação", "Lubrificação de fans"]
  }
]

const maisDe50Servicos = [
  'Formatação com backup completo',
  'Instalação do Windows 11/10',
  'Remoção de vírus e malware',
  'Otimização de sistema lento',
  'Testes de estabilidade (Stress Test)',
  'Instalação de Pacote Office',
  'Configuração de Outlook/E-mail',
  'Upgrade de Placa de Vídeo',
  'Troca de Fonte de Alimentação',
  'Reparo de Carcaça e Dobradiças',
  'Solda de Componentes SMD',
  'Atualização de BIOS',
  'Correção de BIOS Corrompida',
  'Configuração de RAID 0/1/5',
  'Crimpagem de Cabos de Rede',
  'Configuração de Firewall Básico',
  'Compartilhamento de Impressoras',
  'Instalação de Impressoras Wi-Fi',
  'Manutenção Preventiva de Impressoras',
  'Criação de Pendrive Bootável',
  'Diagnóstico de Hardware Defeituoso',
  'Ajuste de Curva de Ventoinha',
  'Undervolt de Processador/GPU',
  'Calibração de Cores de Monitor',
  'Suporte Remoto (AnyDesk/TeamViewer)',
  'Inventário de Hardware/Software',
  'Consultoria para Upgrades',
  'Laudo Técnico para Seguradoras'
]

const FEATURED_PRODUCT_IDS = [
  'd2da0079-5b31-42b2-80bd-f2035ebefd04', // iPhone 17 Pro Max
  '32cb7fe9-d6fe-4a09-9e18-580d267d36ad', // Apple Watch SE 3
  '0ebb9fd9-f161-41a7-bb14-c545b1164ca2'  // Monitor Dell 27
]

export const dynamic = 'force-dynamic'

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0
  // Remove R$, dots, replace comma with dot
  const clean = priceStr.replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

function formatPrice(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function Page() {
  const products = await Promise.all(
    FEATURED_PRODUCT_IDS.map(id => getProductById(id))
  )

  const validProducts = products.filter(p => p !== null)

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 font-sans selection:bg-red-900 selection:text-white">
      
      {/* Header with Logo */}
      <header className="bg-white/95 backdrop-blur-sm fixed top-0 w-full z-50 border-b border-red-600 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="https://www.balao.info" className="hover:opacity-80 transition-opacity">
             <Image 
               src="/logo.png" 
               alt="Balão da Informática" 
               width={180} 
               height={60} 
               className="h-12 w-auto object-contain"
               priority
             />
          </Link>
          <Link 
            href="https://wa.me/5519987510267"
            className="hidden sm:flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-red-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            (19) 98751-0267
          </Link>
        </div>
      </header>

      {/* Hero Section - Dark & Contrasting */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black opacity-80" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-900/30 border border-red-500/30 text-red-400 text-sm font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Award className="w-4 h-4" />
            Excelência em Campinas
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-tight">
            SERVIÇOS <span className="text-red-600">PREMIUM</span><br/>
            & OFERTAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">INSANAS</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            A referência em tecnologia de Campinas. Assistência técnica especializada e os produtos mais desejados com preços que você só encontra aqui.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="https://wa.me/5519987510267" 
              className="inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg shadow-red-900/50 transition-all hover:scale-105 hover:shadow-red-600/50"
            >
              <MessageCircle className="w-6 h-6" />
              Falar com Especialista
            </Link>
            <Link 
              href="#ofertas" 
              className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-lg font-bold py-4 px-10 rounded-xl transition-all"
            >
              <Zap className="w-6 h-6" />
              Ver Ofertas Relâmpago
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section - White Background for Contrast */}
      <section id="ofertas" className="py-20 bg-white text-zinc-900">
        <div className="container mx-auto px-4 mb-16">
          <div className="flex items-center gap-4 mb-4 justify-center">
            <div className="h-1 w-12 bg-red-600 rounded-full" />
            <h2 className="text-3xl md:text-5xl font-black text-zinc-900 uppercase tracking-tight text-center">
              Ofertas <span className="text-red-600">Relâmpago</span>
            </h2>
            <div className="h-1 w-12 bg-red-600 rounded-full" />
          </div>
          <p className="text-center text-zinc-500 font-medium text-lg">Produtos selecionados com preços exclusivos para o site.</p>
        </div>

        <div className="space-y-20 container mx-auto px-4 max-w-6xl">
          {validProducts.map((product, index) => {
            const currentPrice = parsePrice(product?.price || '0');
            const originalPrice = currentPrice * 1.4; // 40% markup for "De" price

            return (
              <div 
                key={product?.id || index} 
                className="group relative bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl overflow-hidden hover:shadow-red-900/10 transition-all duration-500"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Image Section */}
                  <div className="relative h-[400px] lg:h-[600px] bg-zinc-50 flex items-center justify-center p-12 overflow-hidden group-hover:bg-red-50/30 transition-colors duration-500">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-zinc-50 to-zinc-100 opacity-80" />
                    {product?.image ? (
                      <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain drop-shadow-2xl"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          priority={index === 0}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-zinc-100 text-zinc-300 rounded-3xl">
                        <span className="text-xl font-bold">Imagem Indisponível</span>
                      </div>
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-8 left-8 bg-red-600 text-white text-sm font-bold px-6 py-3 rounded-full shadow-xl z-10 flex items-center gap-2">
                      <Zap className="w-4 h-4 fill-current" />
                      OFERTA EXCLUSIVA
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-10 lg:p-16 flex flex-col justify-center bg-white relative">
                    <div className="mb-8">
                      <OfferCountdown />
                    </div>

                    <h3 className="text-3xl lg:text-5xl font-black text-zinc-900 mb-6 leading-none tracking-tight">
                      {product?.name}
                    </h3>

                    <div className="flex flex-col gap-2 mb-10 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex items-baseline gap-4 flex-wrap">
                        <span className="text-lg text-zinc-400 line-through font-medium">
                          de {formatPrice(originalPrice)}
                        </span>
                        <span className="text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-full uppercase tracking-wider">
                          Economize {formatPrice(originalPrice - currentPrice)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                         <span className="text-6xl lg:text-7xl font-black text-zinc-900 tracking-tighter">
                          {product?.price ? (
                             // If product.price already has currency symbol, use it, else format
                             product.price.includes('R$') ? product.price : formatPrice(currentPrice)
                          ) : 'R$ ---'}
                        </span>
                      </div>
                      <span className="text-zinc-500 font-medium flex items-center gap-2 mt-2">
                        <CheckCircle className="w-5 h-5 text-green-500" /> 
                        À vista no PIX com 10% de desconto extra
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-10">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600">
                           <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">Entrega Rápida</p>
                          <p className="text-sm text-zinc-500">Campinas e região</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-600">
                           <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">Garantia Total</p>
                          <p className="text-sm text-zinc-500">Direto com a loja</p>
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={`/product/${product?.id}`}
                      className="w-full group/btn bg-zinc-900 hover:bg-red-600 text-white text-xl font-bold py-6 px-8 rounded-2xl shadow-xl hover:shadow-red-600/30 transition-all text-center flex items-center justify-center gap-4"
                    >
                      COMPRAR AGORA
                      <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Services List Section - Dark again for contrast */}
      <section className="py-24 bg-zinc-900 text-white border-t border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
              SOLUÇÕES EM <span className="text-red-600">TECNOLOGIA</span>
            </h2>
            <p className="text-xl text-zinc-400 font-light">
              Nossa equipe técnica é certificada e preparada para resolver qualquer problema. 
              Confira os serviços mais procurados por nossos clientes.
            </p>
          </div>

          {/* Featured Services Blocks - Large & Detailed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {FEATURED_SERVICES.map((service, idx) => (
               <div key={idx} className="bg-zinc-800/50 backdrop-blur-sm p-8 rounded-3xl border border-zinc-700/50 hover:border-red-600/50 hover:bg-zinc-800 transition-all group">
                 <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 text-red-600 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg border border-zinc-700">
                   <service.icon className="w-8 h-8" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-500 transition-colors">{service.title}</h3>
                 <p className="text-zinc-400 mb-6 leading-relaxed">
                   {service.description}
                 </p>
                 <ul className="space-y-2 mb-8">
                   {service.details.map((detail, i) => (
                     <li key={i} className="flex items-center gap-2 text-zinc-500 text-sm group-hover:text-zinc-300 transition-colors">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                       {detail}
                     </li>
                   ))}
                 </ul>
                 <Link 
                   href="https://wa.me/5519987510267"
                   className="inline-flex items-center text-red-500 font-bold hover:text-red-400 transition-colors gap-2 group-hover:translate-x-2 duration-300"
                 >
                   Solicitar Orçamento <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
            ))}
          </div>

          {/* More Services List */}
          <div className="mt-20 pt-20 border-t border-zinc-800">
             <h3 className="text-2xl font-bold text-center text-zinc-500 mb-12 uppercase tracking-widest">Outros Serviços Disponíveis</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {maisDe50Servicos.map((servico, idx) => (
                  <Link 
                    href="https://wa.me/5519987510267"
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all group"
                  >
                    <Wrench className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                      {servico}
                    </span>
                  </Link>
                ))}
             </div>
          </div>

          <div className="mt-24 text-center">
            <div className="inline-block p-10 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl shadow-2xl relative overflow-hidden max-w-4xl mx-auto">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl -ml-32 -mb-32" />
              
              <div className="relative z-10">
                <h3 className="text-3xl font-black text-white mb-6">Precisa de algo específico?</h3>
                <p className="text-red-100 mb-8 max-w-xl mx-auto text-lg">
                  Nossa equipe está pronta para atender sua demanda personalizada. Entre em contato agora mesmo.
                </p>
                <Link 
                  href="https://wa.me/5519987510267"
                  className="inline-flex items-center justify-center gap-3 bg-white text-red-600 hover:bg-zinc-100 text-xl font-bold py-4 px-10 rounded-xl shadow-lg transition-all hover:scale-105"
                >
                  <MessageCircle className="w-6 h-6" />
                  Chamar no WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
