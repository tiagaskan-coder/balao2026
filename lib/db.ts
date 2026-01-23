import { supabase } from './supabase';
import { Product, CarouselImage } from './utils';

// Fallback to empty array if connection fails or env vars missing
export async function getProducts(): Promise<Product[]> {
  try {
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

export async function getCarouselImages(activeOnly = true): Promise<CarouselImage[]> {
  try {
    let query = supabase
      .from('carousel_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error (carousel):", error);
      return [];
    }

    return data as CarouselImage[];
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    return [];
  }
}

export async function addCarouselImage(imageUrl: string, title?: string, metadata?: any) {
    try {
        // Get max order to append to end
        const { data: maxOrderData } = await supabase
            .from('carousel_images')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);
        
        const nextOrder = (maxOrderData?.[0]?.display_order ?? -1) + 1;

        const { data, error } = await supabase
            .from('carousel_images')
            .insert({
                image_url: imageUrl,
                title,
                display_order: nextOrder,
                active: true,
                metadata: metadata || {}
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error adding carousel image:", error);
        throw error;
    }
}

export async function saveImportHistory(history: { 
    product_count: number; 
    price_percentage: number; 
    applied_category: string; 
    applied_scope: string; 
}) {
    try {
        const { error } = await supabase
            .from('import_history')
            .insert({
                product_count: history.product_count,
                price_percentage: history.price_percentage,
                applied_category: history.applied_category,
                applied_scope: history.applied_scope,
                created_at: new Date().toISOString()
            });

        if (error) throw error;
    } catch (error) {
        console.error("Error saving import history:", error);
        // Don't throw, just log, so it doesn't break the import flow
    }
}

export async function deleteCarouselImage(id: string) {
    try {
        const { error } = await supabase
            .from('carousel_images')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        console.error("Error deleting carousel image:", error);
        throw error;
    }
}

export async function updateCarouselImage(id: string, updates: Partial<CarouselImage>) {
    try {
        const { error } = await supabase
            .from('carousel_images')
            .update(updates)
            .eq('id', id);
        
        if (error) throw error;
    } catch (error) {
        console.error("Error updating carousel image:", error);
        throw error;
    }
}
