import { supabase } from './supabase';
import { supabaseAdmin } from './supabase-admin';
import { Product, CarouselImage, Category, HomeBlock } from './utils';

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
     // Sanitize products to match DB schema
     const dbProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category,
        slug: p.slug,
        video_url: p.video_url || null,
        specs: p.specs || null
     }));

     const { error } = await supabaseAdmin
        .from('products')
        .upsert(dbProducts, { onConflict: 'id' });

     if (error) {
        console.error("Supabase save error:", error);
        throw error;
     }
  } catch (error) {
      console.error("Error saving products:", error);
      throw error;
  }
}

// --- Products CRUD ---

export async function createProduct(product: Partial<Product>) {
    try {
        // Sanitize product to only include DB columns
        const dbProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            slug: product.slug,
            video_url: product.video_url || null,
            specs: product.specs || null
            // cost, supplier, etc. are NOT in DB yet, so we exclude them to prevent errors
        };

        const { data, error } = await supabaseAdmin
            .from('products')
            .insert(dbProduct)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
    try {
        // Sanitize updates
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.image !== undefined) dbUpdates.image = updates.image;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
        if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
        if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
        if (updates.video_url !== undefined) dbUpdates.video_url = updates.video_url;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.specs !== undefined) dbUpdates.specs = updates.specs;

        const { data, error } = await supabaseAdmin
            .from('products')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
}

export async function deleteProduct(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error("Error deleting product:", error);
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

        // Sanitize input
        const dbCategory = {
            name: category.name,
            slug: category.slug,
            parent_id: category.parent_id || null, // Ensure empty string becomes null
            display_order: category.display_order ?? nextOrder,
            icon: category.icon || null,
            active: category.active ?? true
        };

        const { data, error } = await supabaseAdmin
            .from('categories')
            .insert(dbCategory)
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
        
        // Sanitize updates
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
        if (updates.parent_id !== undefined) dbUpdates.parent_id = updates.parent_id || null;
        if (updates.display_order !== undefined) dbUpdates.display_order = updates.display_order;
        if (updates.icon !== undefined) dbUpdates.icon = updates.icon || null;
        if (updates.active !== undefined) dbUpdates.active = updates.active;

        const { data, error } = await supabaseAdmin
            .from('categories')
            .update(dbUpdates)
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

export async function createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) {
    try {
        // 1. Create Order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create Order Items
        const itemsWithOrderId = items.map(item => ({
            ...item,
            order_id: order.id
        }));

        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(itemsWithOrderId);

        if (itemsError) throw itemsError;

        return order;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
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

// --- Home Blocks ---

export async function getHomeBlocks(activeOnly = true): Promise<HomeBlock[]> {
  try {
    let query = supabase
      .from('home_blocks')
      .select('*')
      .order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist yet, return empty array gracefully
      if (error.code === '42P01') return [];
      console.error("Supabase error (home_blocks):", error);
      return [];
    }

    return data as HomeBlock[];
  } catch (error) {
    console.error("Error fetching home blocks:", error);
    return [];
  }
}

export async function createHomeBlock(block: Partial<HomeBlock>) {
  try {
     // Get max order
    const { data: maxOrderData } = await supabaseAdmin
        .from('home_blocks')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
    
    const nextOrder = (maxOrderData?.[0]?.display_order ?? -1) + 1;

    const { data, error } = await supabaseAdmin
      .from('home_blocks')
      .insert({
        ...block,
        display_order: nextOrder
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating home block:", error);
    throw error;
  }
}

export async function updateHomeBlock(id: string, updates: Partial<HomeBlock>) {
  try {
    const { data, error } = await supabaseAdmin
      .from('home_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating home block:", error);
    throw error;
  }
}

export async function deleteHomeBlock(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('home_blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting home block:", error);
    throw error;
  }
}
