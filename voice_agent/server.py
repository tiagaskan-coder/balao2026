import os
import json
import logging
import base64
import asyncio
import io
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv
import ollama
from faster_whisper import WhisperModel
from kokoro_onnx import Kokoro
import soundfile as sf
import numpy as np
import requests

# Load environment variables
load_dotenv()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VoiceAgent")

app = FastAPI(title="Local Voice Sales Agent")

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
MODELS_DIR = "models"
KOKORO_MODEL_PATH = os.path.join(MODELS_DIR, "kokoro-v0_19.onnx")
KOKORO_VOICES_PATH = os.path.join(MODELS_DIR, "voices.json")

DEFAULT_CONFIG = {
    "ollama_endpoint": "http://localhost:11434",
    "model_name": "qwen2.5:1.5b",
    "voice_id": "br_001",  # Default PT-BR voice
    "system_prompt": """Você é um vendedor especialista da Balão da Informática.
Seu objetivo é ajudar o cliente a encontrar o melhor produto de tecnologia.
Seja breve, amigável e persuasivo. Fale sempre em Português do Brasil.
Use emojis ocasionalmente.
Se o cliente perguntar preço, consulte os dados fornecidos.
Não invente produtos que não estão na lista.""",
    "temperature": 0.7
}

# Global instances
supabase: Optional[Client] = None
whisper_model = None
kokoro = None
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

def ensure_models():
    """Download Kokoro ONNX models if missing."""
    if not os.path.exists(MODELS_DIR):
        os.makedirs(MODELS_DIR)
    
    # Download Model
    if not os.path.exists(KOKORO_MODEL_PATH):
        logger.info("Downloading Kokoro ONNX model...")
        url = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/kokoro-v0_19.onnx"
        r = requests.get(url, allow_redirects=True)
        with open(KOKORO_MODEL_PATH, "wb") as f:
            f.write(r.content)
    
    # Download Voices
    if not os.path.exists(KOKORO_VOICES_PATH):
        logger.info("Downloading Kokoro Voices...")
        url = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/voices.json"
        r = requests.get(url, allow_redirects=True)
        with open(KOKORO_VOICES_PATH, "wb") as f:
            f.write(r.content)

def init_services():
    global supabase, whisper_model, kokoro
    
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

    # Whisper (CPU/INT8 for speed on standard machines)
    try:
        logger.info("Loading Faster-Whisper...")
        whisper_model = WhisperModel("tiny", device="cpu", compute_type="int8")
        logger.info("Faster-Whisper loaded.")
    except Exception as e:
        logger.error(f"Whisper init failed: {e}")

    # Kokoro
    try:
        ensure_models()
        logger.info("Loading Kokoro TTS...")
        kokoro = Kokoro(KOKORO_MODEL_PATH, KOKORO_VOICES_PATH)
        logger.info("Kokoro TTS loaded.")
    except Exception as e:
        logger.error(f"Kokoro init failed: {e}")

# --- Pydantic Models ---

class ConfigUpdate(BaseModel):
    ollama_endpoint: Optional[str] = None
    model_name: Optional[str] = None
    voice_id: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None

class ChatRequest(BaseModel):
    message: str

# --- Routes ---

@app.on_event("startup")
async def startup_event():
    load_config()
    # Initialize services in a separate thread/process if needed, 
    # but for simplicity we do it here. 
    # Warning: Model downloads might block startup briefly.
    init_services()

@app.get("/")
async def root():
    return {"status": "online", "agent": "Local Voice Agent (Ollama + Whisper + Kokoro)"}

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
        "ollama": "unknown",
        "whisper": "ready" if whisper_model else "failed",
        "kokoro": "ready" if kokoro else "failed"
    }
    
    # Test Supabase
    if supabase:
        try:
            # Simple query
            supabase.table("products").select("count", count="exact").limit(1).execute()
            results["supabase"] = "ok"
        except Exception as e:
            results["supabase"] = f"error: {str(e)}"
    else:
        results["supabase"] = "not_configured"

    # Test Ollama
    try:
        # We use the configured endpoint
        client = ollama.Client(host=agent_config["ollama_endpoint"])
        # Check if model exists or list models
        models = client.list()
        # Check if specific model is available
        model_names = [m['name'] for m in models.get('models', [])]
        target_model = agent_config["model_name"]
        
        if any(target_model in name for name in model_names):
             results["ollama"] = f"ok ({target_model} found)"
        else:
             results["ollama"] = f"connected, but model {target_model} not found. Available: {model_names}"
             
    except Exception as e:
        results["ollama"] = f"error: {str(e)}"

    return results

