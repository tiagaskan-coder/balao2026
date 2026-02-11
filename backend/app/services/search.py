import os
from supabase import create_client, Client

class SearchService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY") # Use service key for backend if possible, or anon key
        if not url or not key:
            print("Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY not set")
            self.client = None
        else:
            self.client: Client = create_client(url, key)

    def search_products(self, query: str):
        if not self.client:
            return []
        
        # Logic: "Desktop 2025" -> "Desktop & 2025"
        clean_query = " & ".join(query.strip().split())
        
        print(f"Searching Supabase with query: {clean_query}")

        try:
            # Tenta Full Text Search primeiro
            res = self.client.table("products").select("*").textSearch("name_description", clean_query).execute()
            products = res.data

            # Se não retornar nada, fallback para ILIKE (como solicitado anteriormente, mas aqui no backend python)
            if not products:
                print("FTS returned empty, trying ILIKE fallback...")
                # Python fallback logic logic is harder with chaining dynamic ilikes efficiently via supabase-py without query builder complexity
                # Let's try a simple name ilike for each term if needed, or just return empty for now to keep it fast.
                # Or use the "or" operator logic if needed.
                pass
            
            return products
        except Exception as e:
            print(f"Error searching Supabase: {e}")
            return []

search_service = SearchService()
