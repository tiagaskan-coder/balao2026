import { NextResponse } from "next/server";
import { sendSystemNotification } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, id } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await sendSystemNotification('Novo Usuário Cadastrado', {
      email,
      userId: id,
      source: 'site_registration'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
