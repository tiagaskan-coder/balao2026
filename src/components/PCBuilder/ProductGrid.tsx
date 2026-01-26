import React from "react";
import ProductCard from "./ProductCard";
import { TechProduct, CompatibilityStatus } from "@/src/types/pcBuilder";
import { accessoryIds } from "@/src/types/pcBuilder";

type Item = { product: TechProduct; status: CompatibilityStatus };

type Props = {
  items: Item[];
  currentStepId: string;
  selectedId?: string | null;
  extrasForStep?: { product: TechProduct; quantity: number }[];
  onSelect: (product: TechProduct, isValid: boolean) => void;
};

export default function ProductGrid({ items, currentStepId, selectedId, extrasForStep = [], onSelect }: Props) {
  const isAccessory = accessoryIds.has(currentStepId);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map(({ product, status }) => {
        const accessoryQuantity = isAccessory ? (extrasForStep.find(x => x.product.id === product.id)?.quantity || 0) : 0;
        const selected = !isAccessory && selectedId === product.id;
        return (
          <ProductCard
            key={product.id}
            product={product}
            status={status}
            selected={selected}
            accessoryQuantity={accessoryQuantity}
            onSelect={onSelect}
            isAccessory={isAccessory}
          />
        );
      })}
    </div>
  );
}
