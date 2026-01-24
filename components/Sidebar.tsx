"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Category, buildCategoryTree } from "@/lib/utils";
import { 
  Menu, ChevronRight, ChevronDown, 
  Monitor, Smartphone, Gamepad, Speaker, Tv, Wifi, Printer, Home, Plug, HardDrive, Briefcase, Shield, List,
  Laptop, Cpu, Keyboard, Mouse, Watch, Tablet, Headphones, Camera
} from "lucide-react";
import { useSearchParams } from "next/navigation";

// Icon mapping
const iconMap: Record<string, any> = {
  "Monitor": Monitor,
  "Smartphone": Smartphone,
  "Gamepad": Gamepad,
  "Speaker": Speaker,
  "Tv": Tv,
  "Wifi": Wifi,
  "Printer": Printer,
  "Home": Home,
  "Plug": Plug,
  "HardDrive": HardDrive,
  "Briefcase": Briefcase,
  "Shield": Shield,
  "List": List,
  "Apple": Laptop, // Fallback for Apple
  "Notebooks": Laptop,
  "Computadores": Monitor,
  "Hardware": Cpu,
  "Acessórios": Keyboard,
  "Smartwatches": Watch,
  "Tablets": Tablet,
  "Fones": Headphones,
  "Câmeras": Camera
};

export default function Sidebar({ 
  categories,
  brands = [],
  selectedBrands = [],
  onBrandToggle,
  priceRange = [0, 10000],
  minMaxPrice = [0, 10000],
  onPriceChange
}: { 
  categories: Category[];
  brands?: string[];
  selectedBrands?: string[];
  onBrandToggle?: (brand: string) => void;
  priceRange?: [number, number];
  minMaxPrice?: [number, number];
  onPriceChange?: (min: number, max: number) => void;
}) {
  const tree = buildCategoryTree(categories);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // Local state for price inputs to avoid excessive re-renders/updates
  const [localMin, setLocalMin] = useState(priceRange[0]);
  const [localMax, setLocalMax] = useState(priceRange[1]);

  useEffect(() => {
    setLocalMin(priceRange[0]);
    setLocalMax(priceRange[1]);
  }, [priceRange]);

  const handlePriceBlur = () => {
    if (onPriceChange) {
        let newMin = Math.max(minMaxPrice[0], localMin);
        let newMax = Math.min(minMaxPrice[1], localMax);
        
        if (newMin > newMax) newMin = newMax;
        
        onPriceChange(newMin, newMax);
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName] || iconMap[Object.keys(iconMap).find(k => iconName.includes(k)) || ""] || null;
    return IconComponent ? <IconComponent size={18} /> : null;
  };

  const CategoryItem = ({ node, level }: { node: Category, level: number }) => {
     const hasChildren = node.children && node.children.length > 0;
     const isExpanded = expanded[node.id];
     const isSelected = currentCategory === node.name;
     const Icon = level === 0 ? getIcon(node.icon || node.name) : null;

     return (
       <div className="w-full">
         <div 
            className={`flex items-center justify-between px-3 py-2 text-sm transition-colors cursor-pointer select-none
                ${isSelected 
                    ? 'text-[#E60012] font-medium bg-red-50' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-[#E60012]'}
                ${level === 0 ? 'mb-1 font-medium' : 'font-normal'}
            `}
            style={{ 
                paddingLeft: level === 0 ? '12px' : `${level * 16 + 12}px`,
                borderLeft: isSelected ? '3px solid #E60012' : '3px solid transparent'
            }}
         >
            <Link href={`/?category=${encodeURIComponent(node.name)}`} className="flex-1 flex items-center gap-3 truncate">
               {Icon && <span className="text-gray-400">{Icon}</span>}
               <span>{node.name}</span>
            </Link>
            
            {hasChildren && (
                <button 
                    onClick={(e) => toggleExpand(node.id, e)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-400"
                >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
            )}
         </div>
         
         {hasChildren && isExpanded && (
            <div className="mt-1 mb-2">
                {node.children!.map(child => (
                    <CategoryItem key={child.id} node={child} level={level + 1} />
                ))}
            </div>
         )}
       </div>
     );
  };

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-gray-200 block min-h-screen shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.05)] pb-10">
      <div className="py-0 pr-0">
        <div className="bg-[#E60012] text-white px-5 py-4 mb-2 flex items-center gap-3 shadow-md">
            <Menu size={24} className="text-white" />
            <h2 className="font-bold text-lg uppercase tracking-wide text-white">Departamentos</h2>
        </div>
        <nav className="space-y-1 p-2">
          <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-3 text-sm transition-all border-l-[4px] rounded-r-md font-medium
                ${!currentCategory || currentCategory === "Todos os Produtos" 
                    ? 'border-[#E60012] text-[#E60012] bg-red-50 shadow-sm' 
                    : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-[#E60012] hover:border-gray-300'}
              `}
          >
              <List size={20} className={`${!currentCategory || currentCategory === "Todos os Produtos" ? "text-[#E60012]" : "text-gray-500"}`} />
              Todos os Produtos
          </Link>
          
          {tree.filter(node => node.name !== "Todos os Produtos").map(node => (
            <CategoryItem key={node.id} node={node} level={0} />
          ))}
        </nav>

        {/* FILTERS SECTION */}
        <div className="mt-8 px-4 border-t pt-6">
            <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm tracking-wider">Filtros</h3>
            
            {/* Price Filter */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Preço (R$)</h4>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        value={localMin}
                        onChange={(e) => setLocalMin(Number(e.target.value))}
                        onBlur={handlePriceBlur}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Mín"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        type="number" 
                        value={localMax}
                        onChange={(e) => setLocalMax(Number(e.target.value))}
                        onBlur={handlePriceBlur}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Máx"
                    />
                </div>
            </div>

            {/* Brand Filter */}
            {brands.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Marcas</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {brands.map(brand => (
                            <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer hover:text-[#E60012]">
                                <input 
                                    type="checkbox" 
                                    checked={selectedBrands.includes(brand)}
                                    onChange={() => onBrandToggle?.(brand)}
                                    className="rounded border-gray-300 text-[#E60012] focus:ring-[#E60012]"
                                />
                                <span className="truncate">{brand}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </aside>
  );
}
