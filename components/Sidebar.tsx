import Link from "next/link";
import { CATEGORIES } from "@/lib/utils";
import { Menu } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block min-h-screen">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6 text-[#E60012]">
            <Menu size={24} />
            <h2 className="font-bold text-lg">Departamentos</h2>
        </div>
        <nav className="space-y-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/?category=${encodeURIComponent(cat)}`}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-[#E60012] rounded-md transition-colors border-l-2 border-transparent hover:border-[#E60012]"
            >
              {/* Could add specific icons per category here if needed */}
              {cat}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
