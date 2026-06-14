import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, subscriptionEvents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  // Cascade deletes subscription_events via FK
  await db.delete(subscriptions).where(eq(subscriptions.id, numId));
  return NextResponse.json({ ok: true });
}
