import { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/db'
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

// 1. Otimização de SEO Nacional e Local (Campinas)
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

export default async function ServicesPage() {
  const allProducts = await getProducts()
  
  // Helper para parsear preço
  const parsePrice = (p: string) => {
    if (!p) return 0
    const clean = p.replace(/[^\d,]/g, '').replace(',', '.')
    return parseFloat(clean) || 0
  }

  // Set para rastrear produtos já exibidos e evitar repetição
  const usedProductIds = new Set<string>()

  // Função para obter produtos únicos e relevantes
  const getUniqueRelevantProducts = (categoryId: string, count: number) => {
    const keywords = categoryKeywords[categoryId] || []
    
    // 1. Filtrar por relevância (keywords no nome ou descrição)
    // 2. Excluir produtos já usados
    const relevant = allProducts.filter(p => {
      if (usedProductIds.has(p.id)) return false
      const text = (p.name + " " + (p.description || "")).toLowerCase()
      return keywords.some(k => text.includes(k))
    }).sort((a, b) => parsePrice(a.price) - parsePrice(b.price)) // Priorizar mais baratos

    // 3. Preencher se não houver suficientes
    let result = relevant.slice(0, count)
    
    if (result.length < count) {
      const remaining = allProducts
        .filter(p => !usedProductIds.has(p.id) && !result.find(r => r.id === p.id))
        .sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
      
      result = [...result, ...remaining.slice(0, count - result.length)]
    }

    // 4. Marcar como usados
    result.forEach(p => usedProductIds.add(p.id))
    
    return result
  }

  // Função para pegar os mais baratos (para a seção final, sem repetir os anteriores)
  const getCheapestProducts = (count: number) => {
    const available = allProducts
      .filter(p => !usedProductIds.has(p.id))
      .sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    
    const result = available.slice(0, count)
    result.forEach(p => usedProductIds.add(p.id))
    return result
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-red-100 selection:text-red-900">
      {/* Hero Section - Tema Claro com Banner Impactante */}
      <div className="relative overflow-hidden border-b border-zinc-200 bg-zinc-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-100 via-white to-white opacity-70" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 font-bold text-sm mb-6 border border-red-200">
              <MapPin className="w-4 h-4" />
              Atendimento Expresso em Campinas e Região
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-zinc-900 leading-tight">
              Assistência Técnica <br/>
              <span className="text-red-600">Especializada & Nacional</span>
            </h1>
            <p className="text-2xl text-zinc-600 mb-10 leading-relaxed max-w-2xl font-light">
              Do reparo de precisão ao upgrade extremo. <br/>
              <span className="font-semibold text-zinc-800">Envie seu equipamento de qualquer lugar do Brasil</span> ou visite nossa unidade em Campinas.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="#software" 
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg transition-all flex items-center gap-2 shadow-xl shadow-red-600/20 hover:scale-105 transform"
              >
                <Wrench className="w-6 h-6" />
                Ver Serviços
              </Link>
              <Link 
                href="#ofertas" 
                className="px-8 py-4 bg-white border-2 border-zinc-200 hover:border-red-600 hover:text-red-600 text-zinc-700 rounded-full font-bold text-lg transition-all flex items-center gap-2"
              >
                <Star className="w-6 h-6" />
                Ver Ofertas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
         
        {/* Loop por Categorias de Serviço */}
        {SERVICE_CATEGORIES.map((category, catIdx) => {
          const categoryServices = ALL_SERVICES.filter(s => s.categoryId === category.id)
          
          // Buscar produtos relevantes e únicos para esta categoria
          const carouselProducts = getUniqueRelevantProducts(category.id, 8)
          const carouselTitle = `Ofertas de ${category.title.split(' ')[0]}`

          return (
            <div key={category.id} id={category.id} className="mb-32 scroll-mt-32">
              {/* Cabeçalho da Categoria */}
              <div className="flex items-center gap-6 mb-10 border-b-2 border-zinc-100 pb-6">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                  <category.icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-2">{category.title}</h2>
                  <p className="text-zinc-500 text-lg">{category.description}</p>
                </div>
              </div>

              {/* Lista de Serviços (Accordion Style Light) */}
              <div className="grid grid-cols-1 gap-6 mb-16">
                {categoryServices.map((service, idx) => (
                  <div key={idx} className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-red-300 hover:shadow-lg hover:shadow-red-900/5 transition-all duration-300">
                    <details className="w-full group/details">
                      <summary className="flex items-start p-8 cursor-pointer list-none relative select-none">
                          {/* Ícone e Título */}
                          <div className="flex gap-6 flex-1 pr-12 items-center">
                              <div className="w-14 h-14 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-red-600 group-hover:bg-red-50 transition-all shrink-0 border border-zinc-100">
                                  <service.icon className="w-7 h-7" />
                              </div>
                              <div>
                                  <h3 className="text-2xl font-bold text-zinc-800 group-hover:text-red-600 transition-colors flex items-center gap-2">
                                      {service.title}
                                  </h3>
                                  <p className="text-zinc-500 mt-2 text-lg">
                                      {service.shortDescription}
                                  </p>
                              </div>
                          </div>
                          <div className="absolute right-8 top-10 text-zinc-400 transition-transform duration-300 group-open/details:rotate-180">
                              <ChevronDown className="w-6 h-6" />
                          </div>
                      </summary>
                      
                      {/* Conteúdo Detalhado (Expandido) */}
                      <div className="px-8 pb-10 pt-2 border-t border-zinc-100 bg-zinc-50/50 animate-in slide-in-from-top-2 duration-200">
                          <div className="grid md:grid-cols-2 gap-12">
                              <div>
                                  <h4 className="text-red-600 font-bold mb-4 flex items-center gap-2 text-lg">
                                      <Search className="w-5 h-5" /> Sintomas Comuns
                                  </h4>
                                  <ul className="space-y-3 mb-8">
                                      {service.symptoms?.map((s, i) => (
                                          <li key={i} className="text-zinc-600 flex items-start gap-3 text-base">
                                              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                                              {s}
                                          </li>
                                      ))}
                                  </ul>

                                  <h4 className="text-red-600 font-bold mb-4 flex items-center gap-2 text-lg">
                                      <Wrench className="w-5 h-5" /> O que é feito
                                  </h4>
                                  <ul className="space-y-3">
                                      {service.process?.map((p, i) => (
                                          <li key={i} className="text-zinc-600 flex items-start gap-3 text-base">
                                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                              {p}
                                          </li>
                                      ))}
                                  </ul>
                              </div>

                              <div className="flex flex-col h-full">
                                  <div className="bg-white rounded-2xl p-8 border border-zinc-200 mb-6 flex-1 shadow-sm">
                                      <p className="text-zinc-600 text-lg mb-6 italic leading-relaxed">
                                          "{service.longDescription}"
                                      </p>
                                      <div className="flex flex-wrap gap-6 text-base mt-auto pt-6 border-t border-zinc-100">
                                          <div className="flex items-center gap-2 text-zinc-600">
                                              <Award className="w-5 h-5 text-yellow-500" />
                                              <span>Garantia: <span className="text-zinc-900 font-bold">{service.warranty}</span></span>
                                          </div>
                                          <div className="flex items-center gap-2 text-zinc-600">
                                              <Truck className="w-5 h-5 text-blue-600" />
                                              <span>Prazo: <span className="text-zinc-900 font-bold">{service.time}</span></span>
                                          </div>
                                      </div>
                                  </div>

                                  <Link 
                                      href={`https://wa.me/5519993916723?text=Olá, gostaria de um orçamento para: ${service.title}`}
                                      target="_blank"
                                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold text-center text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 hover:shadow-xl hover:scale-[1.02]"
                                  >
                                      <MessageCircle className="w-6 h-6" />
                                      Solicitar Orçamento via WhatsApp
                                  </Link>
                              </div>
                          </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>

              {/* Carrossel Relacionado e Único */}
              {carouselProducts.length > 0 && (
                <div className="py-12 border-t border-b border-zinc-100 bg-zinc-50 -mx-4 px-4 md:px-0">
                    <div className="container mx-auto">
                        <ProductCarousel 
                            title={carouselTitle}
                            products={carouselProducts}
                            // Light mode default
                        />
                    </div>
                </div>
              )}

            </div>
          )
        })}

        {/* Seção Final de Ofertas */}
        <div id="ofertas" className="mb-24">
          <div className="flex items-center justify-between mb-10">
             <h2 className="text-4xl font-extrabold text-zinc-900">Últimas Unidades</h2>
             <Link href="/produtos" className="text-red-600 hover:text-red-700 text-lg font-bold flex items-center gap-1">
               Ver loja completa <ChevronDown className="w-5 h-5 -rotate-90" />
             </Link>
          </div>
          <ProductCarousel 
             title="Super Saldão" 
             products={getCheapestProducts(12)} 
          />
        </div>

      </div>
    </div>
  )
}
