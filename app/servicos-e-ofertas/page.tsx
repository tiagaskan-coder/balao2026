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
  Award 
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

const maisDe50Servicos = [
  'Formatação com backup completo',
  'Limpeza interna detalhada',
  'Troca de pasta térmica (Prata/Gold)',
  'Instalação do Windows 11/10',
  'Remoção de vírus e malware',
  'Otimização de sistema lento',
  'Montagem de PC Gamer sob medida',
  'Cable Management (Organização de cabos)',
  'Testes de estabilidade (Stress Test)',
  'Troca de HD por SSD (Clonagem)',
  'Instalação de SSD NVMe',
  'Instalação de Heatsink em NVMe',
  'Expansão de Memória RAM',
  'Configuração de Dual Channel',
  'Instalação de Pacote Office',
  'Configuração de Outlook/E-mail',
  'Upgrade de Placa de Vídeo',
  'Troca de Fonte de Alimentação',
  'Troca de Bateria de Notebook',
  'Troca de Tela de Notebook',
  'Troca de Teclado de Notebook',
  'Reparo de Carcaça e Dobradiças',
  'Troca de Conector de Carga (DC-Jack)',
  'Reballing de BGA (Análise)',
  'Reparo de Placa Mãe (Análise)',
  'Solda de Componentes SMD',
  'Atualização de BIOS',
  'Correção de BIOS Corrompida',
  'Configuração de RAID 0/1/5',
  'Instalação de Rede Local',
  'Configuração de Roteadores Wi-Fi',
  'Instalação de Repetidores de Sinal',
  'Cabeamento Estruturado',
  'Crimpagem de Cabos de Rede',
  'Configuração de Firewall Básico',
  'Configuração de VPN',
  'Compartilhamento de Impressoras',
  'Instalação de Impressoras Wi-Fi',
  'Manutenção Preventiva de Impressoras',
  'Configuração de Backup em Nuvem',
  'OneDrive / Google Drive / Dropbox',
  'Recuperação de Dados (Soft/Hard)',
  'Criação de Pendrive Bootável',
  'Diagnóstico de Hardware Defeituoso',
  'Ajuste de Curva de Ventoinha',
  'Undervolt de Processador/GPU',
  'Overclock Seguro (Consultoria)',
  'Calibração de Cores de Monitor',
  'Suporte Remoto (AnyDesk/TeamViewer)',
  'Inventário de Hardware/Software',
  'Higienização Externa de Equipamentos',
  'Consultoria para Upgrades',
  'Laudo Técnico para Seguradoras'
]

const FEATURED_PRODUCT_IDS = [
  'd2da0079-5b31-42b2-80bd-f2035ebefd04', // iPhone 17 Pro Max
  '32cb7fe9-d6fe-4a09-9e18-580d267d36ad', // Apple Watch SE 3
  '0ebb9fd9-f161-41a7-bb14-c545b1164ca2'  // Monitor Dell 27
]

export const dynamic = 'force-dynamic'

