"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { UsedNotebook } from "@/lib/utils";
import { Lock, Unlock, Laptop2, Trash2, Edit2, Save, Plus, X } from "lucide-react";

function buildDynamicPassword(date: Date) {
  const prefix = "56676009";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${prefix}${dd}${mm}${yyyy}`;
}

function parseNumber(value: string): number {
  const normalized = value.replace(/[^\d,\.]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isNaN(n) ? 0 : n;
}

export default function SeminovosAdminPage() {
  const [inputPassword, setInputPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [items, setItems] = useState<UsedNotebook[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<UsedNotebook>>({
    name: "",
    model: "",
    processor: "",
    ram: "",
    storage: "",
    gpu: "",
    battery: "",
    price: 0,
    cart_url: "",
    image_urls: [],
    video_url: "",
    highlight: false,
  });

  const todayPassword = useMemo(() => buildDynamicPassword(new Date()), []);

  useEffect(() => {
    if (unlocked) {
      void fetchItems();
    }
  }, [unlocked]);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/seminovos");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inputPassword.trim() === todayPassword) {
      setUnlocked(true);
    } else {
      alert("Senha inválida para hoje. Verifique o padrão e a data.");
    }
  }

  function resetForm() {
    setForm({
      name: "",
      model: "",
      processor: "",
      ram: "",
      storage: "",
      gpu: "",
      battery: "",
      price: 0,
      cart_url: "",
      image_urls: [],
      video_url: "",
      highlight: false,
    });
    setEditingId(null);
  }

  function handleChange(
    field: keyof UsedNotebook,
    value: string | number | boolean | string[]
  ) {
    if (field === "image_urls" && typeof value === "string") {
      const parts = value
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);
      setForm((prev) => ({ ...prev, image_urls: parts }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function currentImagesText() {
    return (form.image_urls || []).join("\n");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.model || !form.processor || !form.ram || !form.storage) {
      alert("Preencha pelo menos Nome, Modelo, Processador, RAM e Armazenamento.");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<UsedNotebook> = {
        ...form,
        price: typeof form.price === "number" ? form.price : parseNumber(String(form.price || 0)),
      };

      const isEditing = Boolean(editingId);
      const url = isEditing ? `/api/seminovos/${editingId}` : "/api/seminovos";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Erro ao salvar o notebook. Verifique o console para detalhes.");
        return;
      }

      await fetchItems();
      resetForm();
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item: UsedNotebook) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      model: item.model,
      processor: item.processor,
      ram: item.ram,
      storage: item.storage,
      gpu: item.gpu || "",
      battery: item.battery,
      price: item.price,
      cart_url: item.cart_url,
      image_urls: item.image_urls || [],
      video_url: item.video_url || "",
      highlight: item.highlight ?? false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;
    try {
      const res = await fetch(`/api/seminovos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Erro ao excluir. Veja detalhes no console.");
        return;
      }
      await fetchItems();
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao excluir.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Laptop2 className="text-[#E60012]" />
                Painel de Seminovos
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                Acesso protegido por senha dinâmica. Use 56676009 + data de hoje (ddmmyyyy).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {unlocked ? (
                <>
                  <Unlock className="text-emerald-500" size={18} />
                  <span>Acesso liberado</span>
                </>
              ) : (
                <>
                  <Lock className="text-gray-400" size={18} />
                  <span>Restrito</span>
                </>
              )}
            </div>
          </div>

          {!unlocked && (
            <form
              onSubmit={handlePasswordSubmit}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5 space-y-3"
            >
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Digite a senha dinâmica de hoje
              </label>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E60012]/60 focus:border-[#E60012]"
                placeholder="56676009 + ddmmyyyy"
              />
              <button
                type="submit"
                className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#E60012] text-white text-xs font-semibold shadow hover:bg-red-700 transition-colors"
              >
                Liberar acesso
              </button>
            </form>
          )}

          {unlocked && (
            <div className="space-y-8 mt-4">
              <form
                onSubmit={handleSave}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-5 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-2">
                    {editingId ? "Editar notebook seminovo" : "Cadastrar novo notebook seminovo"}
                  </h2>
                  <div className="flex items-center gap-2">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-300 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        <X size={12} />
                        Cancelar edição
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#E60012] text-white text-xs font-semibold shadow hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        "Salvando..."
                      ) : (
                        <>
                          {editingId ? <Save size={14} /> : <Plus size={14} />}
                          {editingId ? "Salvar alterações" : "Adicionar anúncio"}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Nome do anúncio
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        value={form.name || ""}
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Modelo / Linha
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        value={form.model || ""}
                        onChange={(e) => handleChange("model", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Processador
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        value={form.processor || ""}
                        onChange={(e) => handleChange("processor", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          RAM
                        </label>
                        <input
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          value={form.ram || ""}
                          onChange={(e) => handleChange("ram", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          SSD / HD
                        </label>
                        <input
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                          value={form.storage || ""}
                          onChange={(e) => handleChange("storage", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Placa de vídeo (opcional)
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        value={form.gpu || ""}
                        onChange={(e) => handleChange("gpu", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Detalhes da bateria
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        value={form.battery || ""}
                        onChange={(e) => handleChange("battery", e.target.value)}
                        placeholder="Ex: segura 2h a 3h de uso moderado"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Preço (R$)
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        value={form.price ?? ""}
                        onChange={(e) => handleChange("price", e.target.value)}
                        placeholder="Ex: 2499,00"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Link do carrinho / checkout
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        value={form.cart_url || ""}
                        onChange={(e) => handleChange("cart_url", e.target.value)}
                        placeholder="/carrinho?produto=..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        URLs de imagens (uma por linha) - primeira será a principal
                      </label>
                      <textarea
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs h-20"
                        value={currentImagesText()}
                        onChange={(e) => handleChange("image_urls", e.target.value)}
                        placeholder="https://...imagem1.jpg&#10;https://...imagem2.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        URL do vídeo (mp4/webm leve)
                      </label>
                      <input
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        value={form.video_url || ""}
                        onChange={(e) => handleChange("video_url", e.target.value)}
                        placeholder="https://...video.mp4"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm md:text-base font-semibold text-gray-800">
                    Anúncios cadastrados
                  </h2>
                  {loading && (
                    <span className="text-[11px] text-gray-500">Carregando anúncios...</span>
                  )}
                </div>
                {items.length === 0 ? (
                  <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded-2xl p-4 text-center">
                    Nenhum notebook seminovo cadastrado ainda.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {item.name}
                            </p>
                            {item.highlight && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                                Destaque
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {item.model} • {item.processor} • {item.ram} • {item.storage}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Bateria: {item.battery} • Preço: R${" "}
                            {item.price.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

