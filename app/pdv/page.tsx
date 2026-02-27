"use client";

import React from "react";
import ProductSearch from "./components/ProductSearch";
import CartSidebar from "./components/CartSidebar";

export default function PdvPage() {
  return (
    <div className="flex h-[calc(100vh-100px)] gap-4">
      <div className="flex-1 min-w-0">
        <ProductSearch />
      </div>
      <div className="w-full max-w-md">
        <CartSidebar />
      </div>
    </div>
  );
}
