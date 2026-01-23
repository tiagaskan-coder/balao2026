
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let imageUrl = "";
  try {
    const body = await req.json();
    imageUrl = body.imageUrl;
    const { options } = body;
    
    if (!imageUrl) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    // 1. Download image
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Process (Upscale & Sharpen) using Sharp (simulating AI Super-Resolution)
    // Scale factor default 2x
    const scale = options?.scale || 2;
    
    // Get metadata to know dimensions
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 800;
    const newWidth = Math.round(originalWidth * scale);
    
    // Pipeline: Resize (Lanczos3) -> Sharpen -> WebP
    let pipeline = sharp(buffer)
      .resize(newWidth, null, { 
        kernel: 'lanczos3', // High quality resampling
        fit: 'inside'
      });

    // Apply sharpening if requested (or default)
    if (options?.sharpen !== false) {
       pipeline = pipeline.sharpen({
         sigma: 1.5, // Control the "width" of the sharpening
         m1: 0.5,    // Slope of "flat" areas
         m2: 0.5,    // Slope of "edge" areas
         x1: 2,      // Threshold between "flat" and "edge"
         y2: 10,     // Maximum amount of brightening
         y3: 20      // Maximum amount of darkening
       });
    }

    const processedBuffer = await pipeline
      .toFormat("webp", { quality: 90 })
      .toBuffer();

    // 3. Upload to Supabase Storage
    // We assume a 'products' bucket exists. If not, this might fail.
    // Ideally we would check/create bucket, but client SDK doesn't always allow bucket creation.
    const filename = `enhanced-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    
    // Try to upload
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filename, processedBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
       console.error("Storage upload error:", uploadError);
       // If upload fails (e.g. no bucket), we can't provide a URL for the enhanced image.
       // Return failure for the *processing* step, but the original image is still valid.
       return NextResponse.json({ 
         success: false, 
         error: "Storage upload failed (Bucket 'products' missing?): " + uploadError.message,
         originalUrl: imageUrl 
       });
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filename);

    return NextResponse.json({ 
      success: true, 
      processedUrl: publicUrl,
      originalUrl: imageUrl,
      details: {
        originalWidth,
        newWidth,
        format: "webp"
      }
    });

  } catch (error: any) {
    console.error("Image processing error:", error);
    return NextResponse.json({ 
        success: false,
        error: error.message || "Unknown error",
        originalUrl: imageUrl 
    }, { status: 500 });
  }
}
