import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const PROFILE_URL = "https://www.instagram.com/balaodainformatica_castelo/";
  
  try {
    const supabase = await createClient();

    // 1. Try to fetch valid Instagram Token from Database
    const { data: integration } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('service', 'instagram')
      .single();

    if (integration && integration.access_token) {
        try {
            // Fetch real media from Instagram Graph API
            const instaRes = await fetch(
                `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&access_token=${integration.access_token}&limit=6`
            );
            
            const instaData = await instaRes.json();

            if (instaData.data && Array.isArray(instaData.data)) {
                return NextResponse.json(instaData.data);
            } else if (instaData.error) {
                console.warn("Instagram API Error (falling back to mock):", instaData.error);
                // Token might be expired, continue to fallback
            }
        } catch (e) {
            console.error("Failed to fetch from Instagram API:", e);
        }
    }
    
    // 2. Fallback: Fetch real products from database to simulate "Recent Posts"
    const { data: products } = await supabase
      .from('products')
      .select('id, name, image, created_at')
      .not('image', 'is', null)
      .neq('image', '')
      .order('created_at', { ascending: false })
      .limit(6);

    if (!products || products.length === 0) {
       // 3. Last Resort Fallback
       return NextResponse.json(Array.from({ length: 6 }).map((_, i) => ({
        id: `mock-${i}`,
        permalink: PROFILE_URL,
        media_url: "/logo.png",
        caption: "Siga o Balão da Informática no Instagram!",
        like_count: 0,
        comments_count: 0,
        timestamp: new Date().toISOString(),
        media_type: "IMAGE"
      })));
    }

    // Map products to Instagram Post format
    const posts = products.map(product => ({
      id: product.id,
      permalink: PROFILE_URL,
      media_url: product.image,
      caption: product.name,
      like_count: Math.floor(Math.random() * 50) + 10,
      comments_count: Math.floor(Math.random() * 5),
      timestamp: product.created_at,
      media_type: "IMAGE"
    }));

    return NextResponse.json(posts);

  } catch (error) {
    console.error("Error generating instagram feed:", error);
    return NextResponse.json([]);
  }
}
