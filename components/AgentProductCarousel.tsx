'use client';

// Required Dependencies:
// npm install framer-motion next react

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

export default function AgentProductCarousel({ products }: { products: Product[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 w-full max-w-sm md:max-w-md pointer-events-none">
      <div className="flex overflow-x-auto gap-4 p-4 snap-x pointer-events-auto scrollbar-hide">
        <AnimatePresence>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="min-w-[200px] w-[200px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden snap-center flex-shrink-0"
            >
              <div className="relative h-32 w-full bg-gray-100">
                {product.image_url ? (
                  <Image 
                    src={product.image_url} 
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    Sem imagem
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 h-8 leading-tight">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-blue-600 mt-1">
                  R$ {product.price?.toFixed(2)}
                </p>
                <a 
                    href={`/product/${product.id}`}
                    className="block mt-2 text-center text-xs bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition-colors"
                >
                    Ver Detalhes
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
