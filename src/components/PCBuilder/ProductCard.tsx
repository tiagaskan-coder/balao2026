import React from "react";
import Image from "next/image";
import { Box, Check, AlertCircle } from "lucide-react";
import { TechProduct, CompatibilityStatus } from "@/src/types/pcBuilder";

type Props = {
  product: TechProduct;
  status: CompatibilityStatus;
  selected: boolean;
  accessoryQuantity?: number;
  onSelect: (product: TechProduct, isValid: boolean) => void;
  isAccessory: boolean;
};

export default function ProductCard({ product, status, selected, accessoryQuantity = 0, onSelect, isAccessory }: Props) {
  return (
    <div
      className={`
        border rounded-lg p-4 flex gap-4 transition-all
        ${isAccessory ? (accessoryQuantity > 0 ? "border-[#E60012] bg-red-50" : "border-gray-200") : (selected ? "border-[#E60012] bg-red-50" : "border-gray-200")}
        ${!status.valid ? "opacity-60 bg-gray-50 cursor-not-allowed grayscale" : "hover:shadow-md cursor-pointer group bg-white"}
      `}
      onClick={() => onSelect(product, status.valid)}
      role="button"
      aria-disabled={!status.valid}
      aria-label={product.name}
      tabIndex={0}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && status.valid) onSelect(product, status.valid); }}
    >
      <div className="w-24 h-24 bg-white rounded-md overflow-hidden flex-shrink-0 border border-gray-100 p-2 relative">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill unoptimized className="object-contain" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
            <Box size={32} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-[#E60012] transition-colors">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1 mt-2">
            {product.specs?.socket && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {product.specs.socket}
              </span>
            )}
            {product.specs?.tdp && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {product.specs.tdp}W
              </span>
            )}
            {product.specs?.ram_type && (
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {product.specs.ram_type}
              </span>
            )}
            {isAccessory && accessoryQuantity > 0 && (
              <span className="text-[10px] bg-[#E60012] text-white px-2 py-0.5 rounded">
                x{accessoryQuantity}
              </span>
            )}
          </div>
          {!status.valid && (
            <div className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle size={12} />
              {status.messages[0]}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-[#E60012]">{product.price}</span>
          {!isAccessory && selected && (
            <span className="bg-[#E60012] text-white p-1 rounded-full">
              <Check size={16} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
