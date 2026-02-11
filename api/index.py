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

async def process_chat(request: ChatRequest):
    user_text = request.message
    # Lógica de resposta simples e rápida
    response_text = f"Entendi: '{user_text}'. (Processado pelo Python Vercel)"
    
    return {
        "text": response_text,
        "products": []
    }

# Registrar rotas para todas as variações possíveis de caminho
app.post("/api/chat")(process_chat)
app.post("/api/py/chat")(process_chat)
app.post("/chat")(process_chat)
app.post("/")(process_chat)

@app.get("/api/py")
async def root_py():
    return {"status": "online", "service": "Balão Voice Agent", "path": "/api/py"}

@app.get("/")
async def root():
    return {"status": "online", "service": "Balão Voice Agent (Root)"}

# Catch-all para debug de rotas não mapeadas
@app.api_route("/{path_name:path}", methods=["GET", "POST", "OPTIONS"])
async def catch_all(path_name: str, request: Request):
    return {
        "status": "catch_all_triggered",
        "path_received": path_name,
        "method": request.method,
        "message": "Rota não encontrada especificamente, mas capturada pelo handler."
    }

handler = Mangum(app)
