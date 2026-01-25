import { NextResponse } from 'next/server';
import { deleteCarouselImage, updateCarouselImage } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCarouselImage(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting carousel image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    await updateCarouselImage(params.id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating carousel image:", error);
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}
