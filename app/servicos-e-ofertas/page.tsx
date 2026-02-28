import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProducts } from '@/lib/db'
import OfferCountdown from '@/components/OfferCountdown'
import ProductCarousel from '@/components/ProductCarousel'
import { ALL_SERVICES, SERVICE_CATEGORIES } from './data'
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
  Zap
} from 'lucide-react'
import { Product } from '@/lib/utils'

// 1. Otimização de SEO Nacional de Alto Nível
export const metadata: Metadata = {
  title: 'Assistência Técnica Especializada e Ofertas | Balão da Informática',
  description: 'Serviços completos de manutenção de computadores, notebooks e servidores. Confira nossas ofertas exclusivas em hardware e periféricos.',
  keywords: [
    'reparo técnico',
    'conserto de notebook',
    'assistência técnica',
    'formatação',
    'limpeza de pc',
    'upgrade de hardware',
    'montagem pc gamer',
    'serviços de ti',
    'ofertas de informática',
    'promoção hardware'
  ],
  alternates: {
    canonical: 'https://www.balao.info/servicos-e-ofertas',
  },
  openGraph: {
    title: 'Serviços e Ofertas Especiais | Balão da Informática',
    description: 'Soluções profissionais para seu equipamento e as melhores ofertas do mercado.',
    url: 'https://www.balao.info/servicos-e-ofertas',
    type: 'website',
    locale: 'pt_BR',
    images: ['/images/og-servicos.jpg']
  }
}

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const allProducts = await getProducts()
  
  // Helper para parsear preço
  const parsePrice = (p: string) => {
    if (!p) return 0
    const clean = p.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(clean) || 0
  }

  // Ordenar por preço crescente
  const cheapestProducts = [...allProducts].sort((a, b) => parsePrice(a.price) - parsePrice(b.price))

  // Função para pegar produtos aleatórios (para variar os carrosséis)
  const getRandomProducts = (count: number) => {
    // Clone array to avoid mutating original
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // Função para pegar os mais baratos
  const getCheapestProducts = (count: number) => {
    return cheapestProducts.slice(0, count)
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-900 selection:text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Soluções Técnicas <span className="text-red-600">&</span> <br/>
              Ofertas Exclusivas
            </h1>
            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Combinamos expertise técnica avançada com as melhores oportunidades em hardware.
              Do reparo especializado ao upgrade do seu setup.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="#software" 
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition-all flex items-center gap-2"
              >
                <Wrench className="w-5 h-5" />
                Ver Serviços
              </Link>
              <Link 
                href="#ofertas" 
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold transition-all flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                Ver Ofertas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
         
        {/* Loop por Categorias de Serviço */}
        {SERVICE_CATEGORIES.map((category, catIdx) => {
          const categoryServices = ALL_SERVICES.filter(s => s.categoryId === category.id)
          // Intercalar carrosséis: alternar entre mais baratos e aleatórios
          const carouselProducts = catIdx % 2 === 0 ? getCheapestProducts(8) : getRandomProducts(8)
          const carouselTitle = catIdx % 2 === 0 ? "Ofertas Imperdíveis" : "Destaques da Loja"

          return (
            <div key={category.id} id={category.id} className="mb-24 scroll-mt-24">
              {/* Cabeçalho da Categoria */}
              <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center text-red-500">
                  <category.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{category.title}</h2>
                  <p className="text-zinc-400 text-sm md:text-base">{category.description}</p>
                </div>
              </div>

              {/* Lista de Serviços (Accordion) */}
              <div className="grid grid-cols-1 gap-4 mb-12">
                {categoryServices.map((service, idx) => (
                  <div key={idx} className="group bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-900/50 transition-all duration-300">
                    <details className="w-full group/details">
                      <summary className="flex items-start p-6 cursor-pointer list-none relative select-none">
                          {/* Ícone e Título */}
                          <div className="flex gap-4 flex-1 pr-12">
                              <div className="mt-1 w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-red-500 transition-colors shrink-0">
                                  <service.icon className="w-5 h-5" />
                              </div>
                              <div>
                                  <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-2">
                                      {service.title}
                                  </h3>
                                  <p className="text-zinc-400 mt-1 text-sm md:text-base">
                                      {service.shortDescription}
                                  </p>
                              </div>
                          </div>
                          <div className="absolute right-6 top-6 text-zinc-500 transition-transform duration-300 group-open/details:rotate-180">
                              <ChevronDown className="w-5 h-5" />
                          </div>
                      </summary>
                      
                      {/* Conteúdo Detalhado (Expandido) */}
                      <div className="px-6 pb-8 pt-2 border-t border-zinc-800/50 bg-zinc-900/20 animate-in slide-in-from-top-2 duration-200">
                          <div className="grid md:grid-cols-2 gap-8">
                              <div>
                                  <h4 className="text-red-500 font-semibold mb-3 flex items-center gap-2">
                                      <Search className="w-4 h-4" /> Sintomas Comuns
                                  </h4>
                                  <ul className="space-y-2 mb-6">
                                      {service.symptoms?.map((s, i) => (
                                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                                              <span className="w-1.5 h-1.5 bg-red-900 rounded-full mt-1.5 shrink-0" />
                                              {s}
                                          </li>
                                      ))}
                                  </ul>

                                  <h4 className="text-red-500 font-semibold mb-3 flex items-center gap-2">
                                      <Wrench className="w-4 h-4" /> O que é feito
                                  </h4>
                                  <ul className="space-y-2">
                                      {service.process?.map((p, i) => (
                                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                                              <CheckCircle className="w-4 h-4 text-green-900 mt-0.5 shrink-0" />
                                              {p}
                                          </li>
                                      ))}
                                  </ul>
                              </div>

                              <div className="flex flex-col h-full">
                                  <div className="bg-black/40 rounded-xl p-6 border border-zinc-800 mb-6 flex-1">
                                      <p className="text-zinc-400 text-sm mb-4 italic">
                                          "{service.longDescription}"
                                      </p>
                                      <div className="flex flex-wrap gap-4 text-sm mt-auto">
                                          <div className="flex items-center gap-2 text-zinc-300">
                                              <Award className="w-4 h-4 text-yellow-600" />
                                              <span>Garantia: <span className="text-white font-medium">{service.warranty}</span></span>
                                          </div>
                                          <div className="flex items-center gap-2 text-zinc-300">
                                              <Truck className="w-4 h-4 text-blue-600" />
                                              <span>Prazo: <span className="text-white font-medium">{service.time}</span></span>
                                          </div>
                                      </div>
                                  </div>

                                  <Link 
                                      href={`https://wa.me/5519993916723?text=Olá, gostaria de um orçamento para: ${service.title}`}
                                      target="_blank"
                                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-bold text-center transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                  >
                                      <MessageCircle className="w-5 h-5" />
                                      Solicitar Orçamento via WhatsApp
                                  </Link>
                              </div>
                          </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>

              {/* Carrossel Intercalado */}
              <div className="py-8 border-t border-b border-zinc-800 bg-zinc-900/20 -mx-4 px-4 md:px-0">
                  <div className="container mx-auto">
                      <ProductCarousel 
                          title={carouselTitle}
                          products={carouselProducts}
                          isDark={true}
                      />
                  </div>
              </div>

            </div>
          )
        })}

        {/* Seção Final de Ofertas */}
        <div id="ofertas" className="mb-12">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-3xl font-bold">Ofertas Especiais</h2>
             <Link href="/produtos" className="text-red-500 hover:text-red-400 text-sm font-bold">
               Ver todos os produtos →
             </Link>
          </div>
          <ProductCarousel 
             title="Super Saldão" 
             products={getCheapestProducts(12)}
             isDark={true}
          />
        </div>

      </div>
    </div>
  )
}
