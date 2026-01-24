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
            <Link 
                href={`/?category=${encodeURIComponent(node.name)}`} 
                className="flex-1 flex items-center gap-3 truncate"
                onClick={closeSidebar}
            >
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
    <>
        {/* Mobile Overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                onClick={closeSidebar}
            />
        )}

        {/* Sidebar Container */}
        <aside className={`
            bg-white rounded-lg shadow-md border border-gray-100 flex-shrink-0 flex flex-col
            lg:w-64 lg:static lg:block lg:h-fit
            fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <List size={20} className="text-[#E60012]" />
                    <span>Categorias</span>
                </div>
                <button 
                    onClick={closeSidebar}
                    className="lg:hidden text-gray-500 hover:text-red-600"
                >
                    <X size={20} />
                </button>
            </div>
            
            <div className="py-2 overflow-y-auto max-h-[calc(100vh-60px)] lg:max-h-none custom-scrollbar">
                {tree.map(node => (
                    <CategoryItem key={node.id} node={node} level={0} />
                ))}
            </div>
        </aside>
    </>
  );
}
