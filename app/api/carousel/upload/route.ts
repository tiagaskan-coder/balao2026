import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('carousel')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Storage upload failed: " + uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('carousel')
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
