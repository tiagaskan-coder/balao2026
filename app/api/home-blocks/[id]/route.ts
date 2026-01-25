
import { NextResponse } from "next/server";
import { updateHomeBlock, deleteHomeBlock } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const updatedBlock = await updateHomeBlock(id, updates);
    return NextResponse.json(updatedBlock);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update home block" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteHomeBlock(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete home block" }, { status: 500 });
  }
}
