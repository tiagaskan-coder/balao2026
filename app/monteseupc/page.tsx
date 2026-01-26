import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import PCBuilder from "@/src/components/PCBuilder";
import { getProducts, getCategories } from "@/lib/db";

// Revalidate data every 60 seconds
export const revalidate = 60;

export default async function MonteSeuPCPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <div className="flex container mx-auto flex-1 py-6 gap-6 px-4 lg:px-0">
        <div className="hidden lg:block">
            <Sidebar categories={categories} />
        </div>
        <main className="flex-1 w-full min-w-0">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Monte seu PC</h1>
                <p className="text-gray-600">
                    Ferramenta inteligente de compatibilidade. Escolha as peças e nós garantimos que elas funcionam juntas.
                </p>
            </div>
            
            <PCBuilder products={products} categories={categories} />
        </main>
      </div>
    </div>
  );
}
