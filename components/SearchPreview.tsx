import Image from "next/image";
import { Product } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SearchPreviewProps {
  products: Product[];
  onSelect: (product: Product) => void;
  onClose: () => void;
}

export default function SearchPreview({ products, onSelect, onClose }: SearchPreviewProps) {
  if (products.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
      <div className="max-h-[400px] overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onSelect(product)}
            className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
          >
            <div className="relative w-12 h-12 flex-shrink-0 bg-white rounded-md border border-gray-100 p-1">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-800 truncate group-hover:text-[#E60012] transition-colors">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{product.category}</span>
                <span className="text-xs font-bold text-[#E60012]">{product.price}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-[#E60012]" />
          </div>
        ))}
      </div>
      <div className="bg-gray-50 p-2 text-xs text-center text-gray-500 border-t border-gray-100 flex items-center justify-center gap-1">
        Pressione <kbd className="font-sans px-1 py-0.5 bg-white border rounded text-[10px]">Enter</kbd> para ver todos os resultados
      </div>
    </div>
  );
}
