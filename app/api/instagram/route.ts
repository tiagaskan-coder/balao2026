import { NextResponse } from 'next/server';

export async function GET() {
  // NOTE: To get real Instagram data, we need an Access Token from the Instagram Basic Display API.
  // Since we don't have one configured, we'll return a static fallback that links to the profile.
  // This ensures the UI component renders correctly with a "Follow Us" call to action.

  const PROFILE_URL = "https://www.instagram.com/balaodainformatica_castelo/";
  
  // In a real implementation, we would:
  // 1. Fetch `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${TOKEN}`
  // 2. Return the data.data array.

  // Mock Data for UI Preview
  const mockPosts = Array.from({ length: 5 }).map((_, i) => ({
    id: `mock-${i}`,
    permalink: PROFILE_URL,
    media_url: "/logo.png", // Using local logo as placeholder
    caption: "Siga o Balão da Informática no Instagram para ofertas exclusivas!",
    like_count: 0,
    comments_count: 0,
    timestamp: new Date().toISOString()
  }));

  return NextResponse.json(mockPosts);
}
