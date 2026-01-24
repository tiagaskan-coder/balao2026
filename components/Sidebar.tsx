"use client";

import { useState } from "react";
import Link from "next/link";
import { Category, buildCategoryTree } from "@/lib/utils";
import { Menu, ChevronRight, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";

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

  const CategoryItem = ({ node, level }: { node: Category, level: number }) => {
     const hasChildren = node.children && node.children.length > 0;
     const isExpanded = expanded[node.id];
     // We use name for compatibility with existing simple string matching in page.tsx
     // Ideally this should use slug, but the product filter logic needs to be updated first.
     const isSelected = currentCategory === node.name;

     return (
       <div className="w-full">
         <div 
            className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors cursor-pointer
                ${isSelected ? 'text-[#E60012] font-medium bg-red-50' : 'text-gray-600 hover:bg-gray-50 hover:text-[#E60012]'}
            `}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
         >
            <Link href={`/?category=${encodeURIComponent(node.name)}`} className="flex-1 truncate block">
               {node.name}
            </Link>
            
            {hasChildren && (
                <button 
                    onClick={(e) => toggleExpand(node.id, e)}
                    className="p-1 hover:bg-gray-200 rounded-full ml-1 text-gray-400"
                >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
            )}
         </div>
         
         {hasChildren && isExpanded && (
            <div className="border-l border-gray-100 ml-4">
                {node.children!.map(child => (
                    <CategoryItem key={child.id} node={child} level={level + 1} />
                ))}
            </div>
         )}
       </div>
     );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block min-h-screen">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6 text-[#E60012]">
            <Menu size={24} />
            <h2 className="font-bold text-lg">Departamentos</h2>
        </div>
        <nav className="space-y-1">
          <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors border-l-2 border-transparent 
                ${!currentCategory || currentCategory === "Todos os Produtos" ? 'text-[#E60012] bg-red-50 font-medium' : 'text-gray-600 hover:text-[#E60012]'}
              `}
          >
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
