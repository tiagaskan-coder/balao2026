import Header from "@/components/Header";
import StoreContainer from "@/components/StoreContainer";
import { getProducts, getCarouselImages, getCategories } from "@/lib/db";
import { Suspense } from "react";

// Remove force-dynamic to allow better caching and prevent 500s on timeout. 
// Next.js will revalidate data every 60 seconds.
export const revalidate = 60;

export default async function Home() {
  const [products, carouselImages, categories] = await Promise.all([
    getProducts(),
    getCarouselImages(true),
    getCategories()
  ]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <Suspense fallback={<div className="container mx-auto py-20 text-center">Carregando produtos...</div>}>
        <StoreContainer 
            initialProducts={products}
            categories={categories}
            carouselImages={carouselImages}
        />
      </Suspense>
    </div>
  );
}