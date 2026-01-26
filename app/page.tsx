import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts, getCarouselImages, getCategories, getHomeBlocks } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ category?: string; search?: string }>;

export default async function Home(props: {
  searchParams: SearchParams;
}) {
  const [products, carouselImages, categories, homeBlocks] = await Promise.all([
    getProducts(),
    getCarouselImages(true),
    getCategories(),
    getHomeBlocks(true)
  ]);
  
  const searchParams = await props.searchParams;
  const category = searchParams?.category;
  const search = searchParams?.search;

  // Helper to find all descendant category names
  const getDescendantNames = (rootName: string, allCategories: any[]) => {
      const root = allCategories.find(c => c.name === rootName);
      if (!root) return [];
      
      const descendants: string[] = [];
      const stack = [root.id];
      
      while (stack.length > 0) {
          const currentId = stack.pop();
          const children = allCategories.filter(c => c.parent_id === currentId);
          children.forEach(child => {
              descendants.push(child.name);
              stack.push(child.id);
          });
      }
      return descendants;
  }

  const validCategories = new Set<string>();
  if (category) {
      validCategories.add(category);
      const descendants = getDescendantNames(category, categories);
      descendants.forEach(d => validCategories.add(d));
  }

  let filteredProducts = products.filter(p => {
    if (category && category !== "Todos os Produtos" && !validCategories.has(p.category)) return false;
    return true;
  });

  if (search) {
      filteredProducts = searchProducts(filteredProducts, search);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      
      {/* Carousel Banner */}
      {!search && !category && (
          <div className="container mx-auto px-4 mt-6">
              {carouselImages.length > 0 ? (
                  <Carousel images={carouselImages} />
              ) : (
                  <div className="w-full h-40 md:h-64 lg:h-80 bg-gradient-to-r from-[#E60012] to-red-800 rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-md">
                      Ofertas Imperdíveis
                  </div>
              )}
          </div>
      )}

      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        <div className="hidden lg:block">
            <Sidebar categories={categories} />
        </div>
        <main className="flex-1 w-full min-w-0">
            {/* Dynamic Home Blocks */}
            {!search && !category && (
                <>
                {/* Dynamic Home Blocks */}
                {homeBlocks.map(block => {
                    const blockProducts = products.filter(p => p.category === block.category_id);
                    if (blockProducts.length === 0) return null;
                    return (
                        <ProductCarousel 
                            key={block.id}
                            title={block.title || block.category_id}
                            products={blockProducts}
                            categoryId={block.category_id}
                        />
                    );
                })}
                </>
            )}

            {/* Product List - Only show when searching or browsing category */}
            {(category || search) && (
              <>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-800">
                        {category || `Resultados para: "${search}"`}
                    </h1>
                    <span className="text-sm text-gray-500">{filteredProducts.length} produtos</span>
                </div>

                {filteredProducts.length === 0 ? (
                   <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
                      <p className="text-xl font-medium">Nenhum produto encontrado.</p>
                   </div>
                ) : (
                  <ProductList products={filteredProducts} />
                )}
              </>
            )}

            {/* SEO Content Section */}
            {!search && !category && (
                <section className="bg-white p-8 rounded-xl shadow-sm mt-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Balão da Informática: Sua Loja de Informática em Campinas e Região</h1>
                    
                    <div className="prose max-w-none text-gray-600 space-y-4">
                        <p>
                            Bem-vindo ao <strong>Balão da Informática</strong>, a sua principal referência em tecnologia e hardware em <strong>Campinas</strong> e toda a região. Se você procura onde comprar peças de computador, notebooks, ou montar aquele PC Gamer dos sonhos, você chegou ao lugar certo. Nossa loja de informática em Campinas oferece um catálogo completo com as melhores marcas do mercado, incluindo placas de vídeo NVIDIA GeForce e AMD Radeon, processadores Intel Core e AMD Ryzen, além de uma vasta linha de periféricos como teclados mecânicos, mouses gamers e monitores de alta frequência.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mt-6">Atendemos Toda a Região Metropolitana de Campinas (RMC)</h2>
                        <p>
                            Com logística privilegiada, atendemos com agilidade não apenas Campinas, mas toda a Região Metropolitana (RMC). Se você está em <strong>Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo, Indaiatuba, Americana ou Jaguariúna</strong>, conte com a nossa eficiência. Sabemos que quem busca informática em Campinas exige qualidade, garantia e preço justo. Por isso, cobrimos ofertas e garantimos a melhor experiência de compra, unindo a conveniência do online com a confiança de uma empresa local sólida.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mt-6">Especialistas em PC Gamer e Workstations</h2>
                        <p>
                            Não importa se você é um entusiasta de hardware procurando o último lançamento ou uma empresa em busca de workstations potentes para renderização e design, o Balão da Informática em Campinas tem a solução. Oferecemos também serviços de consultoria para <strong>montagem de computadores personalizados</strong>, garantindo que você leve para casa a máquina exata para sua necessidade, seja para jogos competitivos (eSports), edição de vídeo profissional ou uso corporativo em escritório.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mt-6">Por que escolher o Balão da Informática?</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Variedade:</strong> O maior estoque de peças de PC da região de Campinas.</li>
                            <li><strong>Preço Competitivo:</strong> Ofertas agressivas em hardware high-end e entrada.</li>
                            <li><strong>Entrega Rápida:</strong> Receba seus produtos rapidamente em qualquer bairro de Campinas (Centro, Cambuí, Barão Geraldo, Taquaral, Ouro Verde, etc) e cidades vizinhas.</li>
                            <li><strong>Suporte Especializado:</strong> Equipe técnica pronta para tirar suas dúvidas sobre compatibilidade e desempenho.</li>
                        </ul>

                        <p className="mt-6">
                            Procurando <em>loja de informática no centro de Campinas</em> ou delivery de peças de computador? Esqueça a demora de comprar em sites distantes. Valorize o comércio local de Campinas e tenha seu produto em mãos muito mais rápido. Confira nossas promoções de SSDs NVMe, memórias RAM DDR4 e DDR5, gabinetes, fontes certificadas e cadeiras gamer ergonômicas.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-800 mt-6">Entrega Flash em Campinas</h2>
                        <p>
                            Precisa de urgência? Utilize nosso serviço de <strong>Entrega Flash</strong>. Para pedidos confirmados, conseguimos entregar no mesmo dia em diversos bairros de Campinas. Consulte a disponibilidade pelo nosso calculador de frete na página do produto.
                        </p>
                        
                        <p className="font-semibold text-[#E60012] mt-4">
                            Balão da Informática: A escolha número 1 em tecnologia em Campinas, Sumaré, Hortolândia e região. Venha conferir!
                        </p>
                    </div>
                </section>
            )}
        </main>
      </div>
    </div>
  );
}
