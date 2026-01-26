import React from "react";
import { ShoppingCart, RefreshCcw, Zap } from "lucide-react";

type Props = {
  totalPrice: number;
  formatCurrency: (v: number) => string;
  isComplete: boolean;
  validationValid: boolean;
  onAddToCart: () => void;
  onClear: () => void;
  showPSULink: boolean;
};

export default function PriceSummary({ totalPrice, formatCurrency, isComplete, validationValid, onAddToCart, onClear, showPSULink }: Props) {
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex justify-between items-center text-xl font-bold">
        <span>Total:</span>
        <span className="text-[#E60012]">
          {formatCurrency(totalPrice)}
        </span>
      </div>
      {showPSULink && (
        <div className="mt-3">
          <a
            href="https://www.balao.info/categoria/fontes-alimentacao"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#E60012] hover:underline"
          >
            <Zap size={16} />
            Ver todas as Fontes na loja
          </a>
        </div>
      )}
      <button
        onClick={onAddToCart}
        disabled={!isComplete && !validationValid ? true : !validationValid}
        className={`w-full py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors
          ${(isComplete && validationValid)
            ? "bg-[#E60012] text-white hover:bg-[#cc0010]"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"}
        `}
        aria-label="Adicionar ao carrinho"
      >
        <ShoppingCart size={16} />
        Adicionar ao Carrinho
      </button>
      <button
        onClick={onClear}
        className="w-full py-2 text-xs text-gray-500 hover:text-gray-700 underline flex items-center justify-center gap-1"
        aria-label="Limpar configuração"
      >
        <RefreshCcw size={12} />
        Limpar Configuração
      </button>
    </div>
  );
}
