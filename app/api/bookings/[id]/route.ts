import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(bookings).where(eq(bookings.id, Number(id)));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title, date, bookingType, startTime, endTime, notes, roomId } = body;

  const [updated] = await db
    .update(bookings)
    .set({
      ...(title !== undefined && { title }),
      ...(date !== undefined && { date }),
      ...(bookingType !== undefined && { bookingType }),
      ...(startTime !== undefined && { startTime }),
      ...(endTime !== undefined && { endTime }),
      ...(notes !== undefined && { notes }),
      ...(roomId !== undefined && { roomId }),
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, Number(id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(bookings).where(eq(bookings.id, Number(id)));
  return NextResponse.json({ ok: true });
}
