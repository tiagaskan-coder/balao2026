"use client";

import React, { useState } from "react";
import { User, MapPin, Phone, Mail, Search, Check, AlertCircle, ArrowLeft } from "lucide-react";
import { usePdv } from "../store";

export default function CustomerForm() {
  const { state, dispatch } = usePdv();
  const [loadingCep, setLoadingCep] = useState(false);

  const handleChange = (field: string, value: string) => {
    dispatch({
      type: "SET_CUSTOMER",
      payload: { ...state.customer, [field]: value }
    });
  };

  const handleCepBlur = async () => {
    const cep = state.customer.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        dispatch({
          type: "SET_CUSTOMER",
          payload: {
            ...state.customer,
            address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
            cep: data.cep
          }
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
        <User className="text-red-600" />
        Dados do Cliente
      </h2>
      
      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
        {/* Nome / Razão Social */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo / Razão Social *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={state.customer.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full pl-9 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Nome do cliente"
            />
          </div>
        </div>

        {/* CPF / CNPJ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ *</label>
          <input
            type="text"
            value={state.customer.cpf_cnpj}
            onChange={(e) => handleChange("cpf_cnpj", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="000.000.000-00"
          />
        </div>

        {/* Contato */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={state.customer.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full pl-9 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={state.customer.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full pl-9 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="cliente@email.com"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <div className="relative">
            <input
              type="text"
              value={state.customer.cep}
              onChange={(e) => handleChange("cep", e.target.value)}
              onBlur={handleCepBlur}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="00000-000"
            />
            {loadingCep && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <textarea
              value={state.customer.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full pl-9 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none min-h-[80px] resize-none"
              placeholder="Rua, Número, Bairro, Cidade - UF"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p>Preencha os dados corretamente para emissão de Nota Fiscal. O CPF/CNPJ é obrigatório.</p>
      </div>

      {/* Botões de navegação */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: "cart" })}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          Voltar ao Carrinho
        </button>
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: "payment" })}
          disabled={!state.customer.name || !state.customer.cpf_cnpj}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ir para Pagamento
        </button>
      </div>
    </div>
  );
}
