import Header from "@/components/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Periféricos Gamer e Office | Balão da Informática",
  description: "Encontre os melhores periféricos: Mouses, Teclados, Headsets e Webcams com os melhores preços de Campinas e região.",
  openGraph: {
    title: "Periféricos Gamer e Office | Balão da Informática",
    description: "Upgrade seu setup com periféricos de alta performance. Mouses, Teclados, Headsets e mais. Entrega rápida em Campinas.",
    images: ["https://www.balao.info/perifericos-banner.jpg"], // Placeholder image
  },
};

// Mock data for initial high-conversion look
const PRODUCTS = [
  {
    id: "p1",
    name: "Mouse Gamer Logitech G502 HERO",
    price: "R$ 299,90",
    image: "https://resource.logitechg.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/g502/g502-hero-gallery-1.png?v=1",
    category: "Mouse",
    features: ["Sensor HERO 25K", "11 Botões Programáveis", "RGB LIGHTSYNC"]
  },
  {
    id: "p2",
    name: "Teclado Mecânico Redragon Kumara",
    price: "R$ 189,90",
    image: "https://m.media-amazon.com/images/I/71J1s6x4CXL._AC_SL1500_.jpg",
    category: "Teclado",
    features: ["Switch Outemu Blue", "Anti-Ghosting", "Compacto TKL"]
  },
  {
    id: "p3",
    name: "Headset Gamer HyperX Cloud Stinger 2",
    price: "R$ 249,90",
    image: "https://row.hyperx.com/cdn/shop/products/hyperx_cloud_stinger_2_core_pc_1_main_900x.jpg?v=1663955653",
    category: "Headset",
    features: ["Drivers 40mm", "Microfone com cancelamento", "Leve e Confortável"]
  },
  {
    id: "p4",
    name: "Webcam Logitech C920s Pro Full HD",
    price: "R$ 349,90",
    image: "https://resource.logitech.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/webcams/c920s/gallery/c920s-gallery-1.png?v=1",
    category: "Webcam",
    features: ["1080p/30fps", "Foco Automático", "Proteção de Privacidade"]
  },
  {
    id: "p5",
    name: "Mousepad Gamer Extra Grande Speed",
    price: "R$ 59,90",
    image: "https://m.media-amazon.com/images/I/61b1+D2nZLL._AC_SL1000_.jpg",
    category: "Acessórios",
    features: ["90x40cm", "Borda Costurada", "Base Antiderrapante"]
  }
];

