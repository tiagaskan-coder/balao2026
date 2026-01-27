
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Loader2, Chrome, User as UserIcon, Package, LogOut } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { user, signOut } = useAuth();
  const supabase = createClient();

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut();
      showToast("Você saiu com sucesso.", "success");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        });
        if (error) throw error;

        // Notify system
        if (data?.user) {
          fetch('/api/notify-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, id: data.user.id })
          }).catch(console.error);
        }

        showToast("Verifique seu email para confirmar o cadastro!", "success");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        showToast("Login realizado com sucesso!", "success");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      showToast(error.message || "Erro ao realizar autenticação", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Google auth error:", error);
      if (error.message?.includes("provider is not enabled") || JSON.stringify(error).includes("provider is not enabled")) {
        showToast("Login com Google desativado no Supabase. Habilite em Auth > Providers.", "error");
      } else {
        showToast(error.message || "Erro ao conectar com Google", "error");
      }
    }
  };

  // If user is logged in, show Profile/Dashboard
  if (user) {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header of Dashboard */}
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-100 p-3 rounded-full text-[#E60012]">
                            <UserIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Minha Conta</h2>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
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
                                <p className="mt-1 text-gray-900 font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">ID do Usuário</label>
                                <p className="mt-1 text-gray-900 font-medium text-xs font-mono bg-gray-100 p-2 rounded">{user.id}</p>
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

  // If not logged in, show Login Form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
            <a href="http://www.balao.info" className="inline-flex flex-col items-center mb-6 group no-underline">
                <div className="relative w-[200px] h-[60px]">
                    <Image 
                        src="/logo.png" 
                        alt="Balão da Informática" 
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <span className="text-xs font-bold text-[#E60012] tracking-widest mt-[-4px] uppercase font-sans">
                    Unidade Anchieta
                </span>
            </a>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isSignUp ? "Crie sua conta" : "Acesse sua conta"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? "Já tem uma conta? " : "Não tem uma conta? "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-[#E60012] hover:text-red-700 transition-colors"
            >
              {isSignUp ? "Fazer login" : "Cadastre-se grátis"}
            </button>
          </p>
        </div>

        <div className="mt-8 space-y-6">
            <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                <div className="rounded-md shadow-sm -space-y-px">
                <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#E60012] focus:border-[#E60012] focus:z-10 sm:text-sm"
                    placeholder="Endereço de email"
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#E60012] focus:border-[#E60012] focus:z-10 sm:text-sm"
                    placeholder="Senha"
                    minLength={6}
                    />
                </div>
                </div>

                <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#E60012] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E60012] disabled:opacity-70 transition-all shadow-md hover:shadow-lg"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                        isSignUp ? "Criar Conta" : "Entrar"
                    )}
                </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
