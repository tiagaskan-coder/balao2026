"use client";

import { useState, useEffect } from "react";
import { Mail, Calendar, Send, Plus, Trash, Search, Eye, BarChart, Users, Settings, FileText, ShoppingBag, X } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

// Tipos
interface Campaign {
    id: string;
    title: string;
    subject: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    created_at: string;
    sent_at?: string;
    scheduled_at?: string;
    target_audience: string;
    content: string;
}

interface Product {
    id: string;
    name: string;
    price: string;
    image: string;
    category?: string;
}

export default function MarketingManager() {
    const [view, setView] = useState<"list" | "editor" | "logs" | "subscribers">("list");
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // Editor State
    const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign>>({
        title: "",
        subject: "",
        content: "",
        target_audience: "all",
        scheduled_at: ""
    });

    // Preview State
    const [showPreview, setShowPreview] = useState(false);

    // Product Selector State
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (view === "list") fetchCampaigns();
        if (view === "logs") fetchLogs();
        if (view === "subscribers") fetchSubscribers();
    }, [view]);

    // Fetch Data
    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/marketing/campaigns");
            if (res.ok) setCampaigns(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/marketing/logs");
            if (res.ok) setLogs(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) setProducts(await res.json());
        } catch (error) {
            console.error(error);
        }
    };

    // Actions
    const handleSaveCampaign = async () => {
        if (!editingCampaign.title || !editingCampaign.subject) {
            showToast("Preencha título e assunto", "error");
            return;
        }

        try {
            const res = await fetch("/api/marketing/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingCampaign),
            });

            if (!res.ok) throw new Error("Erro ao salvar");

            showToast("Campanha salva com sucesso!", "success");
            setView("list");
            setEditingCampaign({ title: "", subject: "", content: "", target_audience: "all", scheduled_at: "" });
            setSelectedProducts([]);
        } catch (error) {
            showToast("Erro ao salvar campanha", "error");
        }
    };

    const handleSendTest = async (id: string) => {
        try {
            const email = prompt("Digite o e-mail para teste:");
            if (!email) return;

            const res = await fetch(`/api/marketing/campaigns/${id}/send-test`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) showToast("E-mail de teste enviado!", "success");
            else throw new Error();
        } catch (e) {
            showToast("Erro ao enviar teste", "error");
        }
    };

    const handleSendCampaign = async (id: string) => {
        if (!confirm("Tem certeza que deseja enviar esta campanha para TODOS os inscritos?")) return;
        
        try {
            const res = await fetch(`/api/marketing/campaigns/${id}/send`, { method: "POST" });
            if (res.ok) {
                showToast("Envio iniciado!", "success");
                fetchCampaigns();
            } else throw new Error();
        } catch (e) {
            showToast("Erro ao iniciar envio", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Excluir campanha?")) return;
        try {
            await fetch(`/api/marketing/campaigns?id=${id}`, { method: "DELETE" });
            fetchCampaigns();
            showToast("Campanha excluída", "success");
        } catch (e) {
            showToast("Erro ao excluir", "error");
        }
    };

    // Product Insertion
    const insertProduct = (product: Product) => {
        const productHtml = `
            <div style="border: 1px solid #eee; padding: 16px; margin: 10px 0; text-align: center; border-radius: 8px;">
                <img src="${product.image}" alt="${product.name}" style="max-width: 150px; height: auto; margin-bottom: 10px;" />
                <h3 style="margin: 0; font-size: 16px; color: #333;">${product.name}</h3>
                <p style="font-weight: bold; color: #E60012; font-size: 18px; margin: 8px 0;">${product.price}</p>
                <a href="${window.location.origin}/product/${product.id}" style="display: inline-block; background-color: #E60012; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 8px;">Ver Oferta</a>
            </div>
        `;
        setEditingCampaign((prev: Partial<Campaign>) => ({
            ...prev,
            content: (prev.content || "") + productHtml
        }));
        setShowProductSelector(false);
    };

    // Subscribers Actions
    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/marketing/subscribers");
            if (res.ok) setSubscribers(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubscriber = async (id: string) => {
        if (!confirm("Remover inscrito?")) return;
        try {
            await fetch(`/api/marketing/subscribers?id=${id}`, { method: "DELETE" });
            fetchSubscribers();
            showToast("Inscrito removido", "success");
        } catch (e) {
            showToast("Erro ao remover", "error");
        }
    };

    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const lines = text.split('\n');
        // Assume header: email,name,source
        const newSubscribers = lines.slice(1)
            .filter((line: string) => line.trim())
            .map((line: string) => {
                const [email, name, source] = line.split(',').map((s: string) => s.trim());
                return { email, name, source: source || 'import' };
            })
            .filter((s: { email: string }) => s.email && s.email.includes('@'));

        if (newSubscribers.length === 0) {
            showToast("Nenhum contato válido encontrado no CSV", "error");
            return;
        }

        try {
            const res = await fetch("/api/marketing/subscribers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSubscribers),
            });

            if (res.ok) {
                showToast(`${newSubscribers.length} contatos importados!`, "success");
                fetchSubscribers();
            } else {
                throw new Error();
            }
        } catch (e) {
            showToast("Erro na importação", "error");
        }
        
        // Reset input
        e.target.value = '';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Mail className="text-[#E60012]" />
                    Marketing & Campanhas
                </h2>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView("subscribers")}
                        className={`px-4 py-2 text-sm border rounded-md ${view === 'subscribers' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                    >
                        <Users size={16} className="inline mr-1"/> Inscritos
                    </button>
                    <button 
                        onClick={() => setView("logs")}
                        className={`px-4 py-2 text-sm border rounded-md ${view === 'logs' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                    >
                        Logs
                    </button>
                    <button 
                        onClick={() => {
                            setView("list");
                            fetchCampaigns();
                        }}
                        className={`px-4 py-2 text-sm border rounded-md ${view === 'list' ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'}`}
                    >
                        Campanhas
                    </button>
                    <button 
                            onClick={() => {
                                setView("editor");
                                setEditingCampaign({ title: "", subject: "", content: "", target_audience: "all", scheduled_at: "" });
                            }}
                            className="px-4 py-2 text-sm text-white bg-[#E60012] rounded-md hover:bg-red-700 flex items-center gap-2"
                        >
                            <Plus size={16} /> Nova Campanha
                        </button>
                </div>
            </div>

            {/* LIST VIEW */}
            {view === "list" && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campanha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaigns.map((camp) => (
                                <tr key={camp.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{camp.title}</div>
                                        <div className="text-gray-500 text-sm">{camp.subject}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${camp.status === 'sent' ? 'bg-green-100 text-green-800' : 
                                              camp.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {camp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>Criado: {new Date(camp.created_at).toLocaleDateString()}</div>
                                        {camp.scheduled_at && camp.status === 'scheduled' && (
                                            <div className="text-orange-600 text-xs mt-1">
                                                Agendado: {new Date(camp.scheduled_at).toLocaleString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                        <button onClick={() => handleSendTest(camp.id)} title="Enviar Teste" className="text-blue-600 hover:text-blue-900"><Eye size={18}/></button>
                                        <button onClick={() => handleSendCampaign(camp.id)} title="Enviar" className="text-green-600 hover:text-green-900"><Send size={18}/></button>
                                        <button onClick={() => handleDelete(camp.id)} title="Excluir" className="text-red-600 hover:text-red-900"><Trash size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhuma campanha criada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SUBSCRIBERS VIEW */}
            {view === "subscribers" && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <label className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
                            <FileText size={16} /> Importar CSV
                            <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                        </label>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fonte</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscribers.map((sub) => (
                                    <tr key={sub.id}>
                                        <td className="px-6 py-4 text-sm text-gray-900">{sub.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{sub.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{sub.source}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDeleteSubscriber(sub.id)} className="text-red-600 hover:text-red-900"><Trash size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                                {subscribers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Nenhum inscrito encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* LOGS VIEW */}
            {view === "logs" && (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{log.event}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{log.recipient}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={log.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                                            {log.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* EDITOR VIEW */}
            {view === "editor" && (
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome da Campanha (Interno)</label>
                            <input 
                                type="text" 
                                className="mt-1 w-full px-3 py-2 border rounded-md"
                                value={editingCampaign.title}
                                onChange={e => setEditingCampaign({...editingCampaign, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Assunto do E-mail</label>
                            <input 
                                type="text" 
                                className="mt-1 w-full px-3 py-2 border rounded-md"
                                value={editingCampaign.subject}
                                onChange={e => setEditingCampaign({...editingCampaign, subject: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Conteúdo (HTML)</label>
                            <button 
                                onClick={() => {
                                    if (products.length === 0) fetchProducts();
                                    setShowProductSelector(true);
                                }}
                                className="text-sm text-[#E60012] flex items-center gap-1 hover:underline"
                            >
                                <ShoppingBag size={14} /> Inserir Produto
                            </button>
                        </div>
                        <textarea 
                            rows={15}
                            className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                            value={editingCampaign.content}
                            onChange={e => setEditingCampaign({...editingCampaign, content: e.target.value})}
                            placeholder="<h1>Olá!</h1><p>Escreva seu e-mail aqui...</p>"
                        ></textarea>
                        <p className="text-xs text-gray-500 mt-1">Dica: Você pode usar HTML básico.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button onClick={() => setView("list")} className="px-4 py-2 border rounded-md text-gray-600">Cancelar</button>
                        <button onClick={handleSaveCampaign} className="px-4 py-2 bg-[#E60012] text-white rounded-md hover:bg-red-700">Salvar Campanha</button>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-[#E60012] text-white rounded-t-lg">
                            <h3 className="font-bold">Preview: {editingCampaign.subject || "Sem assunto"}</h3>
                            <button onClick={() => setShowPreview(false)} className="text-white hover:text-gray-200"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
                            <div className="bg-white max-w-[600px] mx-auto shadow-sm rounded-lg overflow-hidden">
                                <div className="bg-[#E60012] p-5 text-center">
                                    <h1 className="text-white text-xl m-0">Balão Castelo</h1>
                                </div>
                                <div className="p-6" dangerouslySetInnerHTML={{ __html: editingCampaign.content || "<p>Conteúdo vazio...</p>" }} />
                                <div className="bg-gray-100 p-4 text-center text-xs text-gray-500">
                                    <p>&copy; {new Date().getFullYear()} Balão Castelo. Todos os direitos reservados.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PRODUCT SELECTOR MODAL */}
            {showProductSelector && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Selecionar Produto</h3>
                            <button onClick={() => setShowProductSelector(false)}><X size={20} /></button>
                        </div>
                        <div className="p-4 border-b">
                            <input 
                                type="text" 
                                placeholder="Buscar produto..." 
                                className="w-full px-3 py-2 border rounded-md"
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {products
                                .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                .map(product => (
                                    <div key={product.id} className="flex items-center gap-4 p-2 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => insertProduct(product)}>
                                        <div className="w-12 h-12 relative flex-shrink-0">
                                            <Image src={product.image} alt={product.name} fill className="object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium line-clamp-1">{product.name}</div>
                                            <div className="text-[#E60012] font-bold">{product.price}</div>
                                        </div>
                                        <Plus size={20} className="text-gray-400" />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
