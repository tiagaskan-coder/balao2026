
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Loader2, Chrome } from "lucide-react";
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

  const [rememberMe, setRememberMe] = useState(false);

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
        
        // Remember me logic is handled by Supabase session persistence by default,
        // but we could set a local preference if needed.
        if (rememberMe) {
            localStorage.setItem("rememberMeEmail", email);
        } else {
            localStorage.removeItem("rememberMeEmail");
        }

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

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberMeEmail");
    if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
    }
  }, []);

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

  // If user is logged in, redirect to Account Dashboard
  useEffect(() => {
    if (user) {
      router.push('/conta');
    }
  }, [user, router]);

  // If already logged in, show loading state while redirecting
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[#E60012]" />
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

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-[#E60012] focus:ring-[#E60012] border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                            Lembrar-me
                        </label>
                    </div>

                    {!isSignUp && (
                        <div className="text-sm">
                            <Link 
                                href="/forgot-password" 
                                className="font-medium text-[#E60012] hover:text-red-700"
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>
                    )}
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

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E60012] transition-colors"
                    >
                        <Chrome className="h-5 w-5 mr-2 text-gray-900" />
                        <span>Google</span>
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
