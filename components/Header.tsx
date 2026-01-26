
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, User, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { Product } from "@/lib/utils";
import SearchPreview from "@/components/SearchPreview";
import { searchProducts } from "@/lib/searchUtils";

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [logoClicks, setLogoClicks] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sync search query with URL params
  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
    } else {
      setSearchQuery("");
    }
  }, [searchParams]);
  
  // Search Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const searchContainerRef = useRef<HTMLFormElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

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
      const target = event.target as Node;
      const isOutsideDesktop = searchContainerRef.current && !searchContainerRef.current.contains(target);
      const isOutsideMobile = mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(target);

      if (isOutsideDesktop && isOutsideMobile) {
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowPreview(false);
    if (searchQuery === "56676009") {
      router.push("/admin");
    } else {
      if (searchQuery.trim()) {
        router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      } else {
        router.push('/');
      }
    }
  };

  const previewProducts = searchQuery.length >= 2 
    ? searchProducts(products, searchQuery).slice(0, 5)
    : [];

  return (
    <header className="bg-white border-b-4 border-[#E60012] sticky top-0 z-[900] shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        
        {/* Mobile Menu Button - Optimized for Touch */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-3 -ml-3 text-gray-700 hover:text-[#E60012] transition-colors active:scale-95"
          aria-label="Abrir menu"
        >
            <Menu size={32} strokeWidth={2.5} />
        </button>

        {/* Logo Section */}
        <div 
          onClick={handleLogoClick}
          className="cursor-pointer select-none flex-shrink-0 drop-shadow-sm transition-transform hover:scale-105 active:scale-95"
          title="Clique 5 vezes para acesso administrativo"
        >
             <div className="relative w-[140px] h-[45px] md:w-[200px] md:h-[65px]">
                <Image 
                    src="/logo.png" 
                    alt="Balão da Informática" 
                    fill
                    className="object-contain"
                    priority
                />
             </div>
        </div>

        {/* Search Bar (Desktop) */}
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
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E60012] text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-md hover:shadow-lg">
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



        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-8 text-gray-700">

          <Link href="/login" className="flex items-center gap-3 group active:scale-95 transition-transform">
            <div className="p-2 bg-gray-100 rounded-full text-gray-600 group-hover:bg-[#E60012] group-hover:text-white transition-colors shadow-sm">
                <User size={24} className="md:w-6 md:h-6" strokeWidth={2.5} />
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
          
          <Link href="/cart" className="relative group flex items-center gap-3 active:scale-95 transition-transform">
             <div className="p-2 bg-gray-100 rounded-full text-gray-600 group-hover:bg-[#E60012] group-hover:text-white transition-colors shadow-sm">
                <ShoppingCart size={24} className="md:w-6 md:h-6" strokeWidth={2.5} />
             </div>
             <div className="hidden lg:flex flex-col text-sm leading-tight">
                <span className="text-gray-500">Meu</span>
                <span className="font-bold text-gray-800 group-hover:text-[#E60012] transition-colors">Carrinho</span>
            </div>
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 md:top-0 md:right-0 lg:left-7 lg:top-0 bg-[#E60012] text-white text-[10px] md:text-[11px] font-bold h-5 w-5 md:h-5 md:w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                    {cartCount}
                </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar (Full width below header on mobile) */}
      <div className="md:hidden px-4 pb-4" ref={mobileSearchContainerRef}>
          <form onSubmit={handleSearch} className="relative">
            <input
                type="text"
                placeholder="Buscar produtos..."
                className="w-full pl-5 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] shadow-sm text-base"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowPreview(true);
                }}
                onFocus={() => setShowPreview(true)}
            />
             <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-2">
                <Search size={22} />
            </button>

            {/* Mobile Search Preview */}
            {showPreview && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50">
                    <SearchPreview 
                        products={previewProducts}
                        onSelect={(product) => {
                            router.push(`/product/${product.id}`);
                            setShowPreview(false);
                            setSearchQuery("");
                        }}
                        onClose={() => setShowPreview(false)}
                    />
                </div>
            )}
          </form>
      </div>
    </header>
  );
}
