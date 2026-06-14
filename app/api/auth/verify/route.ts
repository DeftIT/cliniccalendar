import { NextRequest, NextResponse } from "next/server";
import { verifyPin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  if (!pin) return NextResponse.json({ error: "PIN required" }, { status: 400 });

  const valid = await verifyPin(String(pin));
  if (!valid) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });

  return NextResponse.json({ ok: true });
}
