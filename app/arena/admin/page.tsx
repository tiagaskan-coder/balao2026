"use client";

import { useState } from "react";
import ArenaAdminPanel from "@/components/admin/ArenaAdminPanel";
import { Lock } from "lucide-react";

export default function ArenaAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "56676009ddmmyyyy") {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-[#E60012]">Arena</span> Admin
          </h1>
          <ArenaAdminPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-50 rounded-full">
            <Lock className="w-8 h-8 text-[#E60012]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Acesso Restrito
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E60012] focus:border-[#E60012] outline-none transition-all"
              placeholder="Digite a senha..."
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">
              Senha incorreta. Tente novamente.
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-[#E60012] text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