async def search_products(query: str):
    if not supabase:
        return []
    try:
        # Simple text search on products
        # Using 'ilike' for partial matches on name or description
        # In a real vector scenario, we'd use embeddings.
        # Here we do a basic keyword split search
        keywords = query.split()
        db_query = supabase.table("products").select("*").limit(5)
        
        # Simple 'or' logic for keywords is hard with basic Supabase client without raw SQL or proper text search setup
        # So we just search for the whole string or fallback to first word
        # Let's just fetch recent/popular items if query is vague, or search name
        
        res = db_query.ilike("name", f"%{query}%").execute()
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
    
    # 2. Call Ollama
    try:
        client = ollama.Client(host=agent_config["ollama_endpoint"])
        response = client.chat(model=agent_config["model_name"], messages=[
            {"role": "system", "content": agent_config["system_prompt"] + context_str},
            {"role": "user", "content": user_msg}
        ])
        return {"response": response['message']['content'], "products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process-audio")
async def process_audio(file: UploadFile = File(...)):
    if not whisper_model or not kokoro:
        raise HTTPException(status_code=503, detail="AI Services not initialized")

    # 1. Save temp file
    temp_filename = "temp_input.wav"
    with open(temp_filename, "wb") as buffer:
        buffer.write(await file.read())

    try:
        # 2. STT (Whisper)
        segments, _ = whisper_model.transcribe(temp_filename, beam_size=5, language="pt")
        user_text = " ".join([segment.text for segment in segments])
        logger.info(f"User said: {user_text}")

        # 3. Search & LLM (Ollama)
        products = await search_products(user_text)
        context_str = ""
        if products:
            context_str = "\nProdutos disponíveis no catálogo:\n" + "\n".join(
                [f"- {p['name']}: R$ {p.get('price', 'N/A')}" for p in products]
            )

        client = ollama.Client(host=agent_config["ollama_endpoint"])
        llm_response = client.chat(model=agent_config["model_name"], messages=[
            {"role": "system", "content": agent_config["system_prompt"] + context_str},
            {"role": "user", "content": user_text}
        ])
        ai_text = llm_response['message']['content']
        logger.info(f"AI replied: {ai_text}")

        # 4. TTS (Kokoro)
        # Generate audio
        # Kokoro returns (audio_samples, sample_rate)
        # We need to map voices. 'br_001' is typical for PT-BR in Kokoro if using the voices.json mapping
        # Or we pass the style tensor. Kokoro-onnx handles string IDs if they match voices.json keys.
        
        voice = agent_config["voice_id"]
        # Fallback if voice not in json? Kokoro-onnx usually handles 'af', 'bm_lewis', etc.
        # We assume the user wants PT-BR.
        # Current Kokoro voices usually include 'bm_lewis', 'af_bella', etc. 
        # For PT-BR, we might need specific voice IDs available in the voices.json.
        # Let's assume 'bm_george' or similar if br not found, but user asked for br_001.
        # The voices.json from thewh1teagle usually has many.
        
        samples, sample_rate = kokoro.create(ai_text, voice=voice, speed=1.0, lang="pt-br")
        
        output_filename = "response.wav"
        sf.write(output_filename, samples, sample_rate)
        
        # Return JSON with audio encoded or just file?
        # Better to return JSON with base64 audio + text for the frontend to display
        
        with open(output_filename, "rb") as audio_file:
            audio_b64 = base64.b64encode(audio_file.read()).decode('utf-8')
            
        return JSONResponse(content={
            "user_text": user_text,
            "ai_text": ai_text,
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
        # We might keep response.wav or delete it.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
