from app.main import app
from mangum import Mangum

# Vercel Serverless Function Entrypoint
# Mangum is an adapter for running ASGI applications in AWS Lambda and other serverless environments
handler = Mangum(app)
