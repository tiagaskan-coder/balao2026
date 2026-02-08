import os
import json
import logging
import base64
import asyncio
import re
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import openai

import requests

# Load environment variables
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VoiceAgent")

app = FastAPI(title="Voice Sales Agent (OpenAI)")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Configuration & State ---
CONFIG_FILE = "agent_config.json"
DEFAULT_CONFIG = {
    "system_prompt": """Você é um vendedor especialista da Balão da Informática.
Seu objetivo é ajudar o cliente a encontrar o melhor produto de tecnologia.
Seja breve, amigável e persuasivo. Fale sempre em Português do Brasil.
Use emojis ocasionalmente.

REGRAS RÍGIDAS DE OPERAÇÃO:
1. **INTEGRIDADE DE PRODUTOS**:
   - NUNCA invente produtos.
   - NUNCA invente preços ou especificações.
   - Use APENAS os produtos listados explicitamente no contexto "Produtos encontrados no catálogo".
   - Se o produto solicitado não estiver na lista, informe educadamente que não encontrou exatamente aquele modelo, mas ofereça as alternativas listadas (se houver).

2. **LINKS E NAVAGAÇÃO**:
   - NUNCA forneça URLs ou links externos.
   - Para mostrar um produto ao cliente, USE a ferramenta `view_product` passando o `product_slug` correto da lista.
   - NÃO descreva o produto exaustivamente; mostre-o usando a ferramenta e convide o cliente a ver os detalhes.

3. **COMPRA**:
   - Se o cliente demonstrar interesse claro em comprar, use a ferramenta `add_to_cart`.
   - Peça confirmação antes de adicionar ao carrinho.

4. **ESTILO DE RESPOSTA**:
   - Respostas curtas (máximo 2-3 frases) para manter a fluidez da conversa por voz.
   - Na PRIMEIRA interação, apresente-se EXATAMENTE assim: "Olá! Sou o assistente virtual da Balão. Como posso ajudar você hoje?"
""",
    "temperature": 0.2, # Low temperature for factual accuracy
    "model_name": "gpt-4o-mini",
    "voice_id": "alloy",
    "voice_provider": "openai", # openai | elevenlabs
    "openai_api_key": "",
    "supabase_url": "",
    "supabase_key": "",
    "elevenlabs_api_key": ""
}

# Global instances
supabase: Optional[Client] = None
agent_config = DEFAULT_CONFIG.copy()

# --- Helper Functions ---

def load_config():
    global agent_config
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                saved_config = json.load(f)
                agent_config.update(saved_config)
        except Exception as e:
            logger.error(f"Failed to load config: {e}")

def save_config():
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(agent_config, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save config: {e}")

def init_services():
    global supabase
    
    # Supabase - Priority: Config > Env Var
    url = agent_config.get("supabase_url") or os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    key = agent_config.get("supabase_key") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")
    
    if url and key:
        try:
            supabase = create_client(url, key)
            logger.info(f"Supabase connected to {url}")
        except Exception as e:
            logger.error(f"Supabase init failed: {e}")
    else:
        logger.warning("Supabase credentials missing.")

    # OpenAI
    openai_key = agent_config.get("openai_api_key") or os.getenv("OPENAI_API_KEY")
    if not openai_key:
        logger.warning("OPENAI_API_KEY missing. Voice features will fail.")
    else:
        openai.api_key = openai_key

# --- Pydantic Models ---

class ConfigUpdate(BaseModel):
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    model_name: Optional[str] = None
    voice_id: Optional[str] = None
    voice_provider: Optional[str] = None
    openai_api_key: Optional[str] = None
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    elevenlabs_api_key: Optional[str] = None

# --- OpenAI Tools ---

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "view_product",
            "description": "Exibe um card de visualização do produto na tela do usuário. Use isso sempre que sugerir ou mencionar um produto específico disponível.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_slug": {
                        "type": "string",
                        "description": "O slug exato do produto encontrado na busca."
                    }
                },
                "required": ["product_slug"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_to_cart",
            "description": "Adiciona o produto ao carrinho de compras.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {
                        "type": "string",
                        "description": "O ID do produto."
                    },
                     "product_name": {
                        "type": "string",
                        "description": "O nome do produto"
                    },
                     "product_price": {
                        "type": "string",
                        "description": "O preço do produto"
                    },
                     "product_image": {
                        "type": "string",
                        "description": "A URL da imagem do produto"
                    }
                },
                "required": ["product_id", "product_name", "product_price", "product_image"]
            }
        }
    }
]

