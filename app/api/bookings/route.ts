import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [];
  if (from) conditions.push(gte(bookings.date, from));
  if (to) conditions.push(lte(bookings.date, to));

  const data = await db
    .select()
    .from(bookings)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(bookings.date);

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomId, title, date, bookingType, startTime, endTime, notes } = body;

  if (!roomId || !title || !date) {
    return NextResponse.json({ error: "roomId, title, date required" }, { status: 400 });
  }

  const [created] = await db
    .insert(bookings)
    .values({ roomId, title, date, bookingType: bookingType ?? "full_day", startTime, endTime, notes })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
