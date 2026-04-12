"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Mail, Calendar, Send, Plus, Trash, Search, Eye, 
  BarChart, Users, Settings, FileText, ShoppingBag, X,
  LayoutTemplate, Smartphone, Monitor, CheckCircle, AlertCircle, Upload
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";
import { generateEmailHtml, EMAIL_TEMPLATES, TemplateType, EmailTemplateProduct } from "@/lib/email-templates";

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
    const [editingCampaign, setEditingCampaign] = useState<{
        title: string;
        subject: string;
        message: string;
        target_audience: string;
        scheduled_at: string;
        template: TemplateType;
    }>({
        title: "",
        subject: "",
        message: "",
        target_audience: "all",
        scheduled_at: "",
        template: "grid"
    });

    // Products State for Editor
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState("");

    // Preview State
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

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
            if (res.ok) {
                const data = await res.json();
                const normalizedProducts = data.map((p: any) => ({
                    ...p,
                    price: typeof p.price === 'number' 
                        ? p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                        : p.price
                }));
                setProducts(normalizedProducts);
            }
        } catch (error) {
            console.error(error);
            showToast("Erro ao carregar produtos", "error");
        }
    };

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

    // Live Preview Generation
    const generatedHtml = useMemo(() => {
        const templateProducts: EmailTemplateProduct[] = selectedProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            link: `${typeof window !== 'undefined' ? window.location.origin : ''}/product/${p.id}`,
            description: p.category
        }));

        return generateEmailHtml(editingCampaign.template, {
            subject: editingCampaign.subject || "Sem Assunto",
            message: editingCampaign.message,
            products: templateProducts,
            logoUrl: "https://balao2026.vercel.app/logo-white.png", 
            primaryColor: "#E60012",
            companyName: "Balão da Informática"
        });
    }, [editingCampaign, selectedProducts]);

    // Actions
    const handleSaveCampaign = async () => {
        if (!editingCampaign.title || !editingCampaign.subject) {
            showToast("Preencha título e assunto", "error");
            return;
        }

        const campaignData = {
            ...editingCampaign,
            content: generatedHtml
        };

        try {
            const res = await fetch("/api/marketing/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(campaignData),
            });

            if (!res.ok) throw new Error("Erro ao salvar");

            showToast("Campanha salva com sucesso!", "success");
            setView("list");
            setEditingCampaign({ title: "", subject: "", message: "", target_audience: "all", scheduled_at: "", template: "grid" });
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

    const handleDeleteCampaign = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta campanha?")) return;
        try {
            const res = await fetch(`/api/marketing/campaigns?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Campanha excluída", "success");
                fetchCampaigns();
            }
        } catch (e) {
            showToast("Erro ao excluir", "error");
        }
    };

    const handleDeleteSubscriber = async (email: string) => {
        if (!confirm("Remover este inscrito?")) return;
        try {
            const res = await fetch(`/api/marketing/subscribers?email=${email}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Inscrito removido", "success");
                fetchSubscribers();
            }
        } catch (e) {
            showToast("Erro ao remover inscrito", "error");
        }
    };

    const handleImportSubscribers = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csv = event.target?.result as string;
            const lines = csv.split('\n').filter(line => line.trim() !== '');
            // Assume first line is header or just emails
            const emails = lines.map(line => {
                const parts = line.split(',');
                // Tenta achar algo que pareça um email
                return parts.find(p => p.includes('@'))?.trim() || parts[0].trim();
            }).filter(e => e.includes('@'));

            if (emails.length === 0) {
                showToast("Nenhum email válido encontrado", "error");
                return;
            }

            try {
                const res = await fetch("/api/marketing/subscribers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ emails }),
                });

                if (res.ok) {
                    showToast(`${emails.length} inscritos importados`, "success");
                    fetchSubscribers();
                }
            } catch (error) {
                showToast("Erro na importação", "error");
            }
        };
        reader.readAsText(file);
    };

    const toggleProductSelection = (product: Product) => {
        if (selectedProducts.some(p => p.id === product.id)) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Mail className="text-[#E60012]" />
                        Marketing Center
                    </h2>
                    <p className="text-sm text-gray-500">Gerencie campanhas, listas e automações</p>
                </div>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    {[
                        { id: 'list', label: 'Campanhas', icon: BarChart },
                        { id: 'editor', label: 'Criar Nova', icon: Plus },
                        { id: 'subscribers', label: 'Inscritos', icon: Users },
                        { id: 'logs', label: 'Logs', icon: FileText }
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => {
                                setView(tab.id as any);
                                if (tab.id === 'editor') {
                                    setEditingCampaign({ title: "", subject: "", message: "", target_audience: "all", scheduled_at: "", template: "grid" });
                                    setSelectedProducts([]);
                                }
                            }}
                            className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 transition-all ${
                                view === tab.id 
                                ? 'bg-white text-[#E60012] shadow-sm font-medium' 
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {/* VIEW: LIST */}
                {view === "list" && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Minhas Campanhas</h3>
                            <button 
                                onClick={() => setView('editor')}
                                className="text-xs bg-[#E60012] text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                            >
                                <Plus size={14} /> Nova Campanha
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4">
                            {loading ? (
                                <div className="text-center py-10 text-gray-500">Carregando...</div>
                            ) : campaigns.length === 0 ? (
                                <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                                    <Mail size={48} className="mb-2 opacity-20" />
                                    <p>Nenhuma campanha criada ainda.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {campaigns.map((campaign) => (
                                        <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-gray-800">{campaign.title}</h4>
                                                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${
                                                        campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                                                        campaign.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {campaign.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">Assunto: {campaign.subject}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(campaign.created_at).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Users size={12} /> {campaign.target_audience === 'all' ? 'Todos' : campaign.target_audience}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleSendTest(campaign.id)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg tooltip"
                                                    title="Enviar Teste"
                                                >
                                                    <Send size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg tooltip"
                                                    title="Excluir"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW: EDITOR */}
                {view === "editor" && (
                    <div className="flex h-full gap-6">
                        {/* LEFT COLUMN: CONTROLS */}
                        <div className="w-1/2 overflow-y-auto pr-2 space-y-6 pb-20">
                            {/* Card 1: Configurações Básicas */}
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Settings size={18} className="text-[#E60012]" /> Configurações
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Título Interno</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all"
                                            placeholder="Ex: Promoção de Natal 2026"
                                            value={editingCampaign.title}
                                            onChange={e => setEditingCampaign({...editingCampaign, title: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Assunto do E-mail</label>
                                        <input 
                                            type="text" 
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all"
                                            placeholder="Ex: Ofertas Imperdíveis para Você!"
                                            value={editingCampaign.subject}
                                            onChange={e => setEditingCampaign({...editingCampaign, subject: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Mensagem Principal</label>
                                        <textarea 
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all h-24 resize-none"
                                            placeholder="Digite uma mensagem introdutória..."
                                            value={editingCampaign.message}
                                            onChange={e => setEditingCampaign({...editingCampaign, message: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: Conteúdo e Template */}
                            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <LayoutTemplate size={18} className="text-[#E60012]" /> Aparência & Conteúdo
                                </h3>
                                
                                <div className="mb-6">
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Selecione um Template</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {EMAIL_TEMPLATES.map(t => (
                                            <div 
                                                key={t.id}
                                                onClick={() => setEditingCampaign({...editingCampaign, template: t.id})}
                                                className={`cursor-pointer border rounded-lg p-3 hover:bg-gray-50 transition-all ${
                                                    editingCampaign.template === t.id 
                                                    ? 'border-[#E60012] bg-red-50 ring-1 ring-[#E60012]' 
                                                    : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="font-medium text-sm text-gray-900">{t.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{t.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-xs font-medium text-gray-500 uppercase">
                                            Produtos Selecionados ({selectedProducts.length})
                                        </label>
                                        <button 
                                            onClick={() => {
                                                setShowProductSelector(true);
                                                fetchProducts();
                                            }}
                                            className="text-xs px-3 py-1.5 bg-[#E60012] text-white rounded hover:bg-red-700 flex items-center gap-1 transition-colors shadow-sm"
                                        >
                                            <Plus size={14} /> Adicionar Produtos
                                        </button>
                                    </div>
                                    
                                    {selectedProducts.length > 0 && (
                                        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2 bg-gray-50">
                                            {selectedProducts.map(p => (
                                                <div key={p.id} className="flex items-center gap-3 bg-white p-2 rounded border border-gray-100">
                                                    <div className="w-10 h-10 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                        <Image src={p.image} alt={p.name} fill className="object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium truncate">{p.name}</p>
                                                        <p className="text-xs text-[#E60012] font-bold">{p.price}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleProductSelection(p)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={handleSaveCampaign}
                                    className="flex-1 py-3 bg-gray-900 text-white rounded-lg hover:bg-black font-medium shadow-md transition-transform active:scale-95 flex justify-center items-center gap-2"
                                >
                                    <Send size={18} /> Salvar & Preparar Envio
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: LIVE PREVIEW */}
                        <div className="w-1/2 flex flex-col bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
                            <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-700">
                                <div className="flex items-center gap-2 text-white">
                                    <Eye size={18} className="text-blue-400" />
                                    <span className="font-medium text-sm">Live Preview</span>
                                </div>
                                <div className="flex bg-gray-800 rounded-lg p-1">
                                    <button 
                                        onClick={() => setPreviewMode('desktop')}
                                        className={`p-1.5 rounded ${previewMode === 'desktop' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                                        title="Desktop"
                                    >
                                        <Monitor size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setPreviewMode('mobile')}
                                        className={`p-1.5 rounded ${previewMode === 'mobile' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                                        title="Mobile"
                                    >
                                        <Smartphone size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 bg-gray-200 relative overflow-hidden flex justify-center items-start p-8 overflow-y-auto">
                                <div 
                                    className={`bg-white shadow-xl transition-all duration-300 overflow-hidden ${
                                        previewMode === 'mobile' ? 'w-[375px] rounded-3xl min-h-[667px]' : 'w-[600px] rounded-lg min-h-[600px]'
                                    }`}
                                >
                                    <iframe 
                                        srcDoc={generatedHtml} 
                                        className="w-full h-full min-h-[600px] border-none"
                                        title="Email Preview"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: SUBSCRIBERS */}
                {view === "subscribers" && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Gerenciar Inscritos</h3>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    id="csvImport" 
                                    className="hidden" 
                                    accept=".csv,.txt"
                                    onChange={handleImportSubscribers}
                                />
                                <label 
                                    htmlFor="csvImport"
                                    className="cursor-pointer text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                >
                                    <Upload size={14} /> Importar CSV
                                </label>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {subscribers.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">Nenhum inscrito encontrado.</div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Data Inscrição</th>
                                            <th className="px-4 py-3 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((sub: any) => (
                                            <tr key={sub.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{sub.email}</td>
                                                <td className="px-4 py-3 text-gray-500">{new Date(sub.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteSubscriber(sub.email)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW: LOGS */}
                {view === "logs" && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Logs de Envio</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {logs.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">Nenhum log registrado.</div>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map((log: any) => (
                                        <div key={log.id} className="p-3 border rounded-lg bg-gray-50 text-sm font-mono flex justify-between items-center">
                                            <div>
                                                <span className={`font-bold ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                    [{log.status.toUpperCase()}]
                                                </span>
                                                <span className="ml-2 text-gray-700">{log.message}</span>
                                            </div>
                                            <div className="text-gray-400 text-xs">
                                                {new Date(log.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PRODUCT SELECTOR MODAL */}
                {showProductSelector && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                    <ShoppingBag className="text-[#E60012]" /> Selecionar Produtos
                                </h3>
                                <button onClick={() => setShowProductSelector(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-4 border-b bg-white sticky top-0 z-10">
                                <div className="relative max-w-md mx-auto">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nome, categoria ou código..." 
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#E60012] focus:border-transparent outline-none transition-all"
                                        value={productSearch}
                                        onChange={e => setProductSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {products
                                        .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                                        .slice(0, 50)
                                        .map(product => {
                                            const isSelected = selectedProducts.some(p => p.id === product.id);
                                            return (
                                                <div 
                                                    key={product.id} 
                                                    className={`
                                                        group relative bg-white border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md
                                                        ${isSelected ? 'ring-2 ring-[#E60012] border-transparent' : 'border-gray-200 hover:border-gray-300'}
                                                    `}
                                                    onClick={() => toggleProductSelection(product)}
                                                >
                                                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                                        {product.image ? (
                                                            <Image 
                                                                src={product.image} 
                                                                alt={product.name} 
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                <ShoppingBag size={32} />
                                                            </div>
                                                        )}
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 bg-[#E60012] text-white rounded-full p-1 shadow-lg animate-in zoom-in duration-200">
                                                                <CheckCircle size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 h-10 mb-1" title={product.name}>
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-lg font-bold text-[#E60012]">{product.price}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            
                            <div className="p-4 border-t bg-white flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    <span className="font-bold text-gray-900">{selectedProducts.length}</span> produtos selecionados
                                </div>
                                <button 
                                    onClick={() => setShowProductSelector(false)}
                                    className="px-6 py-2 bg-[#E60012] text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                                >
                                    Concluir Seleção
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
