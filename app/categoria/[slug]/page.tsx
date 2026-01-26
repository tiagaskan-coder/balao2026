import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductList from "@/components/ProductList";
import { getProducts, getCategories } from "@/lib/db";
import { searchProducts } from "@/lib/searchUtils";
import type { Category } from "@/lib/utils";
 
export const dynamic = "force-dynamic";
 
export default async function CategoriaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: { search?: string };
}) {
  const { slug } = await params;
  const search = searchParams?.search;
 
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
 
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        <div className="hidden lg:block">
          <Sidebar categories={categories} />
        </div>
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
        </main>
      </div>
    </div>
  );
}
