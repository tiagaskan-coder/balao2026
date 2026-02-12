"use client";

import { useState, useEffect } from "react";
import { parseProducts, Product, Category, buildCategoryTree, CATEGORIES } from "@/lib/utils";
import Link from "next/link";
import CarouselManager from "@/components/admin/CarouselManager";
import CategoryManager from "@/components/admin/CategoryManager";
import OrderManager from "@/components/admin/OrderManager";
import ProductManager from "@/components/admin/ProductManager";
import HomeBlocksManager from "@/components/admin/HomeBlocksManager";
import MarketingManager from "@/components/admin/MarketingManager";
import CouponManager from "@/components/admin/CouponManager";
import AssistantSettings from "@/components/admin/AssistantSettings";
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Layout, Layers, Save, Search, Settings, ShoppingBag, Mail, MessageSquare } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"import" | "carousel" | "products" | "categories" | "orders" | "home_blocks" | "marketing" | "coupons" | "assistant">("import");

  // Product List State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [migrateImages, setMigrateImages] = useState(false);
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  

  // Keyboard Shortcuts
  useEffect(() => {
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
        const res = await fetch("/api/categories");
        if (res.ok) {
            const data = await res.json();
            setCategories(data);
        }
    } catch (e) {
        console.error("Failed to fetch categories", e);
    }
  };

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

  const filteredProducts = products.filter((p: Product) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Preview Logic
  const getPreviewProducts = () => {
    return parsedProducts.map((p: Product) => {
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
        resolve(true);
      };
      img.onerror = () => resolve(false); 
      img.src = url;
    });
  };

  const optimizeUrl = (url: string) => {
    try {
        const u = new URL(url);
        
        // 1. Remove common resize query parameters
        const paramsToRemove = ['w', 'h', 'width', 'height', 'size', 'resize', 'format', 'quality', 'fit', 'crop', 'dpr', 'auto', 'v'];
        paramsToRemove.forEach(p => u.searchParams.delete(p));

        let path = u.pathname;

        // 2. Handle Google/Blogspot image resizing (/sXXX/) -> switch to /s0/ (original)
        if (/\/s\d+(-c)?\//.test(path)) {
            path = path.replace(/\/s\d+(-c)?\//, '/s0/');
        }
        
        // 3. Remove size suffixes in filename (e.g., image_50x50.jpg -> image.jpg)
        // Matches _100x100, _thumb, -thumb, _small, .small before extension
        const sizePattern = /[-_](?:\d+x\d+|thumb|thumbnail|small|medium|large|mini)(?=\.[a-zA-Z0-9]+$)/i;
        if (sizePattern.test(path)) {
             path = path.replace(sizePattern, '');
        }

        u.pathname = path;
        return u.toString();
    } catch {
        // Fallback for non-standard URLs: try basic regex cleanup
        return url.replace(/[-_]\d+x\d+(?=\.[a-zA-Z0-9]+$)/, '');
    }
  };

  const handleParse = async () => {
    setStatus("loading");
    setMessage("Verificando disponibilidade das imagens e otimizando resolução...");

    const products = parseProducts(text);
    if (products.length === 0) {
        setStatus("error");
        setMessage("Nenhum produto encontrado no texto.");
        return;
    }

    // Verify if images are accessible and optimize URL
    const productsWithValidation = await Promise.all(
        products.map(async (p) => {
            const optimizedImage = optimizeUrl(p.image);
            const isValid = await validateImage(optimizedImage);
            return { ...p, image: optimizedImage, imageValid: isValid };
        })
    );

    // Filter out invalid images as requested
    const validProducts = productsWithValidation.filter(r => r.imageValid && r.image);
        
    setParsedProducts(validProducts);
    setImportStep("preview");
    setStatus("idle");
    
    if (validProducts.length < productsWithValidation.length) {
        setMessage(`${validProducts.length} produtos válidos encontrados. (${productsWithValidation.length - validProducts.length} removidos por imagem inválida/quebrada).`);
    } else {
        setMessage(`${validProducts.length} produtos encontrados com sucesso.`);
    }
  };

  const handleConfirmImport = async () => {
    setStatus("loading");
    try {
      const finalProducts = getPreviewProducts().map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.newPrice, // Use calculated price
          image: p.image,
          category: p.category,
          slug: p.slug
      }));

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: finalProducts }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Falha ao salvar");
      }

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
      setMessage(`${data.count} produtos importados com sucesso!`);
      setText("");
      setParsedProducts([]);
      setImportStep("input");
      
      // Reset settings
      setPriceAdjustment(0);
      setActiveTab("products");
      await fetchProducts();
    } catch (e: any) {
      console.error(e);
      setStatus("error");
      setMessage(`Erro ao importar: ${e.message || "Erro desconhecido"}`);
    }
  };

  const categoryTree = buildCategoryTree(categories);
  const flatCategories: { name: string; level: number }[] = [];
  
  const flatten = (nodes: Category[], level = 0) => {
    nodes.forEach(node => {
        flatCategories.push({ name: node.name, level });
        if (node.children) flatten(node.children, level + 1);
    });
  };
  flatten(categoryTree);

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
                        onClick={() => setActiveTab("categories")}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "categories" ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <Layers size={18} />
                        Gerenciar Categorias
                    </button>
                    <button
                        onClick={() => setActiveTab("orders")}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "orders" ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <ShoppingBag size={18} />
                        Gerenciar Pedidos
                    </button>
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "products" ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <Settings size={18} />
                        Gerenciar Produtos
                    </button>
                    <button
                        onClick={() => setActiveTab("home_blocks")}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "home_blocks" ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <Layout size={18} />
                        Blocos da Home
                    </button>
                    <button
                        onClick={() => setActiveTab("marketing")}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "marketing" ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <Mail size={18} />
                        Marketing & E-mail
                    </button>
                    <button
                        onClick={() => setActiveTab("assistant")}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "assistant" ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <MessageSquare size={18} />
                        Assistente
                    </button>
                    <button
                        onClick={() => setActiveTab("coupons")}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === "coupons" ? "bg-red-50 text-[#E60012] border-l-4 border-[#E60012]" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        <Settings size={18} />
                        Cupons
                    </button>
                </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm p-6 min-h-[500px]">
                    
                    {/* HOME BLOCKS TAB */}
                    {activeTab === "home_blocks" && (
                         <div className="animate-in fade-in duration-300">
                             <HomeBlocksManager categories={categories} />
                         </div>
                    )}

                    {/* MARKETING TAB */}
                    {activeTab === "marketing" && (
                         <div className="animate-in fade-in duration-300">
                             <MarketingManager />
                         </div>
                    )}

                    {/* ASSISTANT TAB */}
                    {activeTab === "assistant" && (
                        <div className="animate-in fade-in duration-300">
                             <AssistantSettings />
                        </div>
                    )}

                    {/* COUPONS TAB */}
                    {activeTab === "coupons" && (
                         <div className="animate-in fade-in duration-300">
                             <CouponManager />
                         </div>
                    )}

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
                                                {flatCategories.length > 0 ? (
                                                    flatCategories.map(c => (
                                                        <option key={c.name} value={c.name}>
                                                            {/* Indentation */}
                                                            {'\u00A0'.repeat(c.level * 4)}{c.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    // Fallback to static list if empty (loading or error)
                                                    CATEGORIES.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))
                                                )}
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

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Opções Extras</label>
                                            <div className="flex items-center h-[38px]">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={migrateImages} 
                                                        onChange={(e) => setMigrateImages(e.target.checked)}
                                                        className="w-4 h-4 text-[#E60012] rounded border-gray-300 focus:ring-[#E60012]"
                                                    />
                                                    <span className="text-sm text-gray-700 font-medium">
                                                        Migrar imagens para Supabase
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}

                                    <div className="mb-6 overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3">Imagem</th>
                                                    <th className="px-4 py-3">Produto</th>
                                                    <th className="px-4 py-3">Preço Original</th>
                                                    <th className="px-4 py-3">Novo Preço</th>
                                                    <th className="px-4 py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getPreviewProducts().map((p, idx) => (
                                                    <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <div className="w-12 h-12 relative">
                                                                <img 
                                                                    src={p.image} 
                                                                    alt="" 
                                                                    className="w-full h-full object-contain rounded border"
                                                                />
                                                            </div>
                                                        </td>
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
                             <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Layout className="text-[#E60012]" />
                                    Gerenciamento do Carrossel
                                </h2>
                            </div>
                            <CarouselManager />
                        </div>
                    )}

                    {/* CATEGORIES TAB */}
                    {activeTab === "categories" && (
                        <div className="animate-in fade-in duration-300">
                             <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Layers className="text-[#E60012]" />
                                    Gerenciamento de Categorias
                                </h2>
                            </div>
                            <CategoryManager />
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === "orders" && (
                        <div className="animate-in fade-in duration-300">
                             <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <ShoppingBag className="text-[#E60012]" />
                                    Gerenciamento de Pedidos
                                </h2>
                            </div>
                            <OrderManager />
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
                            </div>
                            <ProductManager />
                        </div>
                    )}

                    
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
