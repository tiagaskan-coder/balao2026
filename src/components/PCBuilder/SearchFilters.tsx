import React from "react";
import { Search } from "lucide-react";

type Props = {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  placeholder: string;
};

export default function SearchFilters({ searchTerm, setSearchTerm, minPrice, maxPrice, setMinPrice, setMaxPrice, placeholder }: Props) {
  return (
    <>
      <div className="mt-4 relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none"
          aria-label="Buscar produto"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Preço mínimo"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none text-sm"
          aria-label="Preço mínimo"
        />
        <input
          type="text"
          placeholder="Preço máximo"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none text-sm"
          aria-label="Preço máximo"
        />
      </div>
    </>
  );
}
