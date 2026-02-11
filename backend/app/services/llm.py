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
            with requests.post(url, json=payload, stream=True) as response:
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
            print(f"Error calling Ollama: {e}")
            yield f"Erro ao conectar com o cérebro: {str(e)}"

llm_service = LLMService()
