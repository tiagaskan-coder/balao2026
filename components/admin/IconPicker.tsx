"use client";

import React, { useState } from "react";
import { 
  Monitor, Smartphone, Gamepad, Speaker, Tv, Wifi, Printer, Home, Plug, HardDrive, 
  Briefcase, Shield, List, Laptop, Cpu, Keyboard, Mouse, Watch, Tablet, Headphones, 
  Camera, Tag, Wrench, Handshake, ShoppingCart, CreditCard, Gift, Truck, User, Settings,
  Search, X
} from "lucide-react";

export const ICON_LIST = [
  { name: "Monitor", icon: Monitor },
  { name: "Smartphone", icon: Smartphone },
  { name: "Gamepad", icon: Gamepad },
  { name: "Speaker", icon: Speaker },
  { name: "Tv", icon: Tv },
  { name: "Wifi", icon: Wifi },
  { name: "Printer", icon: Printer },
  { name: "Home", icon: Home },
  { name: "Plug", icon: Plug },
  { name: "HardDrive", icon: HardDrive },
  { name: "Briefcase", icon: Briefcase },
  { name: "Shield", icon: Shield },
  { name: "List", icon: List },
  { name: "Laptop", icon: Laptop },
  { name: "Cpu", icon: Cpu },
  { name: "Keyboard", icon: Keyboard },
  { name: "Mouse", icon: Mouse },
  { name: "Watch", icon: Watch },
  { name: "Tablet", icon: Tablet },
  { name: "Headphones", icon: Headphones },
  { name: "Camera", icon: Camera },
  { name: "Tag", icon: Tag },
  { name: "Wrench", icon: Wrench },
  { name: "Handshake", icon: Handshake },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "CreditCard", icon: CreditCard },
  { name: "Gift", icon: Gift },
  { name: "Truck", icon: Truck },
  { name: "User", icon: User },
  { name: "Settings", icon: Settings },
];

interface IconPickerProps {
  selectedIcon: string | null;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

export default function IconPicker({ selectedIcon, onSelect, onClose }: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = ICON_LIST.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col max-h-80">
      <div className="p-3 border-b border-gray-100 flex items-center gap-2 sticky top-0 bg-white rounded-t-lg z-10">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ícone..."
            className="w-full pl-7 pr-2 py-1 text-sm border rounded bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-5 gap-1">
        {filteredIcons.map(({ name, icon: Icon }) => (
          <button
            key={name}
            onClick={() => {
              onSelect(name);
              onClose();
            }}
            className={`p-2 rounded hover:bg-gray-100 flex flex-col items-center justify-center gap-1 title-md ${selectedIcon === name ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-600'}`}
            title={name}
          >
            <Icon size={20} />
          </button>
        ))}
        {filteredIcons.length === 0 && (
          <div className="col-span-5 text-center py-4 text-xs text-gray-400">
            Nenhum ícone encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
