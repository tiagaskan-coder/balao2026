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
  ArrowRight,
  Droplets,
  Tablet,
  Recycle,
  Clock,
  MapPin,
  ChevronDown,
  Star
} from 'lucide-react'

// 1. Otimização de SEO Nacional de Alto Nível
export const metadata: Metadata = {
  title: 'Assistência Técnica de Notebook e PC Gamer | Reparo Nacional - Balão da Informática',
  description: 'Líder em reparo técnico de notebooks, MacBooks e PC Gamer no Brasil. Orçamento gratuito, frete grátis para todo país e garantia de até 1 ano. Especialistas em BGA, placa de vídeo e recuperação de dados.',
  keywords: [
    'reparo técnico Brasil',
    'conserto de notebook nacional',
    'assistência técnica apple brasil',
    'reparo de placa de vídeo',
    'recuperação de dados hd',
    'montagem de pc gamer profissional',
    'troca de tela notebook',
    'reparo macbook pro',
    'bga notebook',
    'balão da informática serviços'
  ],
  alternates: {
    canonical: 'https://www.balao.info/servicos-e-ofertas',
    languages: {
      'pt-BR': 'https://www.balao.info/servicos-e-ofertas',
    },
  },
  openGraph: {
    title: 'Assistência Técnica Premium em Todo Brasil | Balão da Informática',
    description: 'Soluções avançadas em hardware e software. Envie seu equipamento de qualquer lugar do Brasil com segurança total.',
    url: 'https://www.balao.info/servicos-e-ofertas',
    type: 'website',
    locale: 'pt_BR',
    images: ['/images/og-servicos.jpg']
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 }
}

