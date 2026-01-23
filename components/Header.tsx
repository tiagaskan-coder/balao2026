"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [logoClicks, setLogoClicks] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 5) {
      router.push("/admin");
      setLogoClicks(0);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery === "56676009") {
      router.push("/admin");
    } else {
      // Basic search param redirection
      if (searchQuery.trim()) {
        router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div 
          onClick={handleLogoClick}
          className="cursor-pointer select-none flex-shrink-0"
          title="Clique 5 vezes para acesso administrativo"
        >
             <div className="relative w-[180px] h-[60px]">
                {/* @ts-expect-error Next.js 16/React 19 type mismatch workaround */}
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
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative hidden md:block">
          <input
            type="text"
            placeholder="Buscar produtos..."
            className="w-full pl-5 pr-12 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:border-[#E60012] focus:ring-1 focus:ring-[#E60012] bg-gray-50 text-gray-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E60012] text-white p-1.5 rounded-full hover:bg-red-700 transition-colors">
            <Search size={18} />
          </button>
        </form>

        {/* Mobile Search Icon (visible only on small screens) */}
        <button className="md:hidden text-gray-600">
             <Search size={24} />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2 cursor-pointer hover:text-[#E60012] transition-colors">
                <div className="bg-green-500 text-white p-1.5 rounded-full">
                     {/* WhatsApp Icon placeholder or Lucide MessageCircle */}
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </div>
            </div>

          <Link href="/login" className="flex items-center gap-2 hover:text-[#E60012] transition-colors">
            <User size={24} />
            <div className="hidden lg:flex flex-col text-xs leading-tight">
                <span>Bem-vindo,</span>
                <span className="font-bold">Entrar</span>
            </div>
          </Link>
          <Link href="/cart" className="relative hover:text-[#E60012] transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#E60012] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
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
