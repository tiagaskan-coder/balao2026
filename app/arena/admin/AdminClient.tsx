'use client';

import { useState } from 'react';
import { Vendedor, ArenaConfig, VEICULOS_DISPONIVEIS } from '../types';
import { criarVendedor, atualizarVendedor, removerVendedor, resetarVendas, toggleArena, atualizarTitulo } from '../actions';
import { Trash2, Edit, Plus, Save, Trophy, Car, RotateCcw, Power, X } from 'lucide-react';

export default function AdminClient({ 
  vendedoresIniciais, 
  configInicial 
}: { 
  vendedoresIniciais: Vendedor[], 
  configInicial: ArenaConfig | null 
}) {
  const [vendedores] = useState(vendedoresIniciais);
  const [config] = useState(configInicial);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<Vendedor | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(configInicial?.titulo || '');

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [veiculoEmoji, setVeiculoEmoji] = useState('🚗');
  const [metaValor, setMetaValor] = useState(1000);
  const [vendasAtual, setVendasAtual] = useState(0);

  const openModal = (vendedor?: Vendedor) => {
    if (vendedor) {
      setEditingVendedor(vendedor);
      setNome(vendedor.nome);
      setAvatarUrl(vendedor.avatar_url || '');
      setVeiculoEmoji(vendedor.veiculo_emoji);
      setMetaValor(vendedor.meta_valor);
      setVendasAtual(vendedor.vendas_atual);
    } else {
      setEditingVendedor(null);
      setNome('');
      setAvatarUrl('');
      setVeiculoEmoji('🚗');
      setMetaValor(1000);
      setVendasAtual(0);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('avatar_url', avatarUrl);
    formData.append('veiculo_emoji', veiculoEmoji);
    formData.append('meta_valor', metaValor.toString());
    formData.append('vendas_atual', vendasAtual.toString());

    try {
      if (editingVendedor) {
        await atualizarVendedor(editingVendedor.id, formData);
      } else {
        await criarVendedor(formData);
      }
      setIsModalOpen(false);
      // Otimista ou recarregar via props (Next.js server actions revalidam o path, então props serão atualizadas se o pai for server component)
      // Como estamos num Client Component que recebe props iniciais, o router.refresh() seria ideal, 
      // mas vamos confiar que o Next.js 16 lida com a revalidação e apenas fechar o modal.
      // Para feedback imediato sem refresh completo da página, poderíamos gerenciar estado local,
      // mas vamos simplificar.
      window.location.reload(); // Força atualização para ver dados novos
    } catch (error) {
      alert('Erro ao salvar: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este vendedor?')) return;
    setLoading(true);
    try {
      await removerVendedor(id);
      window.location.reload();
    } catch (error) {
      alert('Erro ao remover: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Isso irá ZERAR as vendas de TODOS os vendedores. Continuar?')) return;
    setLoading(true);
    try {
      await resetarVendas();
      window.location.reload();
    } catch (error) {
      alert('Erro: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArena = async () => {
    setLoading(true);
    try {
      await toggleArena(!config?.ativo);
      window.location.reload();
    } catch (error) {
      alert('Erro: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      await atualizarTitulo(newTitle);
      setIsEditingTitle(false);
      window.location.reload();
    } catch (error) {
      alert('Erro: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Trophy className="w-8 h-8 text-yellow-500" />
              {isEditingTitle ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-lg font-bold"
                  />
                  <button onClick={handleUpdateTitle} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsEditingTitle(false)} className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                  {config?.titulo || 'Administração da Arena'}
                  <Edit className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h1>
              )}
            </div>
            <p className="text-gray-500">Gerencie vendedores e controle a corrida</p>
          </div>
          
          <div className="flex gap-4">
             <button
              onClick={handleToggleArena}
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                config?.ativo 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
              }`}
            >
              <Power className="w-5 h-5" />
              {config?.ativo ? 'Parar Corrida' : 'Iniciar Corrida'}
            </button>
            
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold border border-gray-200 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Resetar Vendas
            </button>
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-500" />
              Pilotos Cadastrados
            </h2>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm shadow-blue-200"
            >
              <Plus className="w-5 h-5" />
              Novo Piloto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium text-sm uppercase tracking-wider">
                <tr>
                  <th className="p-4 border-b">Piloto</th>
                  <th className="p-4 border-b">Veículo</th>
                  <th className="p-4 border-b text-right">Meta</th>
                  <th className="p-4 border-b text-right">Vendas</th>
                  <th className="p-4 border-b text-right">Progresso</th>
                  <th className="p-4 border-b text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendedores.map((v) => {
                  const progresso = v.meta_valor > 0 ? (v.vendas_atual / v.meta_valor) * 100 : 0;
                  return (
                    <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                          {v.avatar_url ? (
                            <img src={v.avatar_url} alt={v.nome} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg bg-gray-100">
                              {v.nome.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="font-semibold text-gray-700">{v.nome}</span>
                      </td>
                      <td className="p-4 text-2xl">{v.veiculo_emoji}</td>
                      <td className="p-4 text-right font-mono text-gray-600">R$ {v.meta_valor.toLocaleString('pt-BR')}</td>
                      <td className="p-4 text-right font-mono font-bold text-gray-800">R$ {v.vendas_atual.toLocaleString('pt-BR')}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm font-medium text-gray-600">{progresso.toFixed(1)}%</span>
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${progresso >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min(progresso, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(v)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {vendedores.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-400">
                      Nenhum piloto cadastrado. Clique em "Novo Piloto" para começar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">
                {editingVendedor ? 'Editar Piloto' : 'Novo Piloto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Piloto</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta (R$)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={metaValor}
                    onChange={e => setMetaValor(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendas Atuais (R$)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={vendasAtual}
                    onChange={e => setVendasAtual(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Veículo</label>
                <div className="grid grid-cols-6 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {VEICULOS_DISPONIVEIS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setVeiculoEmoji(emoji)}
                      className={`text-2xl p-2 rounded hover:bg-white hover:shadow-sm transition-all ${
                        veiculoEmoji === emoji ? 'bg-white shadow-md ring-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL (Opcional)</label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="https://..."
                  />
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-300">
                    {avatarUrl && <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Cole o link de uma imagem quadrada.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-200 transition-all flex items-center gap-2"
                >
                  {loading ? 'Salvando...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Piloto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
