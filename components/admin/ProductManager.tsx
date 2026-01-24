"use client";

import { useState, useEffect } from "react";
import { Product, Category } from "@/lib/utils";
import { Plus, Edit, Trash2, Copy, Search, Upload, X, Save, Image as ImageIcon, Video, DollarSign, Package } from "lucide-react";

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
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

        const productData = {
            ...currentProduct,
            image: imageUrl,
        };

        if (currentProduct.id) {
            // Update
             const res = await fetch(`/api/products/${currentProduct.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            if (!res.ok) throw new Error("Erro ao atualizar");
        } else {
            // Create
            // Generate basic ID/Slug if missing
            if (!productData.id) productData.id = Math.random().toString(36).substring(2, 9);
            if (!productData.slug) productData.slug = productData.name?.toLowerCase().replace(/\s+/g, '-') || 'produto';
            
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            if (!res.ok) throw new Error("Erro ao criar");
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
                        <th className="p-4">Produto</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Preço</th>
                        <th className="p-4">Custo</th>
                        <th className="p-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">Carregando produtos...</td></tr>
                    ) : filteredProducts.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum produto encontrado.</td></tr>
                    ) : (
                        filteredProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
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
