"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Category, buildCategoryTree } from "@/lib/utils";
import { 
  Menu, ChevronRight, ChevronDown, 
  Monitor, Smartphone, Gamepad, Speaker, Tv, Wifi, Printer, Home, Plug, HardDrive, Briefcase, Shield, List,
  Laptop, Cpu, Keyboard, Mouse, Watch, Tablet, Headphones, Camera,
  Tag, Wrench, Handshake,
  Lock, Ghost, Key, Armchair, Square, Disc, Mic, Cable, RefreshCcw, Usb, Backpack, Lightbulb, Zap, Video, Bell, Radio, Power, ToggleLeft, User, Star, Smile, Shirt, Coffee, Image, Gift, FileText, PenTool, Table, Move, CreditCard, Copy, Droplet, Cylinder, Scan, Gamepad2, Box, Server, Book, Feather, Aperture, CircuitBoard, MemoryStick, Fan, Network, Battery
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { X } from "lucide-react";

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
  "Câmeras": Camera,
  // Added mappings for seed data
  "Laptop": Laptop,
  "Cpu": Cpu,
  "Keyboard": Keyboard,
  "Mouse": Mouse,
  "Headphones": Headphones,
  "Watch": Watch,
  "Tablet": Tablet,
  "Camera": Camera,
  "Lock": Lock,
  "Ghost": Ghost,
  "Key": Key,
  "Armchair": Armchair,
  "Square": Square,
  "Disc": Disc,
  "Mic": Mic,
  "Cable": Cable,
  "RefreshCcw": RefreshCcw,
  "Usb": Usb,
  "Backpack": Backpack,
  "Lightbulb": Lightbulb,
  "Zap": Zap,
  "Video": Video,
  "Bell": Bell,
  "Radio": Radio,
  "Power": Power,
  "ToggleLeft": ToggleLeft,
  "User": User,
  "Star": Star,
  "Smile": Smile,
  "Shirt": Shirt,
  "Coffee": Coffee,
  "Image": Image,
  "Gift": Gift,
  "FileText": FileText,
  "PenTool": PenTool,
  "Table": Table,
  "Move": Move,
  "CreditCard": CreditCard,
  "Copy": Copy,
  "Droplet": Droplet,
  "Cylinder": Cylinder,
  "Scan": Scan,
  "Gamepad2": Gamepad2,
  "Box": Box,
  "Server": Server,
  "Book": Book,
  "Feather": Feather,
  "Aperture": Aperture,
  "CircuitBoard": CircuitBoard,
  "MemoryStick": MemoryStick,
  "Fan": Fan,
  "Network": Network,
  "Battery": Battery
};

export default function Sidebar({ categories, mobileOnly = false }: { categories: Category[], mobileOnly?: boolean }) {
  const tree = buildCategoryTree(categories);
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const { isOpen, closeSidebar } = useSidebar();

  // Custom tool item
  const monteSeuPcItem = {
    name: "Monte seu PC",
    slug: "monteseupc",
    icon: Wrench,
    href: "/monteseupc"
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev: Record<string, boolean>) => ({ ...prev, [id]: !prev[id] }));
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
                    onClick={(e: React.MouseEvent) => toggleExpand(node.id, e)}
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
                className="fixed inset-0 bg-black/50 z-[990] lg:hidden transition-opacity"
                onClick={closeSidebar}
            />
        )}

        {/* Sidebar Container */}
        <aside className={`
            bg-white rounded-lg shadow-md border border-gray-100 flex-shrink-0 flex flex-col
            fixed inset-y-0 left-0 z-[1000] w-[280px] transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            ${mobileOnly ? 'lg:hidden' : 'lg:w-64 lg:static lg:block lg:h-fit lg:translate-x-0'}
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
                {/* Monte seu PC - Prominent Link */}
                <Link 
                    href={monteSeuPcItem.href}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-[#E60012] bg-red-50 hover:bg-red-100 transition-colors mb-2 border-l-[3px] border-[#E60012]"
                    onClick={closeSidebar}
                >
                    <span className="text-[#E60012]"><monteSeuPcItem.icon size={18} /></span>
                    <span>{monteSeuPcItem.name}</span>
                </Link>
                <div className="h-px bg-gray-100 mx-3 mb-2"></div>

                {tree.map(node => (
                    <CategoryItem key={node.id} node={node} level={0} />
                ))}

                {/* Custom Links */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Serviços e Ofertas
                    </div>
                    
                    <Link 
                        href="/?category=PC%20Gamer" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Gamepad size={18} /></span>
                        <span>PC Gamer</span>
                    </Link>

                    <Link 
                        href="/?category=Notebooks" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Laptop size={18} /></span>
                        <span>Notebooks</span>
                    </Link>

                    <Link 
                        href="/?search=promo%C3%A7%C3%A3o" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Tag size={18} /></span>
                        <span>Promoção</span>
                    </Link>

                    <Link 
                        href="/?search=manuten%C3%A7%C3%A3o" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Wrench size={18} /></span>
                        <span>Manutenção</span>
                    </Link>

                    <Link 
                        href="/?search=consigna%C3%A7%C3%A3o" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-[#E60012] transition-colors pl-[12px] border-l-[3px] border-transparent hover:border-l-[#E60012]"
                        onClick={closeSidebar}
                    >
                        <span className="text-gray-400"><Handshake size={18} /></span>
                        <span>Consignação</span>
                    </Link>
                </div>
            </div>
        </aside>
    </>
  );
}
