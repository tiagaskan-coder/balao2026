"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError("Senha incorreta");
      }
    } catch (err) {
      setError("Erro ao tentar fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-[#E60012]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Acesso Administrativo</h1>
          <p className="text-gray-500 mt-2">Digite a senha para continuar</p>
          
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg text-left">
            <p className="mb-2"><strong>Atenção:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Usuários logados como <strong>balaocastelo@gmail.com</strong> têm acesso automático.</li>
              <li>Outros usuários devem informar a senha do dia: <strong>56676009 + data (ddmmyyyy)</strong>.</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E60012] focus:border-transparent transition-colors"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E60012] text-white py-3 rounded-lg font-semibold hover:bg-[#cc0010] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
