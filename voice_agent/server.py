import os
import json
import logging
import base64
import asyncio
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import openai

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

REGRAS RÍGIDAS:
1. NUNCA invente produtos. Use APENAS os produtos fornecidos no contexto (resultados da busca).
2. Se o cliente pedir algo que não está na lista, diga que não encontrou.
3. NUNCA forneça links externos ou sugira outros sites.
4. Para mostrar um produto, USE a ferramenta `view_product` com o slug correto.
5. Para adicionar ao carrinho, USE a ferramenta `add_to_cart` APENAS com permissão explícita.
6. Mantenha as respostas curtas (máximo 2 frases) para uma conversa fluida.""",
    "temperature": 0.5,
    "model_name": "gpt-4o-mini",
    "voice_id": "alloy"
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
    
    # Supabase
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if url and key:
        try:
            supabase = create_client(url, key)
            logger.info("Supabase connected.")
        except Exception as e:
            logger.error(f"Supabase init failed: {e}")
    else:
        logger.warning("Supabase credentials missing.")

    # OpenAI
    openai_key = os.getenv("OPENAI_API_KEY")
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

class ChatRequest(BaseModel):
    message: str

# --- OpenAI Tools ---

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "view_product",
            "description": "Show/navigate to a specific product page on the website. Use this when recommending a specific product.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_slug": {
                        "type": "string",
                        "description": "The slug of the product to display (e.g., 'placa-de-video-rtx-3060')"
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
            "description": "Add a product to the shopping cart. Use this ONLY when the user explicitly agrees to add it.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_id": {
                        "type": "string",
                        "description": "The ID of the product to add to cart"
                    },
                     "product_name": {
                        "type": "string",
                        "description": "The name of the product"
                    },
                     "product_price": {
                        "type": "string",
                        "description": "The price of the product"
                    },
                     "product_image": {
                        "type": "string",
                        "description": "The image URL of the product"
                    }
                },
                "required": ["product_id", "product_name", "product_price", "product_image"]
            }
        }
    }
]

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
    return {"status": "updated", "config": agent_config}

@app.get("/test-connection")
async def test_connection():
    results = {
        "supabase": "unknown",
        "openai": "unknown"
    }
    
    # Test Supabase
    if supabase:
        try:
            supabase.table("products").select("count", count="exact").limit(1).execute()
            results["supabase"] = "ok"
        except Exception as e:
            results["supabase"] = f"error: {str(e)}"
    else:
        results["supabase"] = "not_configured"

    # Test OpenAI
    try:
        if not os.getenv("OPENAI_API_KEY"):
            results["openai"] = "missing_key"
        else:
            # Simple list models call to verify auth
            openai.models.list()
            results["openai"] = "ok"
    except Exception as e:
        results["openai"] = f"error: {str(e)}"

    return results

async def search_products(query: str):
    if not supabase:
        return []
    try:
        # Basic search
        res = supabase.table("products").select("*").ilike("name", f"%{query}%").limit(5).execute()
        return res.data
    except Exception as e:
        logger.error(f"Product search error: {e}")
        return []

@app.post("/process-audio")
async def process_audio(
    file: UploadFile = File(...),
    conversation_history: str = Form("[]") # Receive history as JSON string
):
    # 1. Save temp file (Whisper API needs a file-like object with name or actual file)
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

        # 3. Search & LLM (GPT)
        # Improve search query by removing common stop words
        stop_words = ["eu", "quero", "gostaria", "de", "um", "uma", "comprar", "ver", "preço", "quanto", "custa", "tem", "você", "gostaria", "saber", "sobre", "o", "a", "os", "as", "me", "mostra", "mostre", "olhar"]
        query_words = [w for w in user_text.lower().split() if w not in stop_words]
        clean_query = " ".join(query_words)
        
        products = []
        if len(clean_query) > 2:
            products = await search_products(clean_query)
            
        context_str = ""
        if products:
            context_str = "\nProdutos encontrados no catálogo (use estas informações):\n" + "\n".join(
                [f"- {p['name']} (ID: {p['id']}, Slug: {p['slug']}): R$ {p.get('price', 'N/A')}" for p in products]
            )

        # Build messages with history
        messages = [{"role": "system", "content": agent_config["system_prompt"] + context_str}]
        
        # Append last 10 messages from history to maintain context but avoid token limit
        for msg in history[-10:]:
            if msg.get("role") in ["user", "assistant"]:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        messages.append({"role": "user", "content": user_text})

        # Call LLM with Tools
        llm_response = client.chat.completions.create(
            model=agent_config.get("model_name", "gpt-4o-mini"),
            messages=messages,
            temperature=agent_config.get("temperature", 0.7),
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
                # Find product details from search results to enrich payload
                slug = func_args.get("product_slug")
                product_data = next((p for p in products if p['slug'] == slug), None)
                
                # If not in current search context, try to fetch from Supabase
                if not product_data and supabase:
                    try:
                        res = supabase.table("products").select("*").eq("slug", slug).execute()
                        if res.data:
                            product_data = res.data[0]
                    except Exception as e:
                        logger.error(f"Error fetching product details: {e}")

                action_payload = {
                    "type": "view_product",
                    "payload": product_data if product_data else {"slug": slug}
                }
                if not ai_text:
                    ai_text = f"Encontrei este produto para você. Dê uma olhada!"
                    
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
                    ai_text = f"Adicionei {func_args.get('product_name')} ao seu carrinho."

        logger.info(f"AI replied: {ai_text}")

        # 4. TTS (OpenAI TTS)
        voice = agent_config.get("voice_id", "alloy")
        
        # If AI text is empty but we have an action, generate a generic response? 
        # Usually tool call comes with null content. We filled it above.
        
        if ai_text:
            speech_response = client.audio.speech.create(
                model="tts-1",
                voice=voice,
                input=ai_text
            )
            # Get binary data
            audio_content = speech_response.content
            # Encode to base64 for frontend
            audio_b64 = base64.b64encode(audio_content).decode('utf-8')
        else:
            audio_b64 = ""

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