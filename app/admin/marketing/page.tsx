"use client";

import MarketingManager from "@/components/admin/MarketingManager";
import { Mail } from "lucide-react";

export default function MarketingPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Mail className="text-[#E60012]" />
          Marketing & E-mail
        </h2>
      </div>
      <MarketingManager />
    </div>
  );
}
