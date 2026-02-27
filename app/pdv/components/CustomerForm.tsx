"use client";

import React, { useState } from "react";
import { usePdv } from "../store";
import { ArrowLeft, Check, Search } from "lucide-react";

export default function CustomerForm({ onBack, onNext }: { onBack: () => void, onNext: () => void }) {
  const { state, dispatch } = usePdv();
  const [formData, setFormData] = useState(state.customer);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlurCep = async () => {
    if (formData.address.zip.length >= 8) {
      setLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${formData.address.zip}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: data.logradouro,
              neighborhood: data.bairro,
              city: data.localidade,
              state: data.uf
            }
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_CUSTOMER", payload: formData });
    dispatch({ type: "SET_STEP", payload: "payment" });
    onNext();
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 shadow-xl w-full max-w-md ml-auto">
      <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-2">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Dados do Cliente</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ *</label>
          <input
            required
            name="cpf_cnpj"
            value={formData.cpf_cnpj}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nome do cliente"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="cliente@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone/WhatsApp *</label>
            <input
              required
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-2">
          <h3 className="font-medium text-gray-900 mb-3">Endereço</h3>
          
          <div className="flex gap-2 mb-3">
            <div className="w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
              <div className="relative">
                <input
                  required
                  name="address.zip"
                  value={formData.address.zip}
                  onChange={handleChange}
                  onBlur={handleBlurCep}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="00000-000"
                />
                {loading && <div className="absolute right-2 top-2.5 animate-spin w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>}
              </div>
            </div>
            <div className="flex-1">
               <label className="block text-sm font-medium text-gray-700 mb-1">Cidade/UF</label>
               <input
                 disabled
                 value={`${formData.address.city || ''} ${formData.address.state ? '- ' + formData.address.state : ''}`}
                 className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-gray-500"
               />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro *</label>
            <input
              required
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input
                required
                name="address.number"
                value={formData.address.number}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
              <input
                required
                name="address.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Check size={20} />
          Ir para Pagamento
        </button>
      </form>
    </div>
  );
}
