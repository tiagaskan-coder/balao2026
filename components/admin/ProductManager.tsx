"use client";

import { useState, useEffect } from "react";
import { Product, Category } from "@/lib/utils";
import { Plus, Edit, Trash2, Copy, Search, Upload, X, Save, Image as ImageIcon, Video, DollarSign, Package, CheckSquare, Square, ChevronDown, Percent } from "lucide-react";

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Bulk Action State
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkPricePercent, setBulkPricePercent] = useState<number>(0);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Edit/Create State
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
        const res = await fetch("/api/products");
        if (res.ok) setProducts(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
        const res = await fetch("/api/categories");
        if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
  };

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // Bulk Actions
  const handleBulkUpdateCategory = async () => {
    if (!bulkCategory) return alert("Selecione uma categoria");
    if (!confirm(`Mover ${selectedIds.size} produtos para ${bulkCategory}?`)) return;

    setIsProcessingBulk(true);
    try {
        const res = await fetch("/api/products/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ids: Array.from(selectedIds),
                action: "update_category",
                value: bulkCategory
            })
        });

        if (res.ok) {
            alert("Categoria atualizada com sucesso!");
            setSelectedIds(new Set());
            fetchProducts();
        } else {
            throw new Error("Falha ao atualizar");
        }
    } catch (e) {
        alert("Erro ao atualizar em massa");
        console.error(e);
    } finally {
        setIsProcessingBulk(false);
    }
  };

  const handleBulkUpdatePrice = async () => {
    if (bulkPricePercent === 0) return alert("Digite uma porcentagem");
    if (!confirm(`Alterar preço de ${selectedIds.size} produtos em ${bulkPricePercent}%?`)) return;

    setIsProcessingBulk(true);
    try {
        const res = await fetch("/api/products/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ids: Array.from(selectedIds),
                action: "update_price",
                value: bulkPricePercent
            })
        });

        if (res.ok) {
            alert("Preços atualizados com sucesso!");
            setSelectedIds(new Set());
            setBulkPricePercent(0);
            fetchProducts();
        } else {
            throw new Error("Falha ao atualizar");
        }
    } catch (e) {
        alert("Erro ao atualizar em massa");
        console.error(e);
    } finally {
        setIsProcessingBulk(false);
    }
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setImagePreview(product.image);
    setImageFile(null);
    setIsEditing(true);
  };

  const handleDuplicate = async (product: Product) => {
    if(!confirm("Duplicar este produto?")) return;
    
    const newProduct = {
        ...product,
        id: undefined, // Let DB generate or generate new one
        name: `${product.name} (Cópia)`,
        slug: `${product.slug}-copia-${Math.floor(Math.random() * 1000)}`
    };
    
    // Call create API
    try {
        const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProduct)
        });
        if (res.ok) fetchProducts();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
        await fetch(`/api/products/${id}`, { method: "DELETE" });
        fetchProducts();
    } catch (e) { console.error(e); }
  };

  const handleSave = async () => {
    if (!currentProduct.name) return alert("Nome é obrigatório");
    if (!currentProduct.price) return alert("Preço é obrigatório");
    if (!currentProduct.category) return alert("Categoria é obrigatória");

    setSaving(true);
    try {
        let imageUrl = currentProduct.image;

        // Upload Image if changed
        if (imageFile) {
            const formData = new FormData();
            formData.append("file", imageFile);
            formData.append("bucket", "products");
            
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (res.ok) {
                const data = await res.json();
                imageUrl = data.url;
            } else {
                throw new Error("Erro no upload da imagem");
            }
        }

        // Format price if user entered plain number
        let formattedPrice = currentProduct.price;
        if (!currentProduct.price.includes("R$")) {
            const num = parseFloat(currentProduct.price.replace(",", "."));
            if (!isNaN(num)) {
                formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
            }
        }

        const productData = {
            ...currentProduct,
            price: formattedPrice,
            image: imageUrl,
        };

        let res;
        if (currentProduct.id) {
            // Update
             res = await fetch(`/api/products/${currentProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
        } else {
            // Create
            // Ensure ID is undefined so DB generates it (if UUID)
            // Or if DB requires text ID, we should use a better generator like crypto.randomUUID() if available, 
            // but usually letting DB handle it is best.
            // If the schema expects a string ID that IS NOT a UUID, then the random string is fine.
            // But "save error" usually implies constraint violation or type mismatch.
            
            if (!productData.slug) productData.slug = productData.name?.toLowerCase().replace(/\s+/g, '-') || 'produto';
            
            // Remove the manual ID generation to let Supabase/Postgres generate it (assuming UUID default)
            // If the table doesn't have a default for ID, this might fail. 
            // However, typical Supabase setup uses uuid_generate_v4().
            delete productData.id;

            res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
        }

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Erro ao salvar produto");
        }

        setIsEditing(false);
        fetchProducts();
    } catch (e: any) {
        console.error(e);
        alert("Erro ao salvar: " + e.message);
    } finally {
        setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="font-medium text-blue-800 flex items-center gap-2">
                    <CheckSquare size={18} />
                    {selectedIds.size} selecionados
                </div>
                
                <div className="h-6 w-px bg-blue-200 mx-2 hidden md:block"></div>

                {/* Bulk Category */}
                <div className="flex items-center gap-2">
                    <select 
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value)}
                        className="text-sm border-blue-200 rounded-md py-1.5 px-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Alterar Categoria...</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <button 
                        onClick={handleBulkUpdateCategory}
                        disabled={!bulkCategory || isProcessingBulk}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        Aplicar
                    </button>
                </div>

                <div className="h-6 w-px bg-blue-200 mx-2 hidden md:block"></div>

                {/* Bulk Price */}
                <div className="flex items-center gap-2">
                    <div className="relative w-32">
                        <input 
                            type="number" 
                            placeholder="0"
                            value={bulkPricePercent || ""}
                            onChange={(e) => setBulkPricePercent(Number(e.target.value))}
                            className="w-full text-sm border-blue-200 rounded-md py-1.5 pl-2 pr-6 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <span className="absolute right-2 top-1.5 text-blue-500 text-xs font-bold">%</span>
                    </div>
                    <button 
                        onClick={handleBulkUpdatePrice}
                        disabled={!bulkPricePercent || isProcessingBulk}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        Aplicar
                    </button>
                </div>

                <div className="flex-1"></div>
                <button 
                    onClick={() => setSelectedIds(new Set())}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    Cancelar Seleção
                </button>
            </div>
        )}

        {/* Header & Controls */}
        <div className="flex justify-between items-center mb-6">
            <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar produtos..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => {
                    setCurrentProduct({ category: "Hardware" }); // Default
                    setImagePreview("");
                    setImageFile(null);
                    setIsEditing(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
                <Plus size={20} /> Novo Produto
            </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                    <tr>
                        <th className="p-4 w-10">
                            <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                                {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
                            </button>
                        </th>
                        <th className="p-4">Produto</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Preço</th>
                        <th className="p-4">Custo</th>
                        <th className="p-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {loading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Carregando produtos...</td></tr>
                    ) : filteredProducts.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum produto encontrado.</td></tr>
                    ) : (
                        filteredProducts.map(product => (
                            <tr key={product.id} className={`hover:bg-gray-50 ${selectedIds.has(product.id) ? "bg-blue-50" : ""}`}>
                                <td className="p-4">
                                    <button onClick={() => toggleSelect(product.id)} className={`text-gray-400 hover:text-gray-600 ${selectedIds.has(product.id) ? "text-blue-600" : ""}`}>
                                        {selectedIds.has(product.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </button>
                                </td>
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                        <div className="text-xs text-gray-500">{product.supplier || "Sem fornecedor"}</div>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">{product.category}</td>
                                <td className="p-4 font-medium text-green-600">{product.price}</td>
                                <td className="p-4 text-gray-500">{product.cost ? formatCurrency(product.cost) : "-"}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Editar"><Edit size={18} /></button>
                                        <button onClick={() => handleDuplicate(product)} className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Duplicar"><Copy size={18} /></button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Excluir"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Modal */}
        {isEditing && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                    <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                        <h2 className="text-xl font-bold">{currentProduct.id ? "Editar Produto" : "Novo Produto"}</h2>
                        <button onClick={() => setIsEditing(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto">
                        {/* Left Column: Media */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
                                <div 
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer relative transition-colors"
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => {
                                        e.preventDefault();
                                        if (e.dataTransfer.files?.[0]) {
                                            const file = e.dataTransfer.files[0];
                                            setImageFile(file);
                                            setImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                >
                                    {imagePreview ? (
                                        <div className="relative group">
                                            <img src={imagePreview} className="mx-auto h-64 object-contain" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                <p>Clique ou arraste para alterar</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-10 text-gray-400">
                                            <ImageIcon size={48} className="mx-auto mb-2" />
                                            <p>Arraste uma imagem ou clique para selecionar</p>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={e => {
                                            if (e.target.files?.[0]) {
                                                const file = e.target.files[0];
                                                setImageFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vídeo (YouTube)</label>
                                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 ring-blue-500">
                                    <Video size={20} className="text-gray-400" />
                                    <input 
                                        type="text" 
                                        className="flex-1 outline-none" 
                                        placeholder="https://youtube.com/watch?v=..." 
                                        value={currentProduct.video_url || ""}
                                        onChange={e => setCurrentProduct({...currentProduct, video_url: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-blue-500 outline-none"
                                    value={currentProduct.name || ""}
                                    onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (Venda)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-blue-500 outline-none"
                                        placeholder="R$ 0,00"
                                        value={currentProduct.price || ""}
                                        onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custo</label>
                                    <input 
                                        type="number" 
                                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-blue-500 outline-none"
                                        placeholder="0.00"
                                        value={currentProduct.cost || ""}
                                        onChange={e => setCurrentProduct({...currentProduct, cost: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                <select 
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-blue-500 outline-none"
                                    value={currentProduct.category || ""}
                                    onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                    {/* Fallback */}
                                    {!categories.length && (
                                        <>
                                            <option value="Hardware">Hardware</option>
                                            <option value="Periféricos">Periféricos</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 ring-blue-500 outline-none"
                                    value={currentProduct.supplier || ""}
                                    onChange={e => setCurrentProduct({...currentProduct, supplier: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea 
                                    className="w-full border rounded-lg px-3 py-2 h-32 focus:ring-2 ring-blue-500 outline-none resize-none"
                                    value={currentProduct.description || ""}
                                    onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? "Salvando..." : (
                                <>
                                    <Save size={18} /> Salvar Produto
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