# --- Core Logic ---

def normalize_product(p: Dict) -> Dict:
    """Ensure product has standard fields for frontend."""
    if not p: return p
    # Handle image/image_url inconsistency
    if 'image_url' in p and 'image' not in p:
        p['image'] = p['image_url']
    elif 'image' in p and 'image_url' not in p:
        p['image_url'] = p['image']
    
    # Ensure ID is string
    if 'id' in p:
        p['id'] = str(p['id'])

    # Format price to BRL string if it's a number
    if 'price' in p:
        try:
            val = float(p['price'])
            # Only format if it doesn't look like a formatted string already (e.g. starts with R$)
            if not str(p['price']).strip().startswith("R$"):
                p['price'] = f"R$ {val:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        except:
            pass # Keep as is if not a number
        
    return p

async def search_products(query: str) -> List[Dict]:
    """
    Realiza uma busca robusta no Supabase.
    Tenta busca exata, depois parcial, depois por palavras-chave.
    """
    if not supabase:
        return []
    
    query = query.strip()
    if not query:
        return []

    try:
        # 1. Busca textual direta (ilike)
        logger.info(f"Searching for: {query}")
        res = supabase.table("products").select("*").ilike("name", f"%{query}%").limit(5).execute()
        if res.data:
            return [normalize_product(p) for p in res.data]

        # 2. Busca por palavras-chave (se a frase for longa)
        # Remove stop words comuns em PT-BR
        stop_words = {"eu", "quero", "gostaria", "de", "do", "da", "um", "uma", "comprar", "ver", "preço", "quanto", "custa", "tem", "você", "saber", "sobre", "o", "a", "os", "as", "me", "mostra", "mostre", "olhar", "procurando", "estou"}
        words = [w.lower() for w in re.split(r'\s+', query) if w.lower() not in stop_words and len(w) > 2]
        
        if not words:
            return []

        # Tenta buscar pela combinação das palavras mais significativas
        or_filter = ",".join([f"name.ilike.%{w}%" for w in words])
        if or_filter:
            res = supabase.table("products").select("*").or_(or_filter).limit(10).execute()
            if res.data:
                return [normalize_product(p) for p in res.data]

        return []
    except Exception as e:
        logger.error(f"Product search error: {e}")
        return []

async def get_product_by_slug(slug: str) -> Optional[Dict]:
    if not supabase: return None
    try:
        res = supabase.table("products").select("*").eq("slug", slug).execute()
        if res.data:
            return normalize_product(res.data[0])
        return None
    except Exception as e:
        logger.error(f"Get product error: {e}")
        return None

# --- Routes ---

@app.on_event("startup")
async def startup_event():
    load_config()
    init_services()

@app.get("/")
async def root():
    return {"status": "online", "agent": "Voice Sales Agent (OpenAI)"}

@app.get("/config")
async def get_config():
    return agent_config

@app.post("/config")
async def update_config(config: ConfigUpdate):
    global agent_config
    update_data = config.model_dump(exclude_unset=True)
    agent_config.update(update_data)
    save_config()
    # Re-init services to pick up new keys immediately
    init_services()
    return {"status": "updated", "config": agent_config}

