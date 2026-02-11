"use client";

import { useState, useEffect } from "react";
import { Save, Instagram, CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

export default function InstagramManager() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch("/api/integrations/instagram");
      const data = await res.json();
      if (data.connected) {
        setConnected(true);
        setUsername(data.username);
      }
    } catch (e) {
      console.error("Failed to check status", e);
    }
  };

  const handleSave = async () => {
    if (!token) {
        setMessage("Por favor, insira o Token de Acesso.");
        setStatus("error");
        return;
    }

    setStatus("loading");
    setMessage("");

    try {
        const res = await fetch("/api/integrations/instagram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: token })
        });

        const data = await res.json();

        if (res.ok) {
            setStatus("success");
            setMessage(`Conectado com sucesso ao perfil @${data.username}!`);
            setConnected(true);
            setUsername(data.username);
            setToken(""); // Clear input for security
        } else {
            setStatus("error");
            setMessage(data.error || "Erro ao conectar. Verifique o token.");
        }
    } catch (e) {
        setStatus("error");
        setMessage("Erro de comunicação com o servidor.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="p-2 bg-pink-100 rounded-full text-pink-600">
          <Instagram className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Integração Instagram</h2>
          <p className="text-sm text-gray-500">Gerencie a exibição do feed do Instagram no site</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Status & Input */}
        <div className="space-y-6">
          
          {/* Status Card */}
          <div className={`p-4 rounded-lg border flex items-center gap-3 ${connected ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
            {connected ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-semibold text-green-700">Conectado</p>
                  <p className="text-sm text-green-600">Logado como: <span className="font-bold">@{username || "Usuário"}</span></p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-600">Não conectado</p>
                  <p className="text-sm text-gray-500">O site está usando produtos aleatórios como feed.</p>
                </div>
              </>
            )}
          </div>

          {/* Input Form */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Instagram Access Token</label>
            <textarea 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="EAA..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm font-mono"
            />
            <p className="text-xs text-gray-500">
              Cole aqui o seu "Long-Lived Access Token" gerado no painel de desenvolvedores do Facebook.
            </p>
            
            <button 
              onClick={handleSave}
              disabled={status === "loading"}
              className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-md font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {status === "loading" ? "Verificando..." : "Salvar e Conectar"}
            </button>

            {message && (
                <div className={`p-3 rounded-md text-sm ${status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {message}
                </div>
            )}
          </div>
        </div>

        {/* Right Column: Instructions */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-sm space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            Como obter o Token?
          </h3>
          
          <ol className="list-decimal list-inside space-y-3 text-gray-600">
            <li>Acesse o <a href="https://developers.facebook.com/" target="_blank" className="text-blue-600 hover:underline flex items-center inline-flex gap-1">Meta for Developers <ExternalLink className="w-3 h-3"/></a>.</li>
            <li>Crie um aplicativo do tipo <strong>"Empresa"</strong> ou "Consumidor".</li>
            <li>Em "Produtos", adicione <strong>"Instagram Basic Display"</strong>.</li>
            <li>Crie um Usuário de Teste ou adicione seu perfil do Instagram.</li>
            <li>No painel "Basic Display", gere o <strong>User Token</strong>.</li>
            <li>Copie o token gerado e cole no campo ao lado.</li>
          </ol>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
            <h4 className="font-bold mb-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Por que não posso usar apenas Login e Senha?
            </h4>
            <p className="mb-2">
                O Instagram <strong>bloqueia</strong> conexões externas usando senha por motivos de segurança. Se tentarmos simular um login, sua conta pode ser bloqueada ou pedir verificação a cada acesso.
            </p>
            <p>
                O uso do <strong>Token</strong> é a única forma oficial e segura permitida pela Meta/Facebook para exibir suas fotos no site sem riscos.
            </p>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
            <strong>Dica:</strong> Se achar muito difícil gerar o token, você pode continuar usando o modo automático (que exibe os produtos do site) sem precisar configurar nada aqui.
          </div>
        </div>
      </div>
    </div>
  );
}
