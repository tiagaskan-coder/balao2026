import sys
import os

# Adiciona o diretório atual (raiz do projeto na Vercel) ao sys.path
# Na Vercel, a raiz do projeto é onde está o requirements.txt
current_dir = os.path.dirname(os.path.abspath(__file__)) # /var/task/api
root_dir = os.path.dirname(current_dir) # /var/task
sys.path.append(root_dir)

from backend.app.main import app
from mangum import Mangum

# Vercel Serverless Function Entrypoint
handler = Mangum(app)
