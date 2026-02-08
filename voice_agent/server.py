import os
import logging
import base64
import asyncio
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException
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

# --- Configuration (Hardcoded) ---
AGENT_CONFIG = {
    "system_prompt": """Você é um vendedor especialista da Balão da Informática.
Seu objetivo é ajudar o cliente a encontrar o melhor produto de tecnologia.
Seja breve, amigável e persuasivo. Fale sempre em Português do Brasil.
Use emojis ocasionalmente.
Se o cliente perguntar preço, consulte os dados fornecidos.
Não invente produtos que não estão na lista.""",
    "temperature": 0.7,
    "model_name": "gpt-4o-mini",
    "voice_id": "alloy"
}

# Global instances
supabase: Optional[Client] = None

# --- Helper Functions ---

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

class ChatRequest(BaseModel):
    message: str

# --- Routes ---

@app.on_event("startup")
async def startup_event():
    init_services()

@app.get("/")
async def root():
    return {"status": "online", "agent": "Voice Sales Agent (OpenAI)"}

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

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Text-only chat for testing."""
    user_msg = request.message
    
    # 1. Search Products (Context)
    products = await search_products(user_msg)
    context_str = ""
    if products:
        context_str = "\nProdutos encontrados:\n" + "\n".join(
            [f"- {p['name']}: R$ {p.get('price', '?')}" for p in products]
        )
    
    # 2. Call OpenAI LLM
    try:
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model=AGENT_CONFIG.get("model_name", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": AGENT_CONFIG["system_prompt"] + context_str},
                {"role": "user", "content": user_msg}
            ],
            temperature=AGENT_CONFIG.get("temperature", 0.7)
        )
        return {"response": response.choices[0].message.content, "products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-audio")
async def process_audio(file: UploadFile = File(...)):
    # 1. Save temp file (Whisper API needs a file-like object with name or actual file)
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        buffer.write(await file.read())

    try:
        client = openai.OpenAI()

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
                "audio_base64": "", # No audio response
                "products_found": []
            })

        # 3. Search & LLM (GPT)
        products = await search_products(user_text)
        context_str = ""
        if products:
            context_str = "\nProdutos disponíveis no catálogo:\n" + "\n".join(
                [f"- {p['name']}: R$ {p.get('price', 'N/A')}" for p in products]
            )

        llm_response = client.chat.completions.create(
            model=AGENT_CONFIG.get("model_name", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": AGENT_CONFIG["system_prompt"] + context_str},
                {"role": "user", "content": user_text}
            ],
            temperature=AGENT_CONFIG.get("temperature", 0.7)
        )
        ai_text = llm_response.choices[0].message.content
        logger.info(f"AI replied: {ai_text}")

        # 4. TTS (OpenAI TTS)
        # alloy, echo, fable, onyx, nova, and shimmer
        voice = AGENT_CONFIG.get("voice_id", "alloy")
        
        speech_response = client.audio.speech.create(
            model="tts-1",
            voice=voice,
            input=ai_text
        )
        
        # Get binary data
        audio_content = speech_response.content
        
        # Encode to base64 for frontend
        audio_b64 = base64.b64encode(audio_content).decode('utf-8')
            
        return JSONResponse(content={
            "user_text": user_text,
            "agent_text": ai_text, 
            "audio_base64": audio_b64,
            "products_found": products
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