@app.post("/process-audio")
async def process_audio(
    file: UploadFile = File(...),
    conversation_history: str = Form("[]")
):
    # 1. Save temp file
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        buffer.write(await file.read())

    try:
        client = openai.OpenAI()
        
        # Load history
        try:
            history = json.loads(conversation_history)
        except:
            history = []

        # 2. STT (Whisper API)
        with open(temp_filename, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="pt"
            )
        user_text = transcript.text
        logger.info(f"User said: {user_text}")
        
        # Short-circuit if empty
        if not user_text.strip():
             return JSONResponse(content={
                "user_text": "",
                "agent_text": "Não entendi, pode repetir?",
                "audio_base64": "", 
                "products_found": [],
                "action": None
            })

        # 3. Search Context
        # Improve search query
        products = await search_products(user_text)
            
        context_str = ""
        if products:
            context_str = "\nCONTEXTO DE DADOS REAIS (Use APENAS estes produtos):\n"
            for p in products:
                price = p.get('price', 'Preço sob consulta')
                context_str += f"- Nome: {p['name']} | ID: {p['id']} | Slug: {p['slug']} | Preço: {price}\n"
        else:
            context_str = "\nCONTEXTO: Nenhum produto encontrado com esses termos na base de dados.\n"

        # Build messages with history
        system_msg = agent_config["system_prompt"] + context_str
        messages = [{"role": "system", "content": system_msg}]
        
        # Append recent history (last 6 turns to keep context but save tokens)
        for msg in history[-6:]:
            if msg.get("role") in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        messages.append({"role": "user", "content": user_text})

        # Call LLM with Tools
        llm_response = client.chat.completions.create(
            model=agent_config.get("model_name", "gpt-4o-mini"),
            messages=messages,
            temperature=agent_config.get("temperature", 0.3),
            tools=TOOLS,
            tool_choice="auto"
        )
        
        response_msg = llm_response.choices[0].message
        ai_text = response_msg.content or ""
        
        # Handle Tool Calls
        action_payload = None
        if response_msg.tool_calls:
            tool_call = response_msg.tool_calls[0]
            func_name = tool_call.function.name
            func_args = json.loads(tool_call.function.arguments)
            
            logger.info(f"Tool Call: {func_name} args: {func_args}")
            
            if func_name == "view_product":
                slug = func_args.get("product_slug")
                # Validate if product exists in our passed context OR fetch it
                product_data = next((p for p in products if p['slug'] == slug), None)
                
                if not product_data:
                    # Fallback: fetch directly from DB to be sure
                    product_data = await get_product_by_slug(slug)
                
                if product_data:
                    action_payload = {
                        "type": "view_product",
                        "payload": product_data
                    }
                    if not ai_text:
                        ai_text = f"Aqui está: {product_data['name']}."
                else:
                    logger.warning(f"AI tried to show non-existent slug: {slug}")
                    # AI hallucinated a slug? fallback text
                    if not ai_text:
                        ai_text = "Desculpe, não consegui carregar os detalhes desse produto."

            elif func_name == "add_to_cart":
                action_payload = {
                    "type": "add_to_cart",
                    "payload": {
                        "id": func_args.get("product_id"),
                        "name": func_args.get("product_name"),
                        "price": func_args.get("product_price"),
                        "image": func_args.get("product_image")
                    }
                }
                if not ai_text:
                    ai_text = f"Adicionado ao carrinho."

        logger.info(f"AI replied: {ai_text}")

        # 4. TTS (OpenAI TTS)
        voice = agent_config.get("voice_id", "alloy")
        audio_b64 = ""
        
        if ai_text:
            try:
                speech_response = client.audio.speech.create(
                    model="tts-1",
                    voice=voice,
                    input=ai_text
                )
                audio_content = speech_response.content
                audio_b64 = base64.b64encode(audio_content).decode('utf-8')
            except Exception as e:
                logger.error(f"TTS Error: {e}")

        return JSONResponse(content={
            "user_text": user_text,
            "agent_text": ai_text, 
            "audio_base64": audio_b64,
            "products_found": products,
            "action": action_payload
        })

    except Exception as e:
        logger.error(f"Processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
