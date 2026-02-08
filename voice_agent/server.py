import os
import json
import base64
import tempfile
import asyncio
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client

# AI Imports
import openai
# Para Whisper Local (se disponível)
try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False

# Para TTS (Simulação/Placeholder se Kokoro não estiver configurado)
# Em produção real, importaríamos a biblioteca do Kokoro aqui

load_dotenv()

app = FastAPI(title="Voice Sales Agent")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, restrinja para o domínio do site
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configuração LLM (Qwen)
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY", "sk-proj-...") # Placeholder
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo") # Fallback se não configurado para Qwen

client = openai.OpenAI(
    base_url=LLM_BASE_URL,
    api_key=LLM_API_KEY
)

# Configuração Whisper
whisper_model = None
if WHISPER_AVAILABLE:
    print("Loading Whisper model (base)...")
    # whisper_model = whisper.load_model("base") # Descomente para carregar ao iniciar
    pass

# --- Funções Auxiliares ---

def search_products(query: str):
    """
    Busca produtos no Supabase pelo nome ou descrição.
    """
    print(f"Searching products for: {query}")
    try:
        # Busca simples com ILIKE
        response = supabase.table("products") \
            .select("id, name, description, price, stock") \
            .ilike("name", f"%{query}%") \
            .execute()
        
        # Se não achar nada pelo nome, tenta descrição
        if not response.data:
            response = supabase.table("products") \
                .select("id, name, description, price, stock") \
                .ilike("description", f"%{query}%") \
                .execute()
                
        return json.dumps(response.data)
    except Exception as e:
        print(f"Error searching products: {e}")
        return "[]"

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_products",
            "description": "Busca produtos no catálogo da loja quando o cliente pergunta por algo.",
            "parameters": {
                "type": "object",
                "properties": {
                    "termo_busca": {
                        "type": "string",
                        "description": "O termo para buscar (ex: 'notebook', 'mouse gamer')"
                    }
                },
                "required": ["termo_busca"]
            }
        }
    }
]

# --- Endpoints ---

@app.get("/")
async def root():
    return {"status": "online", "agent": "Voice Sales Agent"}

@app.post("/chat-audio")
async def chat_audio(file: UploadFile = File(...)):
    """
    Recebe áudio, transcreve, processa com LLM e retorna áudio + texto.
    """
    
    # 1. Salvar áudio temporário
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    text_input = ""
    
    # 2. Transcrição (STT) - Whisper
    try:
        # Opção A: Usar API da OpenAI (mais fácil de configurar)
        if os.getenv("OPENAI_API_KEY"):
            with open(tmp_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file,
                    language="pt"
                )
            text_input = transcript.text
        # Opção B: Whisper Local
        elif WHISPER_AVAILABLE and whisper_model:
            result = whisper_model.transcribe(tmp_path, language="pt")
            text_input = result["text"]
        else:
            # Fallback simulado para teste sem chaves
            text_input = "Quero ver notebooks gamers" 
            print("AVISO: Whisper não configurado. Usando input simulado.")
            
    except Exception as e:
        print(f"STT Error: {e}")
        text_input = "Erro na transcrição"
    finally:
        os.remove(tmp_path)

    print(f"User said: {text_input}")

    # 3. LLM Processing (Qwen)
    messages = [
        {"role": "system", "content": "Você é um Vendedor Especialista em informática simpático e objetivo. Use a função search_products para buscar informações reais. Responda em Português do Brasil de forma concisa (ideal para voz)."},
        {"role": "user", "content": text_input}
    ]

    try:
        completion = client.chat.completions.create(
            model=LLM_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto"
        )

        response_message = completion.choices[0].message
        
        # Verificar se chamou função
        if response_message.tool_calls:
            for tool_call in response_message.tool_calls:
                if tool_call.function.name == "search_products":
                    args = json.loads(tool_call.function.arguments)
                    products_json = search_products(args["termo_busca"])
                    
                    messages.append(response_message)
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": products_json
                    })
            
            # Segunda chamada para gerar a resposta final com os dados
            completion_final = client.chat.completions.create(
                model=LLM_MODEL,
                messages=messages
            )
            final_response_text = completion_final.choices[0].message.content
        else:
            final_response_text = response_message.content

    except Exception as e:
        print(f"LLM Error: {e}")
        final_response_text = "Desculpe, estou tendo problemas para pensar agora. Pode repetir?"

    print(f"Agent says: {final_response_text}")

    # 4. TTS Generation (Kokoro)
    # Aqui vamos gerar o áudio de resposta.
    # Como Kokoro é pesado para 'drop-in', vamos simular ou usar uma API externa se configurada.
    # Para o exemplo funcionar, retornaremos o texto e um base64 dummy ou usaremos gTTS se instalado.
    
    audio_base64 = ""
    
    # Simulação de geração de áudio (Placeholder)
    # Em produção: run_kokoro_inference(final_response_text)
    
    return JSONResponse({
        "user_text": text_input,
        "agent_text": final_response_text,
        "audio_base64": audio_base64 # Frontend vai ler o texto se audio for vazio ou usar TTS do browser como fallback
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
