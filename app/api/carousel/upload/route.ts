import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `carousel-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
    const BUCKET_NAME = 'carousel';

    // Try to use service role key for storage operations if available (allows bucket creation)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ptqqvezawobgnheesgvh.supabase.co";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const storageClient = serviceRoleKey 
        ? createClient(supabaseUrl, serviceRoleKey)
        : supabase;

    // Attempt to ensure bucket exists (only works with service role)
    if (serviceRoleKey) {
        try {
            const { data: buckets } = await storageClient.storage.listBuckets();
            const bucketExists = buckets?.some((b: any) => b.name === BUCKET_NAME);
            
            if (!bucketExists) {
                console.log(`Bucket ${BUCKET_NAME} not found. Creating...`);
                await storageClient.storage.createBucket(BUCKET_NAME, {
                    public: true,
                    fileSizeLimit: 10485760, // 10MB
                    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
                });
            }
        } catch (e) {
            console.warn("Failed to check/create bucket:", e);
        }
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await storageClient.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Provide a helpful error if it's the bucket missing error and we couldn't create it
      if (uploadError.message.includes("Bucket not found")) {
          return NextResponse.json({ 
              error: `Erro: O bucket '${BUCKET_NAME}' não existe no Supabase. Crie-o manualmente no painel do Supabase (Storage -> New Bucket -> 'carousel' -> Public).` 
          }, { status: 500 });
      }
      return NextResponse.json({ error: "Storage upload failed: " + uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = storageClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    // Get next order
    const { data: maxOrderData } = await supabase
        .from('carousel_images')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
    
    const nextOrder = (maxOrderData?.[0]?.display_order ?? -1) + 1;

    // Save to database
    const { data, error: dbError } = await supabase
        .from('carousel_images')
        .insert({
            image_url: publicUrl,
            title: title || file.name,
            display_order: nextOrder,
            active: true,
            metadata: {
                size: file.size,
                type: file.type,
                origin: 'upload'
            }
        })
        .select()
        .single();

    if (dbError) {
        console.error("Database insert error:", dbError);
        return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
