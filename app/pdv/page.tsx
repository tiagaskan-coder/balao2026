"use client";

import React from "react";
import ProductSearch from "./components/ProductSearch";
import CartSidebar from "./components/CartSidebar";
import CustomerForm from "./components/CustomerForm";
import PaymentModal from "./components/PaymentModal";
import RecentOrders from "./components/RecentOrders";
import { PdvProvider, usePdv } from "./store";

function PdvContent() {
  const { state } = usePdv();

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4">
      {/* Área principal - busca de produtos e pedidos recentes */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <div className="flex-1">
          <ProductSearch />
        </div>
        <div className="h-80">
          <RecentOrders />
        </div>
      </div>
      
      {/* Sidebar - muda conforme o step */}
      <div className="w-full max-w-md">
        {state.step === "cart" && <CartSidebar />}
        {state.step === "customer" && <CustomerForm />}
        {state.step === "payment" && (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p>Processando pagamento...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de pagamento */}
      {state.step === "payment" && <PaymentModal />}
    </div>
  );
}

export default function PdvPage() {
  return (
    <PdvProvider>
      <PdvContent />
    </PdvProvider>
  );
}
