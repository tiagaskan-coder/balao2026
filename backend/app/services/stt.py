import os

try:
    from faster_whisper import WhisperModel
    HAS_WHISPER = True
except ImportError:
    HAS_WHISPER = False
    print("Aviso: faster_whisper não instalado. STT será simulado.")

class STTService:
    def __init__(self):
        self.model = None
        if HAS_WHISPER:
            try:
                import numpy as np
                model_size = os.getenv("WHISPER_MODEL", "distil-large-v3")
                print(f"Loading Whisper Model: {model_size}...")
                self.model = WhisperModel(model_size, device="auto", compute_type="float16")
                print("Whisper Model loaded successfully.")
            except Exception as e:
                print(f"Error loading Whisper Model: {e}")
        else:
            print("STT Service running in MOCK mode.")

    def transcribe(self, audio_data) -> str:
        if not self.model:
            return "Simulação: Áudio recebido mas STT indisponível."
        
        # Assume audio_data is correct format if model exists
        segments, info = self.model.transcribe(audio_data, beam_size=5, language="pt")
        text = "".join([segment.text for segment in segments])
        return text.strip()

stt_service = STTService()
