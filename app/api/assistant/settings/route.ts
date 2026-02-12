import { NextResponse } from "next/server";
import { supabaseAdmin, hasAdmin } from "@/lib/supabase-admin";

const TABLE = "assistant_settings";
const KEY = "default";

export async function GET() {
  try {
    if (!hasAdmin) {
      return NextResponse.json({
        greeting: "Olá! Sou o assistente do Balão da Informática. Como posso te ajudar hoje?",
        voiceEnabled: true,
        maxResults: 5,
      });
    }

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("greeting, voice_enabled, max_results")
      .eq("key", KEY)
      .single();

    if (error || !data) {
      return NextResponse.json({
        greeting: "Olá! Sou o assistente do Balão da Informática. Como posso te ajudar hoje?",
        voiceEnabled: true,
        maxResults: 5,
      });
    }

    return NextResponse.json({
      greeting: data.greeting ?? "Olá! Sou o assistente do Balão da Informática. Como posso te ajudar hoje?",
      voiceEnabled: Boolean(data.voice_enabled ?? true),
      maxResults: Number(data.max_results ?? 5),
    });
  } catch {
    return NextResponse.json({
      greeting: "Olá! Sou o assistente do Balão da Informática. Como posso te ajudar hoje?",
      voiceEnabled: true,
      maxResults: 5,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = {
      key: KEY,
      greeting: typeof body.greeting === "string" ? body.greeting : null,
      voice_enabled: typeof body.voiceEnabled === "boolean" ? body.voiceEnabled : null,
      max_results: typeof body.maxResults === "number" ? body.maxResults : null,
    };

    if (!hasAdmin) {
      return NextResponse.json({ status: "no-admin" }, { status: 200 });
    }

    const { error } = await supabaseAdmin
      .from(TABLE)
      .upsert(payload, { onConflict: "key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown" }, { status: 500 });
  }
}
