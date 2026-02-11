import requests
import json
import os

class LLMService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.model = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b-instruct")

    def generate_stream(self, prompt: str, system_prompt: str = None):
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": 0.7,
                "num_ctx": 4096
            }
        }

        if system_prompt:
            payload["system"] = system_prompt

        try:
            with requests.post(url, json=payload, stream=True, timeout=2) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line:
                        body = json.loads(line)
                        token = body.get("response", "")
                        if token:
                            yield token
                        if body.get("done", False):
                            break
        except Exception as e:
            print(f"Ollama connection failed ({e}). Using Fallback Mock LLM.")
            # Fallback Mock logic
            import time
            import random
            
            # Simple keyword-based responses
            mock_response = ""
            lower_prompt = prompt.lower()
            
            if "produtos encontrados" in lower_prompt:
                mock_response = "Encontrei ótimas opções para você! Veja só estes produtos que separei. O preço está excelente e temos pronta entrega. Gostaria de saber mais detalhes sobre algum deles?"
            elif "olá" in lower_prompt or "oi" in lower_prompt:
                mock_response = "Olá! Sou o assistente virtual do Balão da Informática. Como posso ajudar você hoje? Estou aqui para encontrar o melhor hardware para seu setup."
            elif "preço" in lower_prompt:
                mock_response = "Nossos preços são atualizados diariamente para garantir a melhor oferta. Dê uma olhada nessas opções que encontrei."
            else:
                mock_response = "Entendi. Vou verificar nosso estoque para encontrar exatamente o que você precisa. Um momento..."
            
            # Simulate streaming
            for word in mock_response.split():
                yield word + " "
                time.sleep(0.05)

llm_service = LLMService()
