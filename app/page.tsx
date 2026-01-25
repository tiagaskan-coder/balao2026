import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import Carousel from "@/components/Carousel";
import ProductCarousel from "@/components/ProductCarousel";
import { getProducts, getCarouselImages, getCategories, getHomeBlocks } from "@/lib/db";

// Remove force-dynamic to allow better caching and prevent 500s on timeout. 
// Next.js will revalidate data every 60 seconds.
export const revalidate = 60;

export default async function Home(props: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const [products, carouselImages, categories, homeBlocks] = await Promise.all([
    getProducts(),
    getCarouselImages(true),
    getCategories(),
    getHomeBlocks(true)
  ]);
  
  const category = searchParams.category;
  const search = searchParams.search;

  const filteredProducts = products.filter(p => {
    if (category && category !== "Todos os Produtos" && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Limit to 20 items for the "Destaques" (default) view
  const isFeatured = !category && !search;
  const displayedProducts = isFeatured ? filteredProducts.slice(0, 20) : filteredProducts;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        <div className="hidden lg:block">
            <Sidebar categories={categories} />
        </div>
        <main className="flex-1 w-full min-w-0">
            {/* Carousel Banner */}
            {!search && !category && (
                <>
                <div className="mb-6 -mx-4 lg:mx-0">
                    {carouselImages.length > 0 ? (
                        <Carousel images={carouselImages} />
                    ) : (
                        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-[#E60012] to-red-800 rounded-lg flex items-center justify-center text-white text-3xl font-bold shadow-md">
                            Ofertas Imperdíveis
                        </div>
                    )}
                </div>

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

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800">
                    {category || (search ? `Resultados para: "${search}"` : "Destaques")}
                </h1>
                <span className="text-sm text-gray-500">{displayedProducts.length} produtos</span>
            </div>

          {displayedProducts.length === 0 ? (
             <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm">
                <p className="text-xl font-medium">Nenhum produto encontrado.</p>
                {products.length === 0 && (
                    <p className="mt-4 text-sm bg-blue-50 text-blue-700 inline-block px-4 py-2 rounded-md">
                        Dica: Configure as chaves do Supabase no .env.local e acesse a área administrativa.
                    </p>
                )}
             </div>
          ) : (
            <ProductList products={displayedProducts} />
          )}
        </main>
      </div>
    </div>
  );
}
