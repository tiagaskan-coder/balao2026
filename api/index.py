from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
@app.post("/api/py/chat")
async def chat_endpoint(request: ChatRequest):
    # Lógica simplificada sem dependências pesadas
    user_text = request.message
    response_text = f"Recebi sua mensagem: '{user_text}'. (Backend Vercel Online)"
    
    # Aqui entraria a lógica de LLM/Search, mas mantendo simples para garantir deploy
    return {
        "text": response_text,
        "products": []
    }

@app.get("/api/py")
async def root():
    return {"status": "online", "service": "Balão Voice Agent"}

handler = Mangum(app)
