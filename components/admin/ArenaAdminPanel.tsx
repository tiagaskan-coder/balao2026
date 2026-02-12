"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Trash2, Edit, X, Upload, Zap, Box, Crown, UserPlus } from "lucide-react";

type Seller = {
  id: string;
  nome: string;
  avatar_url: string | null;
  meta_valor: number | null;
  criado_em: string;
};

type Sale = {
  id: string;
  vendedor_id: string;
  valor: number;
  is_google_bonus: boolean;
  criado_em: string;
};

type Challenge = {
  id: string;
  premio_semana: string;
  meta_global: number;
  criado_em: string;
};

export default function ArenaAdminPanel() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [saleValue, setSaleValue] = useState<number | "">("");
  const [googleBonus, setGoogleBonus] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newSeller, setNewSeller] = useState({
    nome: "",
    meta_valor: "",
    avatar_url: ""
  });
  const [challengeForm, setChallengeForm] = useState({
    premio_semana: "",
    meta_global: ""
  });

  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [editingSeller, setEditingSeller] = useState({
    nome: "",
    meta_valor: "",
    avatar_url: ""
  });

  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editingSale, setEditingSale] = useState({
    vendedor_id: "",
    valor: "",
    is_google_bonus: false
  });

  const [editingChallengeId, setEditingChallengeId] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState({
    premio_semana: "",
    meta_global: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const parseError = async (res: Response) => {
    try {
      const data = await res.json();
      return data?.error || "Erro ao salvar dados";
    } catch {
      return "Erro ao salvar dados";
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena?full=1", { cache: "no-store" });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      const data = await res.json();
      setSellers(data.sellers || []);
      setSales(data.salesFeed || []);
      setChallenges(data.challenges || []);
      if (!selectedSellerId && data.sellers?.length) {
        setSelectedSellerId(data.sellers[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const activeChallenge = useMemo(() => challenges[0] || null, [challenges]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      setErrorMessage(null);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "avatars");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.error || "Falha no upload do avatar");
        return;
      }
      if (data.url) {
        setNewSeller((prev) => ({ ...prev, avatar_url: data.url }));
      }
    } finally {
      setUploading(false);
    }
  };

  const createSeller = async () => {
    if (!newSeller.nome) return;
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_seller",
          nome: newSeller.nome,
          avatar_url: newSeller.avatar_url || null,
          meta_valor: newSeller.meta_valor ? Number(newSeller.meta_valor) : null
        })
      });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      setNewSeller({ nome: "", meta_valor: "", avatar_url: "" });
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const startEditSeller = (seller: Seller) => {
    setEditingSellerId(seller.id);
    setEditingSeller({
      nome: seller.nome,
      meta_valor: seller.meta_valor ? String(seller.meta_valor) : "",
      avatar_url: seller.avatar_url || ""
    });
  };

  const saveSeller = async () => {
    if (!editingSellerId) return;
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_seller",
          id: editingSellerId,
          updates: {
            nome: editingSeller.nome,
            avatar_url: editingSeller.avatar_url || null,
            meta_valor: editingSeller.meta_valor ? Number(editingSeller.meta_valor) : null
          }
        })
      });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      setEditingSellerId(null);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const deleteSeller = async (id: string) => {
    if (!confirm("Excluir vendedor e todas as vendas associadas?")) return;
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_seller", id })
      });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const createSale = async () => {
    if (!selectedSellerId || !saleValue) return;
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_sale",
          vendedor_id: selectedSellerId,
          valor: Number(saleValue),
          is_google_bonus: googleBonus
        })
      });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      setSaleValue("");
      setGoogleBonus(false);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const startEditSale = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setEditingSale({
      vendedor_id: sale.vendedor_id,
      valor: String(sale.valor),
      is_google_bonus: sale.is_google_bonus
    });
  };

  const saveSale = async () => {
    if (!editingSaleId) return;
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_sale",
          id: editingSaleId,
          updates: {
            vendedor_id: editingSale.vendedor_id,
            valor: Number(editingSale.valor || 0),
            is_google_bonus: editingSale.is_google_bonus
          }
        })
      });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      setEditingSaleId(null);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const deleteSale = async (id: string) => {
    if (!confirm("Excluir esta venda?")) return;
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_sale", id })
      });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async () => {
    if (!challengeForm.premio_semana || !challengeForm.meta_global) return;
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_challenge",
          premio_semana: challengeForm.premio_semana,
          meta_global: Number(challengeForm.meta_global)
        })
      });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      setChallengeForm({ premio_semana: "", meta_global: "" });
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const startEditChallenge = (challenge: Challenge) => {
    setEditingChallengeId(challenge.id);
    setEditingChallenge({
      premio_semana: challenge.premio_semana,
      meta_global: String(challenge.meta_global)
    });
  };

  const saveChallenge = async () => {
    if (!editingChallengeId) return;
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_challenge",
          id: editingChallengeId,
          updates: {
            premio_semana: editingChallenge.premio_semana,
            meta_global: Number(editingChallenge.meta_global || 0)
          }
        })
      });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      setEditingChallengeId(null);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const deleteChallenge = async (id: string) => {
    if (!confirm("Excluir este desafio?")) return;
    setLoading(true);
    try {
      setErrorMessage(null);
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_challenge", id })
      });
      if (!res.ok) {
        setErrorMessage(await parseError(res));
        return;
      }
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}
      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown className="w-7 h-7" />
            <div>
              <h3 className="text-lg font-bold">Desafio Atual</h3>
              <p className="text-sm opacity-90">
                {activeChallenge ? activeChallenge.premio_semana : "Nenhum desafio ativo"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest opacity-90">Meta Global</div>
            <div className="text-2xl font-bold">
              {activeChallenge ? formatCurrency(activeChallenge.meta_global) : "—"}
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold">
          <UserPlus className="w-5 h-5 text-[#E60012]" />
          Cadastro de Vendedores
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={newSeller.nome}
            onChange={(e) => setNewSeller((prev) => ({ ...prev, nome: e.target.value }))}
            className="border rounded-md px-3 py-2"
            placeholder="Nome do vendedor"
          />
          <input
            value={newSeller.meta_valor}
            onChange={(e) => setNewSeller((prev) => ({ ...prev, meta_valor: e.target.value }))}
            className="border rounded-md px-3 py-2"
            placeholder="Meta individual (R$)"
            type="number"
          />
          <input
            value={newSeller.avatar_url}
            onChange={(e) => setNewSeller((prev) => ({ ...prev, avatar_url: e.target.value }))}
            className="border rounded-md px-3 py-2"
            placeholder="URL do avatar"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-gray-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading ? "Enviando..." : "Upload de Avatar"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />
          </label>
          <button
            onClick={createSeller}
            disabled={loading}
            className="px-4 py-2 bg-[#E60012] text-white rounded-md font-semibold disabled:opacity-50"
          >
            Salvar Vendedor
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold">
          <Box className="w-5 h-5 text-[#E60012]" />
          Vendedores cadastrados
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Vendedor</th>
                <th className="py-2">Meta</th>
                <th className="py-2">Avatar</th>
                <th className="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.id} className="border-t">
                  <td className="py-3">
                    {editingSellerId === seller.id ? (
                      <input
                        value={editingSeller.nome}
                        onChange={(e) => setEditingSeller((prev) => ({ ...prev, nome: e.target.value }))}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      seller.nome
                    )}
                  </td>
                  <td className="py-3">
                    {editingSellerId === seller.id ? (
                      <input
                        value={editingSeller.meta_valor}
                        onChange={(e) => setEditingSeller((prev) => ({ ...prev, meta_valor: e.target.value }))}
                        className="border rounded px-2 py-1 w-32"
                        type="number"
                      />
                    ) : (
                      formatCurrency(Number(seller.meta_valor || 0))
                    )}
                  </td>
                  <td className="py-3">
                    {editingSellerId === seller.id ? (
                      <input
                        value={editingSeller.avatar_url}
                        onChange={(e) => setEditingSeller((prev) => ({ ...prev, avatar_url: e.target.value }))}
                        className="border rounded px-2 py-1 w-64"
                      />
                    ) : (
                      <span className="text-xs text-gray-500 truncate block max-w-[240px]">
                        {seller.avatar_url || "—"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {editingSellerId === seller.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={saveSeller} className="p-2 text-green-600 hover:bg-green-50 rounded">
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingSellerId(null)} className="p-2 text-gray-500 hover:bg-gray-50 rounded">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEditSeller(seller)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteSeller(seller.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {sellers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    Nenhum vendedor cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold">
          <Zap className="w-5 h-5 text-[#E60012]" />
          Lançamento de Vendas
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedSellerId}
            onChange={(e) => setSelectedSellerId(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Selecione o vendedor</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.nome}
              </option>
            ))}
          </select>
          <input
            value={saleValue}
            onChange={(e) => setSaleValue(e.target.value === "" ? "" : Number(e.target.value))}
            className="border rounded-md px-3 py-2"
            placeholder="Valor da venda"
            type="number"
          />
          <button
            onClick={() => setGoogleBonus((prev) => !prev)}
            className={`px-4 py-2 rounded-md font-semibold flex items-center justify-center gap-2 ${
              googleBonus ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"
            }`}
          >
            <Zap className="w-4 h-4" />
            Qualificação Google +100
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total com bônus:{" "}
            <span className="font-semibold text-gray-900">
              {formatCurrency(Number(saleValue || 0) + (googleBonus ? 100 : 0))}
            </span>
          </div>
          <button
            onClick={createSale}
            disabled={loading}
            className="px-5 py-2 bg-[#E60012] text-white rounded-md font-semibold disabled:opacity-50"
          >
            Registrar Venda
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold">
          <Box className="w-5 h-5 text-[#E60012]" />
          Vendas lançadas
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Vendedor</th>
                <th className="py-2">Valor</th>
                <th className="py-2">Google</th>
                <th className="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t">
                  <td className="py-3">
                    {editingSaleId === sale.id ? (
                      <select
                        value={editingSale.vendedor_id}
                        onChange={(e) => setEditingSale((prev) => ({ ...prev, vendedor_id: e.target.value }))}
                        className="border rounded px-2 py-1"
                      >
                        {sellers.map((seller) => (
                          <option key={seller.id} value={seller.id}>
                            {seller.nome}
                          </option>
                        ))}
                      </select>
                    ) : (
                      sellers.find((s) => s.id === sale.vendedor_id)?.nome || "—"
                    )}
                  </td>
                  <td className="py-3">
                    {editingSaleId === sale.id ? (
                      <input
                        value={editingSale.valor}
                        onChange={(e) => setEditingSale((prev) => ({ ...prev, valor: e.target.value }))}
                        className="border rounded px-2 py-1 w-28"
                        type="number"
                      />
                    ) : (
                      formatCurrency(Number(sale.valor || 0))
                    )}
                  </td>
                  <td className="py-3">
                    {editingSaleId === sale.id ? (
                      <button
                        onClick={() =>
                          setEditingSale((prev) => ({ ...prev, is_google_bonus: !prev.is_google_bonus }))
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          editingSale.is_google_bonus ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {editingSale.is_google_bonus ? "Sim" : "Não"}
                      </button>
                    ) : sale.is_google_bonus ? (
                      <span className="text-blue-600 font-semibold">Sim</span>
                    ) : (
                      "Não"
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {editingSaleId === sale.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={saveSale} className="p-2 text-green-600 hover:bg-green-50 rounded">
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingSaleId(null)} className="p-2 text-gray-500 hover:bg-gray-50 rounded">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEditSale(sale)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteSale(sale.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    Nenhuma venda lançada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold">
          <Crown className="w-5 h-5 text-[#E60012]" />
          Configuração de Desafios
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={challengeForm.premio_semana}
            onChange={(e) => setChallengeForm((prev) => ({ ...prev, premio_semana: e.target.value }))}
            className="border rounded-md px-3 py-2"
            placeholder="Prêmio da semana"
          />
          <input
            value={challengeForm.meta_global}
            onChange={(e) => setChallengeForm((prev) => ({ ...prev, meta_global: e.target.value }))}
            className="border rounded-md px-3 py-2"
            placeholder="Meta global (R$)"
            type="number"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={createChallenge}
            disabled={loading}
            className="px-4 py-2 bg-[#E60012] text-white rounded-md font-semibold disabled:opacity-50"
          >
            Lançar Desafio
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-gray-800 font-bold">
          <Crown className="w-5 h-5 text-[#E60012]" />
          Desafios lançados
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Prêmio</th>
                <th className="py-2">Meta</th>
                <th className="py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((challenge) => (
                <tr key={challenge.id} className="border-t">
                  <td className="py-3">
                    {editingChallengeId === challenge.id ? (
                      <input
                        value={editingChallenge.premio_semana}
                        onChange={(e) => setEditingChallenge((prev) => ({ ...prev, premio_semana: e.target.value }))}
                        className="border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      challenge.premio_semana
                    )}
                  </td>
                  <td className="py-3">
                    {editingChallengeId === challenge.id ? (
                      <input
                        value={editingChallenge.meta_global}
                        onChange={(e) => setEditingChallenge((prev) => ({ ...prev, meta_global: e.target.value }))}
                        className="border rounded px-2 py-1 w-32"
                        type="number"
                      />
                    ) : (
                      formatCurrency(Number(challenge.meta_global || 0))
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {editingChallengeId === challenge.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={saveChallenge} className="p-2 text-green-600 hover:bg-green-50 rounded">
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingChallengeId(null)} className="p-2 text-gray-500 hover:bg-gray-50 rounded">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEditChallenge(challenge)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteChallenge(challenge.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {challenges.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">
                    Nenhum desafio lançado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
