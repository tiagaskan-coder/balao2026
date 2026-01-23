import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/db";

// Remove force-dynamic to allow better caching and prevent 500s on timeout. 
// Next.js will revalidate data every 60 seconds.
export const revalidate = 60;

export default async function Home(props: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const products = await getProducts(); // Added await
  
  const category = searchParams.category;
  const search = searchParams.search;

  const filteredProducts = products.filter(p => {
    if (category && category !== "Todos os Produtos" && p.category !== category) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <div className="flex container mx-auto flex-1 py-6 gap-6">
        <Sidebar />
        <main className="flex-1 w-full">
            {/* Banner Placeholder */}
            {!search && !category && (
                <div className="mb-6 px-4 lg:px-0">
                    <div className="w-full h-48 md:h-64 bg-gradient-to-r from-[#E60012] to-red-800 rounded-lg flex items-center justify-center text-white text-3xl font-bold shadow-md">
                        Ofertas Imperdíveis
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-4 px-4 lg:px-0">
                <h1 className="text-xl font-bold text-gray-800">
                    {category || (search ? `Resultados para: "${search}"` : "Destaques")}
                </h1>
                <span className="text-sm text-gray-500">{filteredProducts.length} produtos</span>
            </div>

          {filteredProducts.length === 0 ? (
             <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm mx-4 lg:mx-0">
                <p className="text-xl font-medium">Nenhum produto encontrado.</p>
                {products.length === 0 && (
                    <p className="mt-4 text-sm bg-blue-50 text-blue-700 inline-block px-4 py-2 rounded-md">
                        Dica: Configure as chaves do Supabase no .env.local e acesse a área administrativa.
                    </p>
                )}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 px-4 lg:px-0 pb-10">
                {filteredProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
