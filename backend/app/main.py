from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import os
import base64
import numpy as np
from dotenv import load_dotenv
from pydantic import BaseModel

# Carrega variáveis de ambiente ANTES de importar os serviços
load_dotenv()

# Import Services
from app.services.stt import stt_service
from app.services.llm import llm_service
from app.services.tts import tts_service
from app.services.search import search_service

app = FastAPI(title="Balão Voice Agent API")

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

async def process_chat(request: ChatRequest):
    user_text = request.message
    print(f"User said (HTTP): {user_text}")
    
    # 2. Intent Recognition & Search
    products = []
    search_keywords = ["procur", "busc", "tem", "preço", "custa", "comprar", "vende", "gostaria", "preciso", "queria", "ver", "mostra"]
    
    if any(k in user_text.lower() for k in search_keywords):
        stop_words = ["procurando", "buscando", "quero comprar", "gostaria de", "tem", "o preço do", "quanto custa", "vende", "preciso de", "um", "uma", "o", "a", "por favor", "me mostra"]
        search_query = user_text.lower()
        for sw in stop_words:
            search_query = search_query.replace(sw, "")
        
        search_query = search_query.strip()
        
        if len(search_query) > 2:
            print(f"Detected search intent. Query: '{search_query}'")
            products = search_service.search_products(search_query)

    # 3. LLM Generation
    system_prompt = (
        "Você é o assistente virtual do Balão da Informática. "
        "Fale em Português do Brasil. Seja breve, útil e vendedor. "
        "Se houver produtos encontrados, mencione-os."
    )
    
    if products:
        prod_context = "\n".join([f"- {p['name']} (R$ {p['price']})" for p in products[:3]])
        prompt = f"O usuário perguntou: '{user_text}'. Produtos encontrados:\n{prod_context}\nResponda sugerindo esses produtos."
    else:
        prompt = user_text

    # Collect full response (non-streaming for HTTP simplicity on Vercel)
    full_response = ""
    for token in llm_service.generate_stream(prompt, system_prompt):
        full_response += token
    
    return {
        "text": full_response,
        "products": products[:5] if products else []
    }

# Registrar rotas para ambos os caminhos (local e Vercel rewrite)
app.post("/api/chat")(process_chat)
app.post("/api/py/chat")(process_chat)

@app.get("/")
async def read_root():
    return {"status": "online", "service": "Balão Voice Agent"}

@app.get("/api/py")
async def read_root_vercel():
    return {"status": "online", "service": "Balão Voice Agent (Vercel)"}

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Cliente conectado ao WebSocket")
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            user_text = ""
            
            # 1. Process Input (Text or Audio)
            if payload.get("type") == "audio":
                # Decode audio and transcribe
                # TODO: Implement robust audio decoding. 
                # Assuming raw PCM or compatible format sent via base64
                # For now, let's assume client sends text or we mock transcription
                # audio_bytes = base64.b64decode(payload.get("data"))
                # user_text = stt_service.transcribe(audio_bytes)
                user_text = "Estou procurando promoções" # Mock
            elif payload.get("type") == "text":
                user_text = payload.get("data")
            
            print(f"User said: {user_text}")
            
            # 2. Intent Recognition & Search
            products = []
            search_keywords = ["procur", "busc", "tem", "preço", "custa", "comprar", "vende"]
            
            if any(k in user_text.lower() for k in search_keywords):
                print("Detected search intent")
                # Simple extraction logic
                search_query = user_text.replace("procurando", "").replace("buscando", "").strip()
                products = search_service.search_products(search_query)

            # 3. LLM Generation
            system_prompt = (
                "Você é o assistente virtual do Balão da Informática. "
                "Fale em Português do Brasil. Seja breve, útil e vendedor. "
                "Se houver produtos encontrados, mencione-os."
            )
            
            if products:
                prod_context = "\n".join([f"- {p['name']} (R$ {p['price']})" for p in products[:3]])
                prompt = f"O usuário perguntou: '{user_text}'. Produtos encontrados:\n{prod_context}\nResponda sugerindo esses produtos."
            else:
                prompt = user_text

            # Stream response
            full_response = ""
            for token in llm_service.generate_stream(prompt, system_prompt):
                full_response += token
                await websocket.send_json({"type": "text_delta", "data": token})
            
            # 4. Final Payload with Metadata
            await websocket.send_json({
                "type": "response_end", 
                "text": full_response,
                "products": products
            })
            
            # 5. TTS (Optional - send audio URL or base64)
            # audio_path = tts_service.synthesize(full_response)
            # await websocket.send_json({"type": "audio", "data": "..."})

    except WebSocketDisconnect:
        print("Cliente desconectado")
    except Exception as e:
        print(f"Erro no WebSocket: {e}")
