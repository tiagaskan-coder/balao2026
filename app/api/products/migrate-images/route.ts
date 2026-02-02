import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Product } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Helper to download image
async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), contentType };
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 });
    }

    const results: any[] = [];

    // Process each product
    for (const id of ids) {
      try {
        // 1. Get product
        const { data: product, error: fetchError } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError || !product) {
          results.push({ id, status: 'error', error: 'Product not found' });
          continue;
        }

        // Skip if already migrated or internal supabase url
        if (product.image && product.image.includes('supabase.co')) {
          results.push({ id, status: 'skipped', message: 'Already Supabase URL' });
          continue;
        }

        if (!product.image) {
           results.push({ id, status: 'skipped', message: 'No image' });
           continue;
        }

        // 2. Download image
        const downloadResult = await downloadImage(product.image);
        if (!downloadResult) {
          // Log error in DB
           await supabaseAdmin.from('products').update({
              migration_status: 'error',
              migration_error: 'Download failed'
           }).eq('id', id);

           results.push({ id, status: 'error', error: 'Download failed' });
           continue;
        }

        const { buffer, contentType } = downloadResult;

        // Size Validation (5MB)
        if (buffer.length > 5 * 1024 * 1024) {
            await supabaseAdmin.from('products').update({
                migration_status: 'error',
                migration_error: 'Image too large (>5MB)'
            }).eq('id', id);
            results.push({ id, status: 'error', error: 'Image too large (>5MB)' });
            continue;
        }
        
        // Extension
        let ext = 'jpg';
        if (contentType.includes('png')) ext = 'png';
        if (contentType.includes('webp')) ext = 'webp';
        if (contentType.includes('gif')) ext = 'gif';

        const fileName = `produtos/${id}/imagem.${ext}`;

        // 3. Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin
          .storage
          .from('products')
          .upload(fileName, buffer, {
            contentType,
            upsert: true
          });

        if (uploadError) {
           throw uploadError;
        }

        // 4. Get Public URL
        const { data: publicUrlData } = supabaseAdmin
          .storage
          .from('products')
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;

        // 5. Update Product
        // Backup original image if not already backed up
        const originalImage = product.original_image || product.image;

        const { error: updateError } = await supabaseAdmin
          .from('products')
          .update({
            image: publicUrl,
            original_image: originalImage,
            migration_status: 'migrated',
            migrated_at: new Date().toISOString(),
            migration_error: null
          })
          .eq('id', id);

        if (updateError) throw updateError;

        results.push({ id, status: 'success', newUrl: publicUrl });

      } catch (error: any) {
        console.error(`Migration error for product ${id}:`, error);
        
        // Try to log error to DB
        await supabaseAdmin.from('products').update({
            migration_status: 'error',
            migration_error: error.message || 'Unknown error'
        }).eq('id', id);

        results.push({ id, status: 'error', error: error.message });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Migration API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
