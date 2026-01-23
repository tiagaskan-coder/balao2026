import { NextResponse } from 'next/server';
import { getCarouselImages, addCarouselImage } from '@/lib/db';

export async function GET() {
  const images = await getCarouselImages(false); // Fetch all, including inactive
  return NextResponse.json(images);
}

export async function POST(request: Request) {
  try {
    const { imageUrl, title, metadata } = await request.json();
    if (!imageUrl) {
        return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }
    const newImage = await addCarouselImage(imageUrl, title, metadata);
    return NextResponse.json(newImage);
  } catch (error) {
    console.error("Error adding carousel image:", error);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