// 3. Especialização Técnica por Serviço (Dados Expandidos)
const FEATURED_SERVICES = [
  {
    title: "Manutenção Avançada de Notebooks",
    shortDescription: "Reparo de placa-mãe, BGA e telas para todas as marcas.",
    icon: Smartphone,
    details: ["Reballing de BGA", "Reparo de circuito de carga", "Troca de DC-Jack", "Limpeza química"],
    longDescription: "Nosso laboratório conta com equipamentos de ponta para diagnóstico e reparo de notebooks de todas as marcas (Dell, HP, Lenovo, Acer, Asus, Apple). Realizamos procedimentos complexos como reballing de chipset BGA, reparo em circuitos de alimentação (VCORE, Charger) e troca de componentes SMD. Utilizamos esquemas elétricos originais e boardviews para garantir a precisão de cada intervenção.",
    symptoms: ["Notebook não liga ou não dá vídeo", "Tela azul constante ou travamentos", "Superaquecimento e desligamento repentino", "Bateria não carrega", "Dobradiças quebradas"],
    process: ["Triagem e diagnóstico inicial (24h)", "Orçamento detalhado com laudo técnico", "Aprovação e execução do reparo em laboratório ESD", "Testes de stress (Burn-in) por 12h", "Limpeza final e expedição"],
    time: "3 a 5 dias úteis (Express: 24h)",
    warranty: "90 dias a 1 ano (dependendo do serviço)",
    image: "/images/services/notebook-repair.jpg" 
  },
  {
    title: "Montagem e Otimização de PC Gamer",
    shortDescription: "Montagem profissional, cable management e overclock seguro.",
    icon: Cpu,
    details: ["Consultoria de peças", "Overclock seguro", "Instalação de Water Cooler", "Personalização RGB"],
    longDescription: "Transforme seu setup com nossa montagem profissional. Não apenas encaixamos peças; otimizamos o fluxo de ar (airflow), realizamos um cable management artístico e configuramos a BIOS para extrair o máximo de performance do seu hardware. Especialistas em refrigeração líquida custom (Custom Loop) e sincronização de RGB.",
    symptoms: ["Baixo FPS em jogos", "PC travando em renderizações", "Ruído excessivo das ventoinhas", "Dúvidas de compatibilidade de peças"],
    process: ["Consultoria de hardware ideal", "Montagem física com luvas antiestáticas", "Organização de cabos (Cable Management)", "Atualização de BIOS e Drivers", "Testes de estabilidade (AIDA64/Furmark)"],
    time: "2 a 3 dias úteis",
    warranty: "1 ano na montagem + garantia das peças",
    image: "/images/services/pc-gamer.jpg"
  },
  {
    title: "Upgrades de Performance (SSD e RAM)",
    shortDescription: "Acelere seu computador em até 10x sem perder dados.",
    icon: HardDrive,
    details: ["Clonagem de HD para SSD", "Dual Channel", "Instalação de Heatsinks", "Backup de dados"],
    longDescription: "A lentidão não significa que você precisa de um computador novo. Nossos upgrades de SSD NVMe e Memória RAM de alta frequência revitalizam máquinas antigas. Realizamos a clonagem completa do seu sistema operacional e arquivos, garantindo que você volte a trabalhar exatamente de onde parou, só que muito mais rápido.",
    symptoms: ["Windows demora para iniciar", "Programas demoram para abrir", "Navegador travando com muitas abas", "Falta de espaço em disco"],
    process: ["Análise de compatibilidade", "Backup preventivo dos dados", "Instalação física dos componentes", "Clonagem ou Instalação limpa do OS", "Otimização de sistema"],
    time: "1 dia útil (Serviço Express disponível)",
    warranty: "3 anos (SSD/RAM) e 3 meses (Mão de obra)",
    image: "/images/services/upgrade.jpg"
  },
  {
    title: "Redes e Infraestrutura Wi-Fi",
    shortDescription: "Wi-Fi estável e veloz em todos os cômodos da sua casa ou empresa.",
    icon: Wifi,
    details: ["Cabeamento estruturado", "Configuração de Mesh", "Servidores de Arquivos", "VPN"],
    longDescription: "Chega de zonas mortas de Wi-Fi. Projetamos e executamos redes cabeadas (Cat6/Cat7) e sem fio (Wi-Fi 6 Mesh) para garantir cobertura total e estabilidade para streaming 4K, jogos online e videoconferências. Configuração avançada de roteadores Mikrotik, Ubiquiti e TP-Link Enterprise.",
    symptoms: ["Wi-Fi cai constantemente", "Sinal fraco em cômodos distantes", "Lentidão mesmo com internet rápida", "Jogos com lag/ping alto"],
    process: ["Site survey (análise do ambiente)", "Projeto de rede personalizado", "Passagem de cabos e instalação de APs", "Configuração de segurança e canais", "Teste de velocidade em todos os pontos"],
    time: "1 a 3 dias (dependendo do projeto)",
    warranty: "1 ano na instalação",
    image: "/images/services/network.jpg"
  },
  {
    title: "Recuperação de Dados e Backup",
    shortDescription: "Recuperamos seus arquivos de HDs, SSDs e Pendrives danificados.",
    icon: Database,
    details: ["Recuperação de HD/SSD", "Backup em Nuvem", "Restauração de Sistema", "Proteção de Dados"],
    longDescription: "Perdeu fotos, documentos ou projetos importantes? Não se desespere. Possuímos tecnologia forense para recuperação de dados em dispositivos com falha lógica (formatação acidental, vírus) ou física (agulha travada, placa queimada). Mantemos sigilo absoluto dos seus dados com contrato de confidencialidade (NDA).",
    symptoms: ["HD fazendo barulho (tec-tec)", "Computador não reconhece o disco", "Arquivos sumiram ou estão corrompidos", "HD pediu para formatar"],
    process: ["Diagnóstico gratuito em 24h", "Envio de listagem de arquivos recuperáveis", "Aprovação do cliente", "Cópia dos dados para novo dispositivo", "Descarte seguro da mídia danificada"],
    time: "2 a 10 dias úteis (complexidade variável)",
    warranty: "Garantia de integridade dos dados recuperados",
    image: "/images/services/data-recovery.jpg"
  },
  {
    title: "Limpeza e Manutenção Preventiva",
    shortDescription: "Aumente a vida útil do seu equipamento e reduza o aquecimento.",
    icon: Wrench,
    details: ["Pasta térmica Silver/Gold", "Limpeza de contatos", "Desoxidação", "Lubrificação de fans"],
    longDescription: "O calor é o maior inimigo da eletrônica. Nossa limpeza detalhada remove toda a poeira interna, troca a pasta térmica ressecada por compostos de alta condutividade térmica (Arctic Silver/Thermal Grizzly) e lubrifica as ventoinhas. Isso previne queimas, reduz o ruído e mantém o desempenho máximo do processador e placa de vídeo.",
    symptoms: ["Computador esquentando muito", "Barulho alto de ventoinha", "Desligamento em jogos pesados", "Acúmulo visível de poeira"],
    process: ["Desmontagem completa", "Limpeza com pincel ESD e ar comprimido", "Troca de pasta térmica e thermal pads", "Limpeza de contatos com álcool isopropílico", "Polimento externo"],
    time: "1 dia útil",
    warranty: "3 meses",
    image: "/images/services/cleaning.jpg"
  },
  {
    title: "Reparo de Placa de iPhone",
    shortDescription: "Especialistas em microeletrônica Apple. Recuperamos o irrecuperável.",
    icon: Smartphone,
    details: ["Erro de Baseband", "Curto na placa", "Falha de áudio (Codec)", "Problemas de carga (Tristar)"],
    longDescription: "Muitas assistências condenam placas de iPhone que nós consertamos diariamente. Somos especialistas em micro soldagem de circuitos integrados Apple. Resolvemos falhas de Touch (Touch IC), Áudio (Audio Codec), Carga (Tristar/Hydra), Sem Sinal (Baseband) e Backlight. Economize até 70% em relação à troca do aparelho.",
    symptoms: ["iPhone não liga", "Sem serviço/buscando rede", "Touch parou de funcionar", "Bateria drena rápido mesmo nova", "Erro 4013/4014 no iTunes"],
    process: ["Análise de consumo de corrente", "Diagnóstico com multímetro e osciloscópio", "Substituição do CI defeituoso", "Reconstrução de trilhas (Jumpers)", "Testes funcionais completos"],
    time: "2 a 4 dias úteis",
    warranty: "6 meses",
    image: "/images/services/iphone-repair.jpg"
  },
  {
    title: "Desoxidação (Banho Químico)",
    shortDescription: "Salvamento de aparelhos que caíram na água ou líquidos.",
    icon: Droplets,
    details: ["Banho Ultrassônico", "Tratamento anticorrosivo", "Secagem em estufa", "Análise microscópica"],
    longDescription: "Acidentes com líquidos requerem ação rápida. Nosso processo de desoxidação utiliza cubas ultrassônicas industriais e solventes químicos específicos para remover a corrosão sob os componentes BGA, onde a escova não alcança. Após o banho, a placa passa por estufa controlada para evaporação total da umidade.",
    symptoms: ["Caiu na água/piscina/mar", "Derramou café/refrigerante", "Tela manchada", "Câmeras embaçadas"],
    process: ["Desmontagem imediata", "Lavagem ultrassônica (vários ciclos)", "Secagem em estufa", "Ressolda de pontos corroídos", "Teste de componentes periféricos"],
    time: "2 a 3 dias úteis",
    warranty: "30 dias (devido à natureza do dano)",
    image: "/images/services/water-damage.jpg"
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
  '6724ba18-4794-4a4d-885f-93470a18233a', // PC Gamer
  '2e72e933-1bae-4441-8281-5c550938515e', // Monitor Brazil PC
  '72b06dac-7097-4b86-914e-65e03f7a0a74', // Jogo Bloodborne
  '35b8c8c9-43cb-4132-822f-9f997695889c'  // Base Notebook
]

export const dynamic = 'force-dynamic'

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0
  const clean = priceStr.replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

function formatPrice(val: number): string {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// 1. Schema.org Structure Data
function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ComputerRepair",
        "name": "Balão da Informática - Assistência Técnica Nacional",
        "image": "https://www.balao.info/logo.png",
        "url": "https://www.balao.info/servicos-e-ofertas",
        "telephone": "+5519987510267",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Rua Exemplo, 123",
          "addressLocality": "Campinas",
          "addressRegion": "SP",
          "postalCode": "13000-000",
          "addressCountry": "BR"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -22.9099,
          "longitude": -47.0626
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "opens": "09:00",
          "closes": "18:00"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Brasil"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": FEATURED_SERVICES.map(service => ({
          "@type": "Question",
          "name": `Como funciona o ${service.title}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `${service.longDescription} O tempo estimado é de ${service.time}.`
          }
        }))
      }
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function Page() {
  const products = await Promise.all(
    FEATURED_PRODUCT_IDS.map(id => getProductById(id))
  )

  const validProducts = products.filter(p => p !== null)

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 font-sans selection:bg-red-900 selection:text-white">
      <JsonLd />
      
      {/* 4. Breadcrumb SEO-Friendly */}
      <nav aria-label="Breadcrumb" className="bg-zinc-800 py-2 px-4 text-xs text-zinc-400 fixed top-[60px] w-full z-40 border-b border-zinc-700 hidden md:block">
        <div className="container mx-auto">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-red-500 transition-colors">Home</Link></li>
            <li>/</li>
            <li><span className="text-zinc-200 font-medium" aria-current="page">Serviços e Ofertas</span></li>
          </ol>
        </div>
      </nav>

      {/* Header with Logo */}
      <header className="bg-white/95 backdrop-blur-sm fixed top-0 w-full z-50 border-b border-red-600 shadow-lg h-[60px]">
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          <Link href="https://www.balao.info" className="hover:opacity-80 transition-opacity">
             <Image 
               src="/logo.png" 
               alt="Balão da Informática - Assistência Técnica Especializada" 
               width={150} 
               height={50} 
               className="h-10 w-auto object-contain"
               priority
             />
          </Link>
          <Link 
            href="https://wa.me/5519987510267"
            className="hidden sm:flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full font-bold text-sm hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
          >
            <MessageCircle className="w-4 h-4" />
            (19) 98751-0267
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black opacity-80" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-900/30 border border-red-500/30 text-red-400 text-sm font-bold uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Award className="w-4 h-4" />
            Atendimento Nacional
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white mb-8 leading-tight">
            ASSISTÊNCIA TÉCNICA <span className="text-red-600">PREMIUM</span><br/>
            PARA TODO O <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-yellow-500 to-blue-500">BRASIL</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            Especialistas em reparos de alta complexidade. Envie seu equipamento com segurança e receba de volta como novo.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="https://wa.me/5519987510267?text=Gostaria%20de%20um%20orçamento%20para%20reparo%20nacional" 
              className="inline-flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg shadow-red-900/50 transition-all hover:scale-105 hover:shadow-red-600/50"
            >
              <Truck className="w-6 h-6" />
              Solicitar Coleta Grátis*
            </Link>
            <Link 
              href="#servicos" 
              className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-lg font-bold py-4 px-10 rounded-xl transition-all"
            >
              <Wrench className="w-6 h-6" />
              Ver Serviços
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-4">*Frete grátis para serviços aprovados acima de R$ 500,00.</p>
        </div>
      </section>

      {/* 2. Conteúdo de Conversão Nacional */}
      <section className="bg-white py-12 border-b border-zinc-200">
        <div className="container mx-auto px-4">
           <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-8 md:p-12 shadow-inner">
              <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black text-zinc-900 mb-4">Mora longe? Não tem problema!</h2>
                    <p className="text-lg text-zinc-600 mb-6">
                       Atendemos clientes de todo o Brasil através do nosso sistema seguro de logística reversa. 
                       Você envia, nós consertamos e devolvemos com garantia e nota fiscal.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-bold text-zinc-500">
                       <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Sul</span>
                       <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Sudeste</span>
                       <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Centro-Oeste</span>
                       <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Nordeste/Norte</span>
                    </div>
                 </div>
                 <div className="w-full md:w-auto">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 max-w-sm mx-auto">
                       <h3 className="font-bold text-red-600 flex items-center gap-2 mb-4">
                          <MapPin className="w-5 h-5" /> Como funciona:
                       </h3>
                       <ol className="space-y-3 text-sm text-zinc-700">
                          <li className="flex gap-3"><span className="bg-zinc-100 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</span> Solicite pré-orçamento online</li>
                          <li className="flex gap-3"><span className="bg-zinc-100 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</span> Envie pelos Correios/Transportadora</li>
                          <li className="flex gap-3"><span className="bg-zinc-100 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">3</span> Aprovação e Reparo no Laboratório</li>
                          <li className="flex gap-3"><span className="bg-zinc-100 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">4</span> Pagamento e Devolução Segura</li>
                       </ol>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Services List Section - Optimized with Accordion */}
      <section id="servicos" className="py-20 bg-zinc-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              SOLUÇÕES EM <span className="text-red-600">TECNOLOGIA</span>
            </h2>
            <p className="text-lg text-zinc-400 font-light">
              Laboratório avançado com certificação internacional. Escolha seu serviço abaixo:
            </p>
          </div>

          <div className="space-y-8 mb-20">
            {FEATURED_SERVICES.map((service, idx) => (
               <div key={idx} className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-3xl overflow-hidden hover:border-red-600/30 transition-all group">
                 <details className="group/details">
                    <summary className="list-none cursor-pointer">
                      <div className="flex flex-col lg:flex-row p-6 lg:p-8 items-start lg:items-center gap-6">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-red-600 shadow-lg border border-zinc-700 shrink-0">
                          <service.icon className="w-8 h-8" />
                        </div>
                        
                        {/* Summary Info */}
                        <div className="flex-grow">
                           <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors flex items-center gap-3">
                              {service.title}
                              <ChevronDown className="w-6 h-6 text-zinc-500 transition-transform group-open/details:rotate-180" />
                           </h3>
                           <p className="text-zinc-400">{service.shortDescription}</p>
                        </div>

                        {/* CTA Summary */}
                        <div className="hidden lg:flex items-center gap-4 shrink-0">
                           <span className="text-sm font-bold text-green-500 flex items-center gap-1">
                              <Star className="w-4 h-4 fill-current" /> Garantia Garantida
                           </span>
                           <span className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors">
                              Ver Detalhes
                           </span>
                        </div>
                      </div>
                    </summary>

                    {/* Expandable Content (Accordion) */}
                    <div className="border-t border-zinc-700/50 bg-zinc-900/50 p-6 lg:p-10 animate-in fade-in slide-in-from-top-2 duration-300">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          <div className="space-y-6">
                             <div>
                                <h4 className="text-red-500 font-bold uppercase text-sm mb-2 tracking-widest">Descrição Técnica</h4>
                                <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
                                   {service.longDescription}
                                </p>
                             </div>
                             
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
                                   <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                                      <Search className="w-4 h-4 text-red-500" /> Sintomas Comuns
                                   </h5>
                                   <ul className="space-y-2 text-sm text-zinc-400">
                                      {service.symptoms.map((s, i) => (
                                         <li key={i} className="flex items-start gap-2">
                                            <span className="w-1 h-1 bg-red-500 rounded-full mt-2 shrink-0"/> {s}
                                         </li>
                                      ))}
                                   </ul>
                                </div>
                                <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
                                   <h5 className="font-bold text-white mb-3 flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-500" /> Processo de Reparo
                                   </h5>
                                   <ul className="space-y-2 text-sm text-zinc-400">
                                      {service.process.map((p, i) => (
                                         <li key={i} className="flex items-start gap-2">
                                            <span className="text-zinc-600 font-bold text-xs">{i+1}.</span> {p}
                                         </li>
                                      ))}
                                   </ul>
                                </div>
                             </div>
                          </div>

                          <div className="flex flex-col justify-between space-y-6">
                             <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
                                <h4 className="text-white font-bold mb-4 border-b border-zinc-700 pb-2">Informações de Serviço</h4>
                                <div className="space-y-4">
                                   <div className="flex justify-between items-center">
                                      <span className="text-zinc-400 text-sm">Tempo Estimado:</span>
                                      <span className="text-white font-bold">{service.time}</span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                      <span className="text-zinc-400 text-sm">Garantia Oferecida:</span>
                                      <span className="text-green-400 font-bold">{service.warranty}</span>
                                   </div>
                                   <div className="flex justify-between items-center">
                                      <span className="text-zinc-400 text-sm">Pagamento:</span>
                                      <span className="text-white text-xs">Até 12x no Cartão / Pix (-5%)</span>
                                   </div>
                                </div>
                             </div>

                             <div className="bg-gradient-to-br from-red-900/20 to-zinc-900 border border-red-900/30 p-6 rounded-xl">
                                <h4 className="text-red-500 font-bold mb-2">Pronto para resolver?</h4>
                                <p className="text-zinc-400 text-sm mb-6">Fale diretamente com um técnico especialista agora mesmo.</p>
                                <Link 
                                  href={`https://wa.me/5519987510267?text=Tenho%20interesse%20em%20${service.title}`}
                                  className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors gap-2"
                                >
                                   <MessageCircle className="w-5 h-5" />
                                   Solicitar Orçamento via WhatsApp
                                </Link>
                             </div>
                          </div>
                       </div>
                    </div>
                 </details>
               </div>
            ))}
          </div>

          {/* More Services Grid */}
          <div className="mt-20 pt-20 border-t border-zinc-800">
             <h3 className="text-2xl font-bold text-center text-zinc-500 mb-12 uppercase tracking-widest">Outros Serviços Especializados</h3>
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
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="ofertas" className="py-12 bg-white text-zinc-900 border-b border-zinc-200">
        <div className="container mx-auto px-4 mb-8">
          <div className="flex items-center gap-4 mb-4 justify-center">
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 uppercase tracking-tight text-center">
              Ofertas <span className="text-red-600">Relâmpago</span>
            </h2>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {validProducts.map((product, index) => {
              const currentPrice = parsePrice(product?.price || '0');
              const originalPrice = currentPrice * 1.4;

              return (
                <div 
                  key={product?.id || index} 
                  className="group relative bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="relative h-48 bg-zinc-50 flex items-center justify-center p-4">
                    {product?.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-zinc-100 text-zinc-300 rounded-lg">
                        <span className="text-xs font-bold">Sem Imagem</span>
                      </div>
                    )}
                    
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
                      -{Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}%
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-2">
                       <OfferCountdown />
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 mb-2 line-clamp-2 min-h-[2.5em]">
                      {product?.name}
                    </h3>

                    <div className="mt-auto">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-400 line-through">
                          de {formatPrice(originalPrice)}
                        </span>
                        <span className="text-lg font-black text-red-600">
                          {product?.price ? (
                             product.price.includes('R$') ? product.price : formatPrice(currentPrice)
                          ) : 'R$ ---'}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/product/${product?.id}`}
                        className="mt-3 w-full bg-zinc-900 hover:bg-red-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors text-center block"
                      >
                        COMPRAR
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. Otimização para Rankamento Organizado - Landing Sections por Região */}
      <section className="py-16 bg-zinc-900 border-t border-zinc-800 text-zinc-400 text-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Atendimento Nacional Especializado</h2>
            <p className="max-w-2xl mx-auto text-zinc-500">
              Nossa logística reversa permite atender com agilidade e segurança todas as capitais e regiões do Brasil. 
              Consulte a disponibilidade de coleta gratuita para sua cidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {/* Sudeste */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" /> Sudeste
              </h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-red-500 transition-colors">São Paulo - SP</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Rio de Janeiro - RJ</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Belo Horizonte - MG</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Vitória - ES</Link></li>
                <li className="text-zinc-600 pt-2 text-xs">Campinas, Santos, Ribeirão Preto...</li>
              </ul>
            </div>

            {/* Sul */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" /> Sul
              </h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-red-500 transition-colors">Curitiba - PR</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Florianópolis - SC</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Porto Alegre - RS</Link></li>
                <li className="text-zinc-600 pt-2 text-xs">Joinville, Londrina, Caxias do Sul...</li>
              </ul>
            </div>

            {/* Centro-Oeste */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" /> Centro-Oeste
              </h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-red-500 transition-colors">Brasília - DF</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Goiânia - GO</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Cuiabá - MT</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Campo Grande - MS</Link></li>
              </ul>
            </div>

            {/* Nordeste */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" /> Nordeste
              </h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-red-500 transition-colors">Salvador - BA</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Recife - PE</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Fortaleza - CE</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">São Luís - MA</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Natal - RN</Link></li>
              </ul>
            </div>

            {/* Norte */}
            <div>
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" /> Norte
              </h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-red-500 transition-colors">Manaus - AM</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Belém - PA</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Porto Velho - RO</Link></li>
                <li><Link href="#" className="hover:text-red-500 transition-colors">Palmas - TO</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-600">
            <p>Atendemos todas as 27 capitais e mais de 5000 municípios brasileiros via Correios e Transportadoras Parceiras.</p>
          </div>
        </div>
      </section>

      {/* 5. Performance Technical Requirements - Mobile Optimized Footer Call */}
      <div className="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 p-4 md:hidden z-50 flex gap-2">
         <Link href="https://wa.me/5519987510267" className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm shadow-lg">
            <MessageCircle className="w-4 h-4" /> WhatsApp
         </Link>
         <Link href="tel:+551932551661" className="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm border border-zinc-700">
             Ligar Agora
         </Link>
      </div>

    </main>
  )
}