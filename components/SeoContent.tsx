"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode } from "react";

interface SeoContentProps {
  title: string;
  children: ReactNode;
}

export default function SeoContent({ title, children }: SeoContentProps) {
  return (
    <section className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <h2 className="text-lg font-bold text-gray-800 m-0">{title}</h2>
            <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <div className="mt-4 px-4 prose prose-blue max-w-none animate-in fade-in slide-in-from-top-2 duration-300">
            {children}
          </div>
        </details>
      </div>
    </section>
  );
}
