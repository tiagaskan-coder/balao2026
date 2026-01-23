"use client";

import { useState, useEffect, useCallback } from "react";
import { parseProducts, Product, CATEGORIES } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Layout, Layers, History, Save, Search, Settings, ExternalLink } from "lucide-react";
import CarouselManager from "@/components/admin/CarouselManager";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"import" | "carousel" | "products">("import");

  // Product List State
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Import State
  const [text, setText] = useState("");
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [importStep, setImportStep] = useState<"input" | "preview">("input");
  
  // Import Settings
  const [selectedCategory, setSelectedCategory] = useState("Hardware");
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0);
  const [adjustmentScope, setAdjustmentScope] = useState<"all" | "high_value" | "low_value">("all");
  const [scopeThreshold, setScopeThreshold] = useState<number>(1000);
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Image Enhancement State
  const [enableEnhancement, setEnableEnhancement] = useState(false);
  const [enhancementScale, setEnhancementScale] = useState(2);
  const [processingLog, setProcessingLog] = useState<string[]>([]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === "1") setActiveTab("import");
        if (e.key === "2") setActiveTab("carousel");
        if (e.key === "3") setActiveTab("products");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch Products when tab changes
  useEffect(() => {
    if (activeTab === "products") {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Failed to fetch products", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Preview Logic
  const getPreviewProducts = () => {
    return parsedProducts.map(p => {
        // Fix: Use global regex for replace all dots, then replace comma with dot
        let priceNum = parseFloat(p.price.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());
        if (isNaN(priceNum)) priceNum = 0;

        let applyAdjustment = false;
        if (adjustmentScope === "all") applyAdjustment = true;
        else if (adjustmentScope === "high_value" && priceNum >= scopeThreshold) applyAdjustment = true;
        else if (adjustmentScope === "low_value" && priceNum < scopeThreshold) applyAdjustment = true;

        let newPriceNum = priceNum;
        if (applyAdjustment) {
            newPriceNum = priceNum * (1 + priceAdjustment / 100);
        }

        const newPriceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(newPriceNum);

        return {
            ...p,
            category: selectedCategory, // Apply selected category
            originalPrice: p.price,
            newPrice: newPriceFormatted,
            priceChange: newPriceNum - priceNum
        };
    });
  };

  const validateImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        // Accept all sizes (Next.js Image Optimization will handle resizing)
        // We only validate that the image exists and can be loaded
        resolve(true);
      };
      img.onerror = () => resolve(false); // Reject broken URLs
      img.src = url;
    });
  };

  const handleParse = async () => {
    setStatus("loading");
    setMessage("Verificando disponibilidade das imagens...");

    const products = parseProducts(text);
    if (products.length === 0) {
        setStatus("error");
        setMessage("Nenhum produto encontrado no texto.");
        return;
    }

    // Verify if images are accessible
    const validationResults = await Promise.all(
        products.map(async (p) => {
            const isValid = await validateImage(p.image);
            return { product: p, isValid };
        })
    );

    const validProducts = validationResults
        .filter(r => r.isValid)
        .map(r => r.product);
        
    const brokenCount = products.length - validProducts.length;

    if (validProducts.length === 0) {
        setStatus("error");
        setMessage(`Nenhum produto válido. ${brokenCount} imagens inacessíveis.`);
        return;
    }

    setParsedProducts(validProducts);
    setImportStep("preview");
    setStatus("idle");
    
    if (brokenCount > 0) {
        setMessage(`${validProducts.length} produtos válidos. ${brokenCount} imagens removidas (URL inválida).`);
    } else {
        setMessage("");
    }
  };

  const processImages = async (productsToProcess: any[]) => {
      setMessage("Iniciando tratamento de imagens (IA Upscale)...");
      const total = productsToProcess.length;
      let processed = 0;
      let successes = 0;
      let failures = 0;
      const logs: string[] = [];

      // Process in batches of 3 to avoid overwhelming the server/browser
      const batchSize = 3;
      const processedProducts = [...productsToProcess];
      
      for (let i = 0; i < total; i += batchSize) {
          const batch = processedProducts.slice(i, i + batchSize);
          await Promise.all(batch.map(async (p, idx) => {
              const realIdx = i + idx;
              if (!p.image) return;

              try {
                  const res = await fetch("/api/process-image", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ 
                          imageUrl: p.image,
                          options: { scale: enhancementScale }
                      })
                  });
                  
                  const data = await res.json();
                  processed++;
                  
                  if (data.success) {
                      successes++;
                      logs.push(`[OK] ${p.name}: Upscale ${data.details.originalWidth}px -> ${data.details.newWidth}px`);
                      processedProducts[realIdx].image = data.processedUrl;
                  } else {
                      failures++;
                      logs.push(`[FALHA] ${p.name}: ${data.error}`);
                  }
              } catch (e) {
                  failures++;
                  logs.push(`[ERRO] ${p.name}: Erro de conexão`);
              }
          }));
          setMessage(`Processando imagens: ${Math.min(i + batchSize, total)}/${total} (${successes} melhoradas)`);
      }
      
      setProcessingLog(logs);
      return processedProducts;
  };

  const handleConfirmImport = async () => {
    setStatus("loading");
    try {
      let finalProducts = getPreviewProducts().map(p => ({
          id: p.id,
          name: p.name,
          price: p.newPrice, // Use calculated price
          image: p.image,
          category: p.category,
          slug: p.slug
      }));

      // Image Processing Step
      if (enableEnhancement) {
          finalProducts = await processImages(finalProducts);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: finalProducts }),
      });

      if (!res.ok) throw new Error("Falha ao salvar");

      // Save History
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            product_count: finalProducts.length,
            price_percentage: priceAdjustment,
            applied_category: selectedCategory,
            applied_scope: adjustmentScope
        })
      });

      const data = await res.json();
      setStatus("success");
      
      let successMsg = `${data.count} produtos importados com sucesso!`;
      if (enableEnhancement) {
          successMsg += ` Imagens processadas. Ver logs para detalhes.`;
      }
      setMessage(successMsg);
      
      setText("");
      setParsedProducts([]);
      setImportStep("input");
      
      // Reset settings
      setPriceAdjustment(0);
    } catch (e) {
      console.error(e);
      setStatus("error");
      setMessage("Erro ao importar produtos.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-gray-800">Painel Administrativo</h1>
             </div>
             <div className="flex gap-2">
                 {/* Quick Status/User info could go here */}
             </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation (Tabs) */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <nav className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                    <button
                        onClick={() => setActiveTab("import")}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "import" ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <Upload size={18} />
                        Importação em Massa
                    </button>
                    <button
                        onClick={() => setActiveTab("carousel")}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "carousel" ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <Layout size={18} />
                        Gerenciar Carrossel
                    </button>
                    <button
                         disabled
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                        <Layers size={18} />
                        Produtos (Em breve)
                    </button>
                    <button
                        disabled
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                        <Settings size={18} />
                        Configurações (Em breve)
                    </button>
                </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
                    
                    {/* IMPORT TAB */}
                    {activeTab === "import" && (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Upload className="text-[#E60012]" />
                                    Importação de Produtos
                                </h2>
                                {importStep === "preview" && (
                                    <button 
                                        onClick={() => setImportStep("input")}
                                        className="text-sm text-gray-500 hover:text-gray-800 underline"
                                    >
                                        Voltar para edição
                                    </button>
                                )}
                            </div>

                            {/* Status Messages */}
                            {message && (
                                <div className={`mb-6 p-4 rounded-md border flex items-center gap-3 ${status === "success" ? "bg-green-50 border-green-200 text-green-700" : status === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-blue-50 border-blue-200 text-blue-700"}`}>
                                    {status === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    {message}
                                </div>
                            )}

                            {importStep === "input" ? (
                                <>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cole o bloco de texto dos produtos:
                                        </label>
                                        <textarea
                                            className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent font-mono text-sm"
                                            placeholder="Exemplo: imageCard src... https://... Nome do Produto R$ 100,00"
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            O sistema extrai automaticamente: URL da imagem, Nome do produto e Preço (R$).
                                        </p>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleParse}
                                            disabled={!text.trim()}
                                            className="bg-[#E60012] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            Processar Texto
                                            <Search size={18} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Preview & Settings */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 bg-gray-50 p-4 rounded-lg border">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Categoria Destino</label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full p-2 border rounded-md text-sm"
                                            >
                                                {CATEGORIES.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Ajuste de Preço (%)</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={priceAdjustment}
                                                    onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                                                    className="w-full p-2 border rounded-md text-sm"
                                                    placeholder="0"
                                                />
                                                <span className="text-gray-500 text-sm">%</span>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-1">Use valores negativos para desconto.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Aplicar Ajuste Em</label>
                                            <select
                                                value={adjustmentScope}
                                                onChange={(e) => setAdjustmentScope(e.target.value as any)}
                                                className="w-full p-2 border rounded-md text-sm mb-2"
                                            >
                                                <option value="all">Todos os produtos</option>
                                                <option value="high_value">Preço acima de...</option>
                                                <option value="low_value">Preço abaixo de...</option>
                                            </select>
                                            {adjustmentScope !== "all" && (
                                                <div className="flex items-center gap-2">
                                                     <span className="text-xs text-gray-500">R$</span>
                                                     <input 
                                                        type="number" 
                                                        value={scopeThreshold}
                                                        onChange={(e) => setScopeThreshold(Number(e.target.value))}
                                                        className="w-full p-1 border rounded text-sm"
                                                     />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Image Enhancement Settings */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Tratamento de Imagem (IA)</label>
                                            <div className="flex flex-col gap-2 bg-white p-2 rounded border border-gray-200">
                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={enableEnhancement}
                                                        onChange={(e) => setEnableEnhancement(e.target.checked)}
                                                        className="rounded text-[#E60012] focus:ring-[#E60012]"
                                                    />
                                                    Ativar Super-Resolução
                                                </label>
                                                {enableEnhancement && (
                                                    <div className="pl-6 animate-in fade-in slide-in-from-top-1">
                                                        <label className="text-xs text-gray-500 block mb-1">Fator de Escala</label>
                                                        <select 
                                                            value={enhancementScale}
                                                            onChange={(e) => setEnhancementScale(Number(e.target.value))}
                                                            className="w-full p-1 border rounded text-xs mb-1"
                                                        >
                                                            <option value={2}>2x (Recomendado)</option>
                                                            <option value={4}>4x (Máxima Qualidade)</option>
                                                        </select>
                                                        <p className="text-[10px] text-gray-400 leading-tight">
                                                            Aplica redimensionamento Lanczos3, nitidez e otimização WebP.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Processing Logs */}
                                    {processingLog.length > 0 && (
                                        <div className="mb-6 bg-gray-900 text-green-400 p-4 rounded-md font-mono text-xs max-h-48 overflow-y-auto shadow-inner border border-gray-700">
                                            <div className="font-bold text-white mb-2 sticky top-0 bg-gray-900 pb-2 border-b border-gray-700 flex justify-between">
                                                <span>Logs de Processamento</span>
                                                <span className="text-gray-400">{processingLog.length} eventos</span>
                                            </div>
                                            <div className="space-y-1">
                                                {processingLog.map((log, i) => (
                                                    <div key={i} className={`${log.includes("FALHA") || log.includes("ERRO") ? "text-red-400" : "text-green-400"}`}>
                                                        {log}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-6 overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3">Produto</th>
                                                    <th className="px-4 py-3">Preço Original</th>
                                                    <th className="px-4 py-3">Novo Preço</th>
                                                    <th className="px-4 py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getPreviewProducts().map((p, idx) => (
                                                    <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate" title={p.name}>
                                                            {p.name}
                                                        </td>
                                                        <td className="px-4 py-3">{p.originalPrice}</td>
                                                        <td className="px-4 py-3 font-bold text-gray-900">
                                                            {p.newPrice}
                                                            {p.priceChange !== 0 && (
                                                                <span className={`ml-2 text-xs ${p.priceChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                                    ({p.priceChange > 0 ? '+' : ''}{p.priceChange.toFixed(2)})
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Pronto</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex justify-end gap-4">
                                        <button
                                            onClick={() => setImportStep("input")}
                                            className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleConfirmImport}
                                            disabled={status === "loading"}
                                            className="bg-[#E60012] text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {status === "loading" ? "Salvando..." : "Confirmar Importação"}
                                            <Save size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* CAROUSEL TAB */}
                    {activeTab === "carousel" && (
                        <div className="animate-in fade-in duration-300">
                            <CarouselManager />
                        </div>
                    )}

                    {/* PRODUCTS TAB */}
                    {activeTab === "products" && (
                        <div className="animate-in fade-in duration-300">
                             <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Layers className="text-[#E60012]" />
                                    Gerenciar Produtos
                                </h2>
                                <span className="text-sm text-gray-500">
                                    {filteredProducts.length} produtos encontrados
                                </span>
                            </div>

                            <div className="mb-6 relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou categoria..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>

                            {loadingProducts ? (
                                <div className="text-center py-12 text-gray-500">Carregando produtos...</div>
                            ) : (
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3">Imagem</th>
                                                <th className="px-4 py-3">Nome</th>
                                                <th className="px-4 py-3">Categoria</th>
                                                <th className="px-4 py-3">Preço</th>
                                                <th className="px-4 py-3 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map((product) => (
                                                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <div className="w-10 h-10 relative bg-gray-100 rounded overflow-hidden">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img 
                                                                    src={product.image} 
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate" title={product.name}>
                                                            {product.name}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-500">
                                                                {product.category || "Geral"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-gray-900">
                                                            {product.price}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <Link 
                                                                href={`/product/${product.id}`}
                                                                target="_blank"
                                                                className="text-blue-600 hover:text-blue-900 font-medium text-xs flex items-center justify-end gap-1"
                                                            >
                                                                Ver <ExternalLink size={14} />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                        Nenhum produto encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
