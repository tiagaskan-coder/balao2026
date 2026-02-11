from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import os
import base64
import numpy as np
from dotenv import load_dotenv

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

@app.get("/")
async def read_root():
    return {"status": "online", "service": "Balão Voice Agent"}

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
                pass
            elif payload.get("type") == "text_input":
                user_text = payload.get("content")
            
            if not user_text:
                continue
                
            print(f"User said: {user_text}")
            
            # 2. Intent Recognition & Search
            # Simple heuristic: If it looks like a product search
            products = []
            # Expanded keyword list for better detection
            search_keywords = ["procur", "busc", "tem", "preço", "custa", "comprar", "vende", "gostaria", "preciso", "queria", "ver", "mostra"]
            
            if any(k in user_text.lower() for k in search_keywords):
                # Extract search terms (naive approach)
                # Remove common stop words to isolate the product name
                stop_words = ["procurando", "buscando", "quero comprar", "gostaria de", "tem", "o preço do", "quanto custa", "vende", "preciso de", "um", "uma", "o", "a", "por favor", "me mostra"]
                search_query = user_text.lower()
                for sw in stop_words:
                    search_query = search_query.replace(sw, "")
                
                search_query = search_query.strip()
                
                if len(search_query) > 2: # Avoid searching for single letters or empty strings
                    print(f"Detected search intent. Query: '{search_query}'")
                    products = search_service.search_products(search_query)
                
                if products:
                    await websocket.send_json({
                        "type": "products",
                        "data": products[:5] # Send top 5
                    })
            
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
            sentence_buffer = ""
            
            for token in llm_service.generate_stream(prompt, system_prompt):
                full_response += token
                sentence_buffer += token
                
                # Send text chunk immediately for UI
                await websocket.send_json({
                    "type": "text_response_chunk",
                    "content": token
                })
                
                # Check for sentence end for TTS
                if token in [".", "!", "?", "\n"]:
                    # Generate Audio for this sentence
                    if sentence_buffer.strip():
                        audio_data = tts_service.generate_audio(sentence_buffer)
                        # Encode audio to base64
                        audio_b64 = base64.b64encode(audio_data).decode('utf-8')
                        
                        await websocket.send_json({
                            "type": "audio_chunk",
                            "data": audio_b64
                        })
                        sentence_buffer = ""
            
            # Send 'done' signal
            await websocket.send_json({"type": "done"})

    except WebSocketDisconnect:
        print("Cliente desconectado")
    except Exception as e:
        print(f"Erro no WebSocket: {e}")
        try:
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
