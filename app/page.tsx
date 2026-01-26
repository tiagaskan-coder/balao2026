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
        </main>
      </div>
    </div>
  );
}
