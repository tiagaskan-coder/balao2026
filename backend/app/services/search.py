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
                # Simple fallback: split terms and try to find items matching ALL terms via ILIKE
                # This is a bit manual without a query builder, but sufficient for fallback
                # "Desktop 2025" -> name ilike %Desktop% AND name ilike %2025%
                
                terms = query.split()
                if not terms:
                    return []
                
                # Start with a base query
                db_query = self.client.table("products").select("*")
                
                # Apply ilike for each term (PostgREST syntax: column=ilike.*term*)
                # Note: supabase-py might not support chaining dynamic filters easily in a loop without re-assigning
                # Correct way in supabase-py:
                for term in terms:
                    db_query = db_query.ilike("name_description", f"%{term}%")
                
                res = db_query.execute()
                products = res.data
            
            return products
        except Exception as e:
            print(f"Error searching Supabase: {e}")
            return []

search_service = SearchService()
