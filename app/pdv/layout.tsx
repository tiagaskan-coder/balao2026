"use client";

import React from "react";
import { PdvProvider } from "./store";
import { LogOut, User } from "lucide-react";

export default function PdvLayout({ children }: { children: React.ReactNode }) {
  return (
    <PdvProvider>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans antialiased">
        <header className="bg-red-600 px-6 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded shadow-sm">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src="/logo.png" alt="Balão da Informática" className="h-8 w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white leading-tight">
                PDV <span className="opacity-80 font-normal">Balão</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-[10px] text-white/90 uppercase font-medium tracking-wide">Sistema Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <User size={16} />
              <span className="text-sm font-medium">Operador: <strong>Admin</strong></span>
            </div>
            <button className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center gap-2" title="Sair do PDV">
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <main className="p-4 md:p-6 max-w-[1920px] mx-auto h-[calc(100vh-64px)] overflow-hidden">
          {children}
        </main>
      </div>
    </PdvProvider>
  );
}
