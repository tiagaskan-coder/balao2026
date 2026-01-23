"use client";

import { useState } from "react";
import { parseProducts } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react";
import CarouselManager from "@/components/admin/CarouselManager";

export default function AdminPage() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleImport = async () => {
    setStatus("loading");
    try {
      const products = parseProducts(text);
      if (products.length === 0) {
        setStatus("error");
        setMessage("Nenhum produto encontrado no texto.");
        return;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });

      if (!res.ok) throw new Error("Falha ao salvar");

      const data = await res.json();
      setStatus("success");
      setMessage(`${data.count} produtos importados com sucesso!`); // Note: API returns total count
      setText(""); // Clear text
    } catch (e) {
      console.error(e);
      setStatus("error");
      setMessage("Erro ao importar produtos.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Administração</h1>
        </div>

        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Upload size={24} />
                Importação em Massa
            </h2>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cole o bloco de texto dos produtos aqui:
                </label>
                <textarea
                    className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent font-mono text-sm"
                    placeholder="Exemplo: imageCard src... https://... Nome do Produto R$ 100,00"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {status === "success" && (
                        <div className="text-green-600 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-md border border-green-200">
                            <CheckCircle size={20} />
                            {message}
                        </div>
                    )}
                    {status === "error" && (
                        <div className="text-red-600 flex items-center gap-2 bg-red-50 px-3 py-1 rounded-md border border-red-200">
                            <AlertCircle size={20} />
                            {message}
                        </div>
                    )}
                </div>
                
                <button
                    onClick={handleImport}
                    disabled={status === "loading" || !text.trim()}
                    className="bg-[#E60012] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {status === "loading" ? "Importando..." : "Importar Produtos"}
                    <Upload size={20} />
                </button>
            </div>
            
            <div className="mt-8 border-t pt-6">
                <h3 className="font-bold mb-2 text-gray-800">Instruções:</h3>
                <p className="text-sm text-gray-600 mb-2">
                    O sistema espera um texto contendo, para cada produto:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                    <li>URL da imagem (http/https)</li>
                    <li>Nome do produto</li>
                    <li>Preço (formato R$ 00,00)</li>
                </ul>
            </div>
        </div>

        <div className="border-t pt-8">
            <CarouselManager />
        </div>
      </div>
    </div>
  );
}
