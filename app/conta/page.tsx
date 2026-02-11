"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { User as UserIcon, Package, LogOut, Loader2 } from "lucide-react";

export default function ContaPage() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Note: Middleware protects this route, but we double check client-side
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/login");
    } else if (user) {
      setIsLoading(false);
    }
  }, [user, router, isLoading]);

  const handleLogout = async () => {
    try {
      await signOut();
      showToast("Você saiu com sucesso.", "success");
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
      showToast("Erro ao sair", "error");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#E60012]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header of Dashboard */}
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-red-100 p-3 rounded-full text-[#E60012]">
                        <UserIcon size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Minha Conta</h2>
                        <p className="text-gray-600 break-all">{user.email}</p>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors w-full md:w-auto justify-center"
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Orders Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Package className="text-[#E60012]" size={24} />
                        <h3 className="text-xl font-bold text-gray-900">Meus Pedidos</h3>
                    </div>
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p>Você ainda não possui pedidos recentes.</p>
                        <Link href="/" className="text-[#E60012] font-bold hover:underline mt-2 inline-block">
                            Ir às compras
                        </Link>
                    </div>
                </div>

                {/* Personal Info Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <UserIcon className="text-[#E60012]" size={24} />
                        <h3 className="text-xl font-bold text-gray-900">Dados Pessoais</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Email</label>
                            <p className="mt-1 text-gray-900 font-medium break-all">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">ID do Usuário</label>
                            <p className="mt-1 text-gray-900 font-medium text-xs font-mono bg-gray-100 p-2 rounded break-all">{user.id}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Último Acesso</label>
                            <p className="mt-1 text-gray-900 font-medium">{new Date(user.last_sign_in_at || "").toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
