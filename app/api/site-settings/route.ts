import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .in("key", ["theme"])
      ;
    if (error) {
      // If table missing, return default
      return NextResponse.json({ theme: "default" });
    }
    const themeRow = (data || []).find((r: any) => r.key === "theme");
    return NextResponse.json({ theme: themeRow?.value || "default" });
  } catch (e) {
    return NextResponse.json({ theme: "default" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const theme = typeof body?.theme === "string" ? body.theme : "default";
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: "theme", value: theme });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
