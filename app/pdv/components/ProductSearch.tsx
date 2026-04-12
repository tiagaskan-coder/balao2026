"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, PackagePlus, X, Package } from "lucide-react";
import { usePdv, PdvProduct } from "../store";
import { supabase } from "@/lib/supabase";

// Dados mock para desenvolvimento local
const getMockProducts = (query: string) => {
  const mockProducts = [
    {
      id: '1',
      name: 'Mouse Gamer RGB',
      price: 89.90,
      images: ['mouse-gamer.jpg'],
      stock_quantity: 15
    },
    {
      id: '2', 
      name: 'Teclado Mecânico',
      price: 199.90,
      images: ['teclado-mecanico.jpg'],
      stock_quantity: 8
    },
    {
      id: '3',
      name: 'Headphone Bluetooth',
      price: 159.90,
      images: ['headphone-bt.jpg'],
      stock_quantity: 12
    },
    {
      id: '4',
      name: 'Monitor 24" LED',
      price: 699.90,
      images: ['monitor-24.jpg'],
      stock_quantity: 5
    },
    {
      id: '5',
      name: 'Webcam Full HD',
      price: 129.90,
      images: ['webcam-hd.jpg'],
      stock_quantity: 20
    }
  ];

  // Filtrar por query se houver
  return query 
    ? mockProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()))
    : mockProducts;
};

export default function ProductSearch() {
  const { dispatch } = usePdv();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PdvProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customItem, setCustomItem] = useState({ name: "", price: "" });

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setProducts([]);
        return;
      }
      setLoading(true);
      try {
        // Verificar se temos configuração do Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        let list: any[] = [];
        
        if (supabaseUrl && supabaseKey && !supabaseUrl.includes('seu-projeto') && !supabaseKey.includes('sua-chave')) {
          // Conexão real com Supabase
          const { data: supabaseData, error } = await supabase
            .from('products')
            .select('*')
            .ilike('name', `%${query}%`)
            .limit(20);

          if (error) throw error;
          list = supabaseData || [];
        } else {
          // Fallback para API route (desenvolvimento local)
          const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (!res.ok) throw new Error("Falha na busca");
          const data = await res.json();
          list = Array.isArray(data) ? data : data.products || [];
        }

        const mapped = list.map((p: any) => {
          // Tratamento de imagem - correção para diferentes formatos de imagem
          let imageUrl = "/placeholder.png";
          
          // Função para construir URL do Supabase
          const buildSupabaseUrl = (filename: string) => {
            if (!filename) return "/placeholder.png";
            if (filename.startsWith("http")) return filename;
            
            // Remove qualquer prefixo de bucket se existir
            const cleanFilename = filename.replace(/^products\//, '');
            
            // Para desenvolvimento local, usar URL padrão do Supabase
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seu-projeto.supabase.co';
            return `${supabaseUrl}/storage/v1/object/public/products/${cleanFilename}`;
          };

          // Prioridade 1: Campo images (pode ser array ou string)
          if (p.images) {
            if (Array.isArray(p.images) && p.images.length > 0) {
              const firstImg = p.images[0];
              imageUrl = buildSupabaseUrl(firstImg);
            } else if (typeof p.images === 'string') {
              if (p.images.startsWith('[')) {
                // Tentar parsear como JSON array
                try {
                  const imagesArray = JSON.parse(p.images);
                  if (imagesArray.length > 0) {
                    imageUrl = buildSupabaseUrl(imagesArray[0]);
                  }
                } catch {
                  // Se falhar o parse, tratar como string simples
                  imageUrl = buildSupabaseUrl(p.images);
                }
              } else {
                // String simples
                imageUrl = buildSupabaseUrl(p.images);
              }
            }
          }
          // Prioridade 2: Campo image_url
          else if (p.image_url) {
            imageUrl = buildSupabaseUrl(p.image_url);
          }
          // Prioridade 3: Campo image (caso exista)
          else if (p.image) {
            imageUrl = buildSupabaseUrl(p.image);
          }

          return {
            id: p.id,
            name: p.name,
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price?.toString().replace("R$", "").replace(/\./g, "").replace(",", ".") || "0"),
            image_url: imageUrl,
            stock: p.stock_quantity || 0
          };
        });
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
  };

  const handleAddCustom = () => {
    if (!customItem.name || !customItem.price) return;
    const price = parseFloat(customItem.price.replace(",", "."));
    if (isNaN(price)) return;

    const product: PdvProduct = {
      id: `custom-${Date.now()}`,
      name: customItem.name,
      price: price,
      image_url: "/placeholder.png",
      stock: 999
    };
    
    dispatch({ type: "ADD_TO_CART", payload: product });
    setCustomItem({ name: "", price: "" });
    setShowCustomModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
      <div className="p-4 border-b border-gray-200 bg-red-600 flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar produto (nome, código...)"
            className="w-full pl-10 pr-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-white/50 outline-none text-lg shadow-sm"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <button 
          onClick={() => setShowCustomModal(true)}
          className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-md transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
        >
          <PackagePlus size={20} />
          <span className="hidden md:inline">Item Avulso</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex flex-col bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-shadow cursor-pointer group hover:border-red-200"
                onClick={() => handleAdd(product)}
              >
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-3 flex items-center justify-center overflow-hidden relative">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img 
                     src={product.image_url} 
                     alt={product.name} 
                     className="object-contain h-full w-full mix-blend-multiply transition-all duration-300 group-hover:scale-105" 
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.src = '/placeholder.png';
                       target.classList.remove('mix-blend-multiply');
                       target.classList.add('opacity-50');
                     }}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   {product.image_url === '/placeholder.png' && (
                     <Package className="absolute w-8 h-8 text-gray-400" />
                   )}
                </div>
                <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-2 flex-1 group-hover:text-red-600 transition-colors" title={product.name}>{product.name}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-lg text-red-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                  </span>
                  <button className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : query.length > 1 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>Nenhum produto encontrado para "{query}"</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
            <Search size={64} className="mb-4 text-gray-300" />
            <p className="text-xl font-light">Digite para buscar produtos...</p>
          </div>
        )}
      </div>

      {/* Modal Item Avulso */}
      {showCustomModal && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Adicionar Item Avulso</h3>
              <button onClick={() => setShowCustomModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Item</label>
                <input
                  type="text"
                  value={customItem.name}
                  onChange={(e) => setCustomItem({...customItem, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Formatação de PC"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={customItem.price}
                  onChange={(e) => setCustomItem({...customItem, price: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="0,00"
                />
              </div>
              <button
                onClick={handleAddCustom}
                disabled={!customItem.name || !customItem.price}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