export default function PerifericosPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-700 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.balao.info/images/bg-tech-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase italic">
              Domine o Jogo <br/>
              <span className="text-yellow-400">Com Precisão</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 font-light">
              Mouses, teclados e headsets de alta performance para levar seu setup ao próximo nível.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="#ofertas" className="bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black py-4 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300">
                VER OFERTAS
              </a>
              <a href="https://wa.me/551932551661?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20periféricos" target="_blank" className="bg-transparent border-2 border-white hover:bg-white hover:text-red-900 text-white font-bold py-4 px-8 rounded-full text-lg transition duration-300">
                FALAR COM ESPECIALISTA
              </a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
             {/* Placeholder for Hero Image - CSS shape or actual image */}
             <div className="relative w-80 h-80 md:w-[500px] md:h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <img 
                  src="https://resource.logitechg.com/w_1000,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/pro-x-superlight/pro-x-superlight-black-gallery-1.png?v=1" 
                  alt="Periféricos Gamer" 
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:-translate-y-4 transition duration-500"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Razões */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-black text-center text-gray-900 mb-16 uppercase italic">
            Por que comprar no <span className="text-red-600">Balão?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Entrega Rápida", desc: "Receba em até 24h na região de Campinas.", icon: "🚀" },
              { title: "Garantia Real", desc: "Suporte direto na loja física. Sem dor de cabeça.", icon: "🛡️" },
              { title: "Especialistas", desc: "Consultoria grátis para montar seu setup ideal.", icon: "👨‍💻" },
              { title: "Melhores Marcas", desc: "Logitech, Razer, HyperX, Redragon e mais.", icon: "🏆" },
              { title: "Preço Justo", desc: "Negociamos direto com fabricantes para você.", icon: "💰" },
              { title: "Testado e Aprovado", desc: "Produtos selecionados pela nossa equipe técnica.", icon: "✅" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-2xl hover:shadow-xl hover:border-red-100 transition duration-300 bg-gray-50 hover:bg-white group">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition duration-300">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Charts - Gráficos */}
      <section className="py-20 bg-gray-900 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase italic leading-tight">
                A diferença entre <br/>
                <span className="text-red-500">Ganhar e Perder</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Periféricos comuns têm latência alta e sensores imprecisos. 
                Com nossos equipamentos gamer, cada movimento é registrado instantaneamente.
              </p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2 font-bold text-sm uppercase tracking-wider">
                    <span>Tempo de Resposta (Mouse Comum)</span>
                    <span className="text-gray-400">15ms</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500 w-[80%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 font-bold text-sm uppercase tracking-wider text-red-400">
                    <span>Tempo de Resposta (Mouse Gamer)</span>
                    <span className="text-white">1ms</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-red-600 to-yellow-500 w-[10%] shadow-[0_0_15px_rgba(255,0,0,0.8)]"></div>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-gray-800 rounded-xl border-l-4 border-red-500">
                <p className="text-gray-200 italic">
                  "Depois que troquei meu kit escritório por um mecânico e um mouse gamer do Balão, meu KD no Valorant subiu de 0.8 pra 1.5 em uma semana."
                </p>
                <p className="mt-4 font-bold text-red-400">- Cliente Satisfeito</p>
              </div>
            </div>
            <div className="md:w-1/2 relative">
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-red-600 blur-[100px] opacity-20"></div>
               <img 
                 src="https://resource.logitechg.com/w_1000,c_limit,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/g915-tkl/g915-tkl-gallery-1-carbon.png?v=1" 
                 alt="Teclado Mecânico Gamer" 
                 className="relative z-10 w-full drop-shadow-2xl transform rotate-[-10deg] hover:rotate-0 transition duration-700"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Ofertas */}
      <section id="ofertas" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 uppercase italic">Ofertas Imperdíveis</h2>
            <p className="text-xl text-gray-600">Equipamentos selecionados com o melhor custo-benefício.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 group flex flex-col h-full border border-gray-100">
                <div className="relative h-48 p-6 flex items-center justify-center bg-gray-50 group-hover:bg-white transition-colors">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain transform group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                    OFERTA
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="text-xs font-bold text-red-600 uppercase mb-2">{product.category}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight flex-1">{product.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <div className="text-sm text-gray-400 line-through mb-1">De R$ {(parseFloat(product.price.replace('R$ ', '').replace(',', '.')) * 1.4).toFixed(2).replace('.', ',')}</div>
                    <div className="text-2xl font-black text-red-600 mb-4">{product.price} <span className="text-sm font-normal text-gray-500">à vista</span></div>
                    <a 
                      href={`https://wa.me/551932551661?text=Tenho%20interesse%20no%20${encodeURIComponent(product.name)}`} 
                      target="_blank"
                      className="block w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl text-center shadow-lg transition duration-300 flex items-center justify-center gap-2"
                    >
                      <span>COMPRAR NO WHATSAPP</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/categoria/computadores-e-informatica" className="inline-block border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300">
              VER TODOS OS PERIFÉRICOS
            </a>
          </div>
        </div>
      </section>

      {/* Categories Links */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">Navegue por Categoria</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["Mouses", "Teclados", "Headsets", "Webcams", "Microfones", "Mousepads", "Controles", "Cabos"].map((cat) => (
              <a key={cat} href={`/categoria/${cat.toLowerCase()}`} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200">
                {cat}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Footer Text */}
      <section className="py-12 bg-gray-50 text-gray-600 text-sm">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Loja de Periféricos em Campinas</h2>
          <p className="mb-4">
            Procurando por <strong>periféricos gamer em Campinas</strong>? O Balão da Informática é a sua melhor escolha. 
            Oferecemos uma linha completa de mouses, teclados mecânicos, headsets 7.1 e muito mais para você montar o setup dos sonhos.
          </p>
          <p className="mb-4">
            Trabalhamos com as melhores marcas do mercado como Logitech, Razer, HyperX, Redragon e Corsair. 
            Seja para jogos competitivos (FPS, MOBA) ou para produtividade no home office, temos o equipamento certo para você.
          </p>
          <p>
            Entregamos em toda a região metropolitana: Campinas, Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo e Indaiatuba. 
            Conte com nossa garantia local e suporte especializado.
          </p>
        </div>
      </section>
    </div>
  );
}
