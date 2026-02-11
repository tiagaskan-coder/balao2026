
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      showToast("Email de recuperação enviado com sucesso!", "success");
    } catch (error: any) {
      console.error("Reset password error:", error);
      showToast(error.message || "Erro ao enviar email de recuperação", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
            <Link href="/" className="inline-flex flex-col items-center mb-6 group no-underline">
                <div className="relative w-[200px] h-[60px]">
                    <Image 
                        src="/logo.png" 
                        alt="Balão da Informática" 
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Recuperar Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite seu email para receber um link de redefinição.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <Mail className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">Email Enviado!</h3>
            <p className="text-green-600 text-sm mb-6">
              Verifique sua caixa de entrada (e spam) para redefinir sua senha.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center text-[#E60012] font-medium hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleReset}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
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
            </div>

            <div className="flex items-center justify-between">
              <Link 
                href="/login" 
                className="flex items-center text-sm font-medium text-gray-600 hover:text-[#E60012]"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-[#E60012] hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E60012] disabled:opacity-70 transition-all shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                "Enviar Link de Recuperação"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
