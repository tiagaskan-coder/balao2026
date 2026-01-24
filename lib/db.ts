import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { Product, CarouselImage, Category } from './utils';

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

// --- Categories ---

export async function getCategories(): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error("Supabase error (categories):", error);
            return [];
        }

        return data as Category[];
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function createCategory(category: Partial<Category>) {
    try {
        // Get max order
        const { data: maxOrderData } = await supabaseAdmin
            .from('categories')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);
        
        const nextOrder = (maxOrderData?.[0]?.display_order ?? -1) + 1;

        const { data, error } = await supabaseAdmin
            .from('categories')
            .insert({
                ...category,
                display_order: category.display_order ?? nextOrder
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
}

export async function updateCategory(id: string, updates: Partial<Category>) {
    try {
        console.log(`[DB] Updating category ${id} via supabaseAdmin`, updates);
        const { data, error } = await supabaseAdmin
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Supabase error (update category):", error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
}

export async function deleteCategory(id: string) {
    try {
        console.log(`[DB] Deleting category ${id} via supabaseAdmin`);
        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Supabase error (delete category):", error);
            throw error;
        }
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
}

// --- Orders ---

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    user_id?: string;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    total: number;
    customer_name: string;
    customer_email: string;
    customer_whatsapp: string;
    address: any;
    created_at: string;
    items?: OrderItem[];
}

export async function getOrders(): Promise<Order[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('orders')
            .select(`
                *,
                items:order_items(*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase error (orders):", error);
            return [];
        }

        return data as Order[];
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

export async function updateOrderStatus(id: string, status: string) {
    try {
        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}

export async function deleteOrder(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Error deleting order:", error);
        throw error;
    }
}
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error("[DB] Supabase update error:", error);
            throw error;
        }
        
        if (!data || data.length === 0) {
             console.error(`[DB] Category ${id} not found or not updated.`);
             throw new Error(`Category with ID ${id} not found.`);
        }

        console.log(`[DB] Category ${id} updated successfully`);
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
}

export async function deleteCategory(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
}
