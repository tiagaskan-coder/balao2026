"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { usePdv, PdvProduct } from "../store";

export default function ProductSearch() {
  const { dispatch } = usePdv();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PdvProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Falha na busca");
        const data = await res.json();
        
        // A API retorna array direto ou { products: [] }?
        // Pelo código lido de /api/search, retorna array direto.
        const list = Array.isArray(data) ? data : data.products || [];

        const mapped = list.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: typeof p.price === 'number' ? p.price : parseFloat(p.price?.toString().replace("R$", "").replace(/\./g, "").replace(",", ".") || "0"),
          image_url: p.images?.[0] || "/placeholder.png",
          stock: p.stock_quantity || 0
        }));
        setProducts(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleAdd = (product: PdvProduct) => {
    dispatch({ type: "ADD_TO_CART", payload: product });
    // Feedback visual opcional
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar produto (nome, código...)"
            className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex flex-col bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleAdd(product)}
              >
                <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden relative">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={product.image_url} alt={product.name} className="object-contain h-full w-full mix-blend-multiply" />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-2 flex-1" title={product.name}>{product.name}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-lg text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </span>
                  <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : query.length > 1 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="w-12 h-12 mb-4 text-gray-300" />
            <p>Nenhum produto encontrado para "{query}"</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Search className="w-12 h-12 mb-4 text-gray-200" />
            <p>Digite para buscar produtos...</p>
          </div>
        )}
      </div>
    </div>
  );
}
