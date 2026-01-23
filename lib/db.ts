import { supabase } from './supabase';
import { Product } from './utils';

// Fallback to empty array if connection fails or env vars missing
export async function getProducts(): Promise<Product[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
    
    const { data, error } = await supabase
      .from('products')
      .select('*');
      
    if (error) {
      console.error("Supabase error:", error);
      return [];
    }
    
    return data as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function saveProducts(products: Product[]) {
  try {
     if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

     const { error } = await supabase
        .from('products')
        .upsert(products, { onConflict: 'id' });

     if (error) {
        console.error("Supabase save error:", error);
        throw error;
     }
  } catch (error) {
      console.error("Error saving products:", error);
      throw error;
  }
}
