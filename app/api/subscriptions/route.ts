import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export async function GET() {
  const data = await db.select().from(subscriptions);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomId, name, type, url, color } = body;

  if (!roomId || !name || !type || !url) {
    return NextResponse.json({ error: "roomId, name, type, url required" }, { status: 400 });
  }

  const [created] = await db
    .insert(subscriptions)
    .values({ roomId, name, type, url, color })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
