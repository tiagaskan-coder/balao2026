"use client";

import React from "react";
import { PdvProvider } from "./store";

export default function PdvLayout({ children }: { children: React.ReactNode }) {
  return (
    <PdvProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-blue-600">
              Balão PDV <span className="text-xs font-normal text-gray-500 ml-2">v1.0</span>
            </h1>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
              Online
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Operador: <strong>Admin</strong></span>
            <button className="text-red-500 hover:text-red-700 font-medium">Sair</button>
          </div>
        </header>
        <main className="p-4 md:p-6 max-w-[1920px] mx-auto">
          {children}
        </main>
      </div>
    </PdvProvider>
  );
}
