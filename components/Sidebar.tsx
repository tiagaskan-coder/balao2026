"use client";

import { useState } from "react";
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

export default function Sidebar({ categories }: { categories: Category[] }) {
  const tree = buildCategoryTree(categories);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block min-h-screen shrink-0">
      <div className="py-6 pr-2">
        <div className="flex items-center gap-3 px-4 mb-6 text-[#E60012]">
            <Menu size={24} />
            <h2 className="font-bold text-lg uppercase tracking-wide">Departamentos</h2>
        </div>
        <nav className="space-y-0.5">
          <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors border-l-[3px]
                ${!currentCategory || currentCategory === "Todos os Produtos" 
                    ? 'border-[#E60012] text-[#E60012] bg-red-50 font-medium' 
                    : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-[#E60012]'}
              `}
          >
              <List size={18} className="text-gray-400" />
              Todos os Produtos
          </Link>
          
          {tree.map(node => (
            <CategoryItem key={node.id} node={node} level={0} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
