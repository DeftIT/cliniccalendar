import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cleanerSchedule } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(cleanerSchedule).where(eq(cleanerSchedule.id, Number(id)));
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [updated] = await db
    .update(cleanerSchedule)
    .set(body)
    .where(eq(cleanerSchedule.id, Number(id)))
    .returning();
  return NextResponse.json(updated);
}
