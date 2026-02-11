import sys
import os

# Adiciona o diretório pai ao sys.path para garantir que a Vercel encontre o pacote 'app'
# Quando rodando na Vercel, o diretório de trabalho pode não ser a raiz do backend
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from app.main import app
from mangum import Mangum

# Vercel Serverless Function Entrypoint
# Mangum is an adapter for running ASGI applications in AWS Lambda and other serverless environments
handler = Mangum(app)
