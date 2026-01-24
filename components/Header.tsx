
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Product } from "@/lib/utils";
import SearchPreview from "@/components/SearchPreview";

export default function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [logoClicks, setLogoClicks] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Search Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const searchContainerRef = useRef<HTMLFormElement>(null);

  // Fetch products for client-side search preview
  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to load products for search", err));
  }, []);

  // Handle click outside to close preview
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowPreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 5) {
      router.push("/admin");
      setLogoClicks(0);
    } else {
      router.push("/");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPreview(false);
    if (searchQuery === "56676009") {
      router.push("/admin");
    } else {
      // Basic search param redirection
      if (searchQuery.trim()) {
        router.push(`/?search=${encodeURIComponent(searchQuery)}`);
        setSearchQuery(""); // Clear input after search
      }
    }
  };

  const previewProducts = searchQuery.length >= 2 
    ? products
        .filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <header className="bg-white border-b-4 border-[#E60012] sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-6">
        {/* Logo Section */}
        <div 
          onClick={handleLogoClick}
          className="cursor-pointer select-none flex-shrink-0 drop-shadow-sm transition-transform hover:scale-105"
          title="Clique 5 vezes para acesso administrativo"
        >
             <div className="relative w-[200px] h-[65px]">
                <Image 
                    src="/logo.png" 
                    alt="Balão da Informática" 
                    fill
                    className="object-contain"
                    priority
                />
             </div>
        </div>

        {/* Search Bar */}
        <form 
            ref={searchContainerRef}
            onSubmit={handleSearch} 
            className="flex-1 max-w-3xl relative hidden md:block"
        >
          <div className="relative group">
            <input
                type="text"
                placeholder="O que você procura hoje?"
                className="w-full pl-6 pr-14 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-[#E60012] focus:ring-0 bg-gray-50 text-gray-800 placeholder-gray-400 text-base shadow-inner transition-all group-hover:border-gray-300"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowPreview(true);
                }}
                onFocus={() => setShowPreview(true)}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E60012] text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
                <Search size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Search Preview */}
          {showPreview && searchQuery.length >= 2 && (
              <SearchPreview 
                  products={previewProducts}
                  onSelect={(product) => {
                      router.push(`/product/${product.id}`);
                      setShowPreview(false);
                      setSearchQuery("");
                  }}
                  onClose={() => setShowPreview(false)}
              />
          )}
        </form>

        {/* Mobile Search Icon (visible only on small screens) */}
        <button className="md:hidden text-[#E60012]">
             <Search size={28} strokeWidth={2.5} />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-8 text-gray-700">
            <a href="https://wa.me/5519987510267" target="_blank" className="hidden xl:flex items-center gap-3 cursor-pointer group" title="Fale no WhatsApp">
                <div className="bg-green-500 text-white p-2 rounded-full shadow-md group-hover:bg-green-600 group-hover:shadow-lg transition-all transform group-hover:-translate-y-0.5">
                     <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </div>
                <div className="flex flex-col leading-tight">
                    <span className="text-xs font-medium text-gray-500">Atendimento</span>
                    <span className="text-sm font-bold text-green-600 group-hover:text-green-700">WhatsApp</span>
                </div>
            </a>

          <Link href="/login" className="flex items-center gap-3 group">
            <div className="p-2 bg-gray-100 rounded-full text-gray-600 group-hover:bg-[#E60012] group-hover:text-white transition-colors shadow-sm">
                <User size={24} strokeWidth={2.5} />
            </div>
            <div className="hidden lg:flex flex-col text-sm leading-tight">
                <span className="text-gray-500">
                  {user ? "Olá, " + (user.email?.split('@')[0] || "Visitante") : "Bem-vindo,"}
                </span>
                <span className="font-bold text-gray-800 group-hover:text-[#E60012] transition-colors">
                  {user ? "Minha Conta" : "Entrar"}
                </span>
            </div>
          </Link>
          
          <Link href="/cart" className="relative group flex items-center gap-3">
             <div className="p-2 bg-gray-100 rounded-full text-gray-600 group-hover:bg-[#E60012] group-hover:text-white transition-colors shadow-sm">
                <ShoppingCart size={24} strokeWidth={2.5} />
             </div>
             <div className="hidden lg:flex flex-col text-sm leading-tight">
                <span className="text-gray-500">Meu</span>
                <span className="font-bold text-gray-800 group-hover:text-[#E60012] transition-colors">Carrinho</span>
            </div>
            {cartCount > 0 && (
                <span className="absolute top-0 right-0 lg:left-7 lg:top-0 bg-[#E60012] text-white text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartCount}
                </span>
            )}
          </Link>
        </div>
      </div>
      
      {/* Mobile Search Bar (Full width below header on mobile) */}
      <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#E60012]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
             <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
            </button>
          </form>
      </div>
    </header>
  );
}
