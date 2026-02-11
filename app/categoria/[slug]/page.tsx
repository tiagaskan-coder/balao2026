import Header from "@/components/Header";
import ProductList from "@/components/ProductList";
import FilterSyncer from "@/components/FilterSyncer";
import { getProducts, getCategories } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";
import { extractTags, filterProductsByTags } from "@/lib/product-filters";
import type { Category } from "@/lib/utils";
 
export const dynamic = "force-dynamic";
 
export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string; tags?: string }>;
}) {
  const { slug } = await params;
  const { search, tags: tagsParam } = await searchParams;
  const selectedTags = tagsParam ? tagsParam.split(',') : [];
 
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
 
  const findBySlug = (s: string, all: Category[]) =>
    all.find((c) => c.slug === s);
  const selectedCat = findBySlug(slug, categories);
  
  let categoryName = selectedCat?.name;
  if (slug === 'todos-os-produtos') {
      categoryName = 'Todos os Produtos';
  }

  const getDescendantNames = (root: Category | undefined, all: Category[]) => {
    if (!root) return [];
    const descendants: string[] = [];
    const stack = [root.id];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      const children = all.filter((c) => c.parent_id === currentId);
      children.forEach((child) => {
        descendants.push(child.name);
        stack.push(child.id);
      });
    }
    return descendants;
  };
 
  const validCategories = new Set<string>();
  if (categoryName) {
    validCategories.add(categoryName);
    const descendants = getDescendantNames(selectedCat, categories);
    descendants.forEach((d) => validCategories.add(d));
  }
 
  let filteredProducts = products.filter((p) => {
    if (categoryName && categoryName !== "Todos os Produtos" && !validCategories.has(p.category)) return false;
    return true;
  });
 
  if (search) {
    filteredProducts = searchProducts(filteredProducts, search);
  }

  // Extract tags from current filtered products (before tag filtering)
  const availableTags = extractTags(filteredProducts);

  // Apply tag filter
  filteredProducts = filterProductsByTags(filteredProducts, selectedTags);
 
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <FilterSyncer tags={availableTags} />
      <Header />
      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        <main className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              {categoryName || "Categoria"}
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

          {/* SEO Section for Categories */}
          {categoryName && categoryName !== "Todos os Produtos" && (
             <section className="bg-white p-6 rounded-lg shadow-sm mt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Comprar {categoryName} em Campinas e Região
                </h2>
                <div className="prose prose-sm text-gray-600 max-w-none">
                    <p>
                        Procurando por <strong>{categoryName}</strong> com o melhor preço de Campinas? No Balão da Informática você encontra uma seleção completa de {categoryName.toLowerCase()} das melhores marcas do mercado. Somos especialistas em hardware e periféricos, oferecendo garantia e suporte técnico especializado.
                    </p>
                    <p className="mt-2">
                        Atendemos toda a Região Metropolitana de Campinas (RMC). Compre online e receba com rapidez em <strong>Sumaré, Hortolândia, Paulínia, Valinhos, Vinhedo e Indaiatuba</strong>. Se preferir, retire seu produto em nossa loja física.
                    </p>
                    <p className="mt-2">
                        Não sabe qual {categoryName.toLowerCase()} escolher? Nossa equipe pode te ajudar a montar o setup ideal para suas necessidades, seja para PC Gamer, estação de trabalho ou uso doméstico. Aproveite nossas promoções de <strong>{categoryName}</strong> e faça um upgrade no seu computador hoje mesmo.
                    </p>
                </div>
             </section>
          )}
        </main>
      </div>
    </div>
  );
}