export default async function Page() {
  const products = await Promise.all(
    FEATURED_PRODUCT_IDS.map(id => getProductById(id))
  )

  const validProducts = products.filter(p => p !== null)

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-red-100 selection:text-red-900">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-zinc-50 to-white pt-20 pb-16 overflow-hidden border-b border-red-100">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold uppercase tracking-widest mb-6">
            <Award className="w-4 h-4" />
            Excelência em Campinas
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 mb-6">
            SERVIÇOS <span className="text-red-600">PREMIUM</span><br/>
            & OFERTAS <span className="text-red-600">INSANAS</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-600 max-w-3xl mx-auto font-light leading-relaxed mb-10">
            A referência em tecnologia de Campinas. Assistência técnica especializada e os produtos mais desejados com preços que você só encontra aqui.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="https://wa.me/5519987510267" 
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-4 px-8 rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105"
            >
              <MessageCircle className="w-6 h-6" />
              Falar com Especialista
            </Link>
            <Link 
              href="#ofertas" 
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-zinc-200 hover:border-red-600 text-zinc-900 hover:text-red-600 text-lg font-bold py-4 px-8 rounded-xl transition-all"
            >
              <Zap className="w-6 h-6" />
              Ver Ofertas Relâmpago
            </Link>
          </div>
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-200/20 rounded-full blur-[100px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-red-300/20 rounded-full blur-[100px]" />
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="ofertas" className="py-12 bg-white">
        <div className="container mx-auto px-4 mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-1 flex-1 bg-red-100 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-black text-red-600 uppercase tracking-tight text-center">
              Ofertas por Tempo Limitado
            </h2>
            <div className="h-1 flex-1 bg-red-100 rounded-full" />
          </div>
          <p className="text-center text-zinc-500 font-medium">Produtos selecionados com preços exclusivos para o site.</p>
        </div>

        <div className="space-y-12 container mx-auto px-4">
          {validProducts.map((product, index) => (
            <div 
              key={product?.id || index} 
              className="group relative bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-red-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image Section */}
                <div className="relative h-[400px] lg:h-[500px] bg-zinc-50 flex items-center justify-center p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-zinc-100 to-zinc-200 opacity-50" />
                  {product?.image ? (
                    <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-105">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-zinc-100 text-zinc-300">
                      <span className="text-xl font-bold">Imagem Indisponível</span>
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-6 left-6 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg z-10 animate-bounce">
                    OFERTA EXCLUSIVA
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 lg:p-12 flex flex-col justify-center relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[100px] -z-10 transition-all group-hover:scale-110 origin-top-right" />
                  
                  <div className="mb-6">
                    <OfferCountdown />
                  </div>

                  <h3 className="text-3xl lg:text-5xl font-black text-zinc-900 mb-4 leading-tight group-hover:text-red-600 transition-colors">
                    {product?.name}
                  </h3>

                  <div className="flex flex-col gap-1 mb-8">
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm text-zinc-400 line-through font-medium">
                        de {product ? `R$ ${(parseFloat(product.price) * 1.4).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '---'}
                      </span>
                      <span className="text-5xl lg:text-6xl font-black text-red-600 tracking-tighter">
                        {product ? `R$ ${parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ---'}
                      </span>
                    </div>
                    <span className="text-zinc-500 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" /> 
                      À vista no PIX com 10% de desconto extra
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                      <Truck className="w-6 h-6 text-red-600 mb-2" />
                      <p className="font-bold text-zinc-800">Entrega Rápida</p>
                      <p className="text-xs text-zinc-500">Para Campinas e região</p>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                      <ShieldCheck className="w-6 h-6 text-red-600 mb-2" />
                      <p className="font-bold text-zinc-800">Garantia Total</p>
                      <p className="text-xs text-zinc-500">Direto com a loja</p>
                    </div>
                  </div>

                  <Link 
                    href={`/product/${product?.id}`}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold py-5 px-8 rounded-xl shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all text-center flex items-center justify-center gap-3 group/btn"
                  >
                    COMPRAR AGORA
                    <Zap className="w-6 h-6 group-hover/btn:fill-current" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services List Section */}
      <section className="py-20 bg-zinc-50 border-t border-zinc-200">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mb-6">
              SOLUÇÕES EM <span className="text-red-600">TECNOLOGIA</span>
            </h2>
            <p className="text-xl text-zinc-600">
              Nossa equipe técnica é certificada e preparada para resolver qualquer problema. 
              Confira nossa lista completa de serviços disponíveis para você e sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {maisDe50Servicos.map((servico, idx) => (
              <Link 
                href="https://wa.me/5519987510267"
                key={idx}
                className="bg-white p-4 rounded-xl border border-zinc-200 hover:border-red-500 hover:shadow-lg transition-all group flex items-start gap-3"
              >
                <div className="bg-red-50 text-red-600 p-2 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-zinc-700 group-hover:text-zinc-900 leading-snug">
                  {servico}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-block p-8 bg-white rounded-3xl border border-red-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700" />
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">Não encontrou o que precisa?</h3>
              <p className="text-zinc-600 mb-6 max-w-lg mx-auto">
                Realizamos diversos outros serviços personalizados. Entre em contato com nossos consultores e faça um orçamento sem compromisso.
              </p>
              <Link 
                href="https://wa.me/5519987510267"
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-600/20 transition-all hover:scale-105"
              >
                <MessageCircle className="w-6 h-6" />
                Chamar no WhatsApp (19) 98751-0267
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
