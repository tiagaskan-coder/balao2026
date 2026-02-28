import { Metadata } from 'next'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Smartphone, 
  Battery, 
  Cpu, 
  Wifi, 
  ShieldCheck, 
  Wrench, 
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { ProductCarousel } from '@/components/ProductCarousel'
import { getProducts } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Conserto de iPhone e iPad em Campinas | Assistência Apple Especializada | Balão da Informática',
  description: 'Assistência Técnica Especializada Apple em Campinas. Troca de tela iPhone, bateria, conector de carga, Face ID e reparo de placa. Peças premium e garantia.',
  keywords: [
    'conserto iphone campinas',
    'assistência técnica apple',
    'troca tela iphone',
    'bateria iphone viciada',
    'conserto ipad campinas',
    'reparo placa iphone',
    'face id iphone',
    'vidro traseiro iphone',
    'loja apple campinas',
    'manutenção iphone'
  ]
}

export default async function ReparoApplePage() {
  const allProducts = await getProducts()
  
  // Filtrar produtos relacionados a iphone pro (conforme pedido do usuário)
  const appleProducts = allProducts.filter(p => {
    const text = (p.name + " " + (p.description || "") + " " + p.category).toLowerCase()
    return text.includes('iphone') && text.includes('pro')
  })

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans text-zinc-100">
      <Header />
      
      <main className="flex-1">
        {/* Bloco 1: Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-black z-0" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium mb-6 border border-zinc-700">
                <Wrench className="w-4 h-4" />
                <span>Laboratório Especializado Apple</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Seu iPhone ou iPad Novo de Novo. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Especialistas em Apple.</span>
              </h1>
              <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                Reparos avançados de placa, troca de vidro, bateria e tela com peças de altíssima qualidade. 
                Técnicos certificados e laboratório de ponta em Campinas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-black hover:bg-zinc-200 px-8 h-12 text-lg">
                  <Phone className="w-5 h-5 mr-2" />
                  Orçamento Grátis
                </Button>
                <Button variant="outline" size="lg" className="border-zinc-700 text-zinc-100 hover:bg-zinc-800 h-12 text-lg">
                  Ver Serviços
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Bloco 2: Modelos Atendidos */}
        <section className="py-12 border-y border-zinc-800 bg-zinc-900/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-zinc-500 mb-6 text-sm uppercase tracking-wider font-semibold">Atendemos toda a linha</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base text-zinc-300">
              {['iPhone 15 Pro Max', 'iPhone 15/15 Pro', 'iPhone 14 Series', 'iPhone 13 Series', 'iPhone 12 Series', 'iPhone 11', 'iPhone XR/XS', 'iPad Pro', 'iPad Air'].map((model) => (
                <span key={model} className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
                  {model}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Bloco 3: Principais Serviços */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Serviços Realizados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 transition-all group">
                <CardContent className="p-6">
                  <Smartphone className="w-10 h-10 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Troca de Tela e Vidro</h3>
                  <p className="text-zinc-400">
                    Substituição de displays quebrados, com manchas ou touch falhando. Opções de telas Originais Recondicionadas ou Premium.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 transition-all group">
                <CardContent className="p-6">
                  <Battery className="w-10 h-10 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Troca de Bateria</h3>
                  <p className="text-zinc-400">
                    Seu iPhone descarrega rápido? Trocamos sua bateria por uma nova com saúde 100% e garantia de performance.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 transition-all group">
                <CardContent className="p-6">
                  <Cpu className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Reparo de Placa</h3>
                  <p className="text-zinc-400">
                    Recuperação de aparelhos que não ligam, molhados, erro de carga (Tristar), falha de áudio e curto-circuito.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 transition-all group">
                <CardContent className="p-6">
                  <div className="w-10 h-10 text-yellow-500 mb-4 flex items-center justify-center font-bold text-xl border-2 border-yellow-500 rounded-lg">ID</div>
                  <h3 className="text-xl font-bold mb-2">Face ID e Câmeras</h3>
                  <p className="text-zinc-400">
                    Reparo do sistema TrueDepth (Face ID) que parou de funcionar e troca de lentes e módulos de câmera.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 transition-all group">
                <CardContent className="p-6">
                  <Wifi className="w-10 h-10 text-cyan-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Sinal e Conectividade</h3>
                  <p className="text-zinc-400">
                    Correção de problemas de Wi-Fi cinza, Bluetooth, GPS e falhas de sinal de operadora (Sem Serviço).
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800/80 transition-all group">
                <CardContent className="p-6">
                  <ShieldCheck className="w-10 h-10 text-zinc-300 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Tampa Traseira</h3>
                  <p className="text-zinc-400">
                    Troca do vidro traseiro quebrado com acabamento perfeito, mantendo a estética original do seu iPhone.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Bloco 4: Carrossel de Produtos (Filtrado por iPhone Pro) */}
        <section className="bg-zinc-900 py-16 border-y border-zinc-800">
          <div className="container mx-auto px-4">
             <ProductCarousel 
                title="iPhones Pro e Acessórios" 
                products={appleProducts} 
             />
             <div className="mt-8 text-center">
                <Link href="/busca?q=iphone">
                  <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                    Ver todos os produtos Apple
                  </Button>
                </Link>
             </div>
          </div>
        </section>

        {/* Bloco 5: Diferenciais do Laboratório */}
        <section className="py-20 bg-black">
           <div className="container mx-auto px-4">
             <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1 space-y-8">
                 <h2 className="text-3xl font-bold">Laboratório de Alta Precisão</h2>
                 <p className="text-zinc-400 text-lg">
                   Não entregue seu Apple na mão de curiosos. Utilizamos microscópios trinoculares, 
                   ferramentas de precisão e insumos de primeira linha para garantir que o reparo seja duradouro.
                 </p>
                 <ul className="space-y-4">
                   <li className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-purple-500" />
                     <span>Técnicos certificados e em constante atualização</span>
                   </li>
                   <li className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-purple-500" />
                     <span>Peças com qualidade Original e Premium</span>
                   </li>
                   <li className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-purple-500" />
                     <span>Garantia de 90 dias a 1 ano (dependendo do serviço)</span>
                   </li>
                   <li className="flex items-center gap-3">
                     <CheckCircle2 className="w-5 h-5 text-purple-500" />
                     <span>Backup de dados (opcional e seguro)</span>
                   </li>
                 </ul>
               </div>
               <div className="flex-1">
                 {/* Placeholder visual para imagem de laboratório */}
                 <div className="aspect-video bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center">
                    <Wrench className="w-20 h-20 text-zinc-700" />
                    <span className="ml-4 text-zinc-600 font-bold">Laboratório Técnico</span>
                 </div>
               </div>
             </div>
           </div>
        </section>

        {/* Bloco 6: Como Funciona */}
        <section className="py-20 bg-zinc-900/50">
           <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-bold mb-12">Processo de Reparo Transparente</h2>
             <div className="grid md:grid-cols-4 gap-8">
               {[
                 { step: '01', title: 'Orçamento', desc: 'Traga seu aparelho ou envie por correio. Analisamos o defeito gratuitamente.' },
                 { step: '02', title: 'Aprovação', desc: 'Enviamos o diagnóstico e valor. Você decide se faz o serviço.' },
                 { step: '03', title: 'Reparo', desc: 'Executamos o conserto com agilidade e precisão técnica.' },
                 { step: '04', title: 'Entrega', desc: 'Seu Apple pronto, testado e com garantia.' }
               ].map((item) => (
                 <div key={item.step} className="relative p-6">
                   <span className="text-6xl font-black text-zinc-800 absolute top-0 left-0 -z-10 select-none">{item.step}</span>
                   <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                   <p className="text-zinc-400">{item.desc}</p>
                 </div>
               ))}
             </div>
           </div>
        </section>

        {/* Bloco 7: SEO Nacional - Envio por Correio */}
        <section className="py-20 bg-black border-y border-zinc-800">
          <div className="container mx-auto px-4">
             <div className="max-w-4xl mx-auto text-center bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
               <MapPin className="w-12 h-12 text-purple-500 mx-auto mb-6" />
               <h2 className="text-3xl font-bold mb-4">Mora longe? Envie seu Apple via Correios</h2>
               <p className="text-zinc-400 mb-8">
                 Atendemos clientes de todo o Brasil. Você envia seu iPhone ou iPad, nós consertamos e enviamos de volta com seguro.
                 Todo o processo é registrado e você acompanha o status online.
               </p>
               <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                 Ver Instruções de Envio
               </Button>
             </div>
          </div>
        </section>

        {/* Bloco 8: FAQ */}
        <section className="py-20 bg-zinc-900">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Perguntas Frequentes</h2>
            <div className="space-y-4">
              {[
                { q: "Perco meus dados no conserto?", a: "Na maioria dos reparos (tela, bateria, câmera) seus dados são preservados. Em reparos de software ou placa grave, pode haver perda, por isso recomendamos backup sempre que possível." },
                { q: "A peça é original Apple?", a: "Trabalhamos com peças de qualidade Original (retiradas) e Premium. Sempre informamos a procedência e qualidade da peça no orçamento." },
                { q: "Quanto tempo demora a troca de tela?", a: "Geralmente realizamos a troca de tela e bateria em até 1 hora, mediante agendamento prévio." },
                { q: "Vocês consertam Face ID?", a: "Sim, somos especialistas em reparo de Face ID que parou de funcionar após queda ou contato com líquido." }
              ].map((item, i) => (
                <div key={i} className="bg-black border border-zinc-800 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-zinc-200">{item.q}</h3>
                  <p className="text-zinc-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bloco 9: Disclaimer */}
        <section className="py-8 bg-black text-center border-t border-zinc-800">
          <div className="container mx-auto px-4">
            <p className="text-zinc-600 text-xs max-w-3xl mx-auto">
              A Balão da Informática é uma assistência técnica independente e não tem vínculo oficial com a Apple Inc. 
              Apple, iPhone, iPad e Mac são marcas registradas da Apple Inc.
            </p>
          </div>
        </section>

        {/* Bloco 10: CTA Final */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-900/10" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl font-bold mb-6">Recupere seu Apple Hoje Mesmo</h2>
            <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
              Qualidade, transparência e preço justo. Fale com nossos técnicos agora.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button size="lg" className="bg-green-600 text-white hover:bg-green-700 text-lg px-8 rounded-full">
                 <Phone className="w-5 h-5 mr-2" />
                 Chamar no WhatsApp
               </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
