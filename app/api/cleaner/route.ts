import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cleanerSchedule } from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const conditions = [];
  if (from) conditions.push(gte(cleanerSchedule.date, from));
  if (to) conditions.push(lte(cleanerSchedule.date, to));

  const data = await db
    .select()
    .from(cleanerSchedule)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(cleanerSchedule.date);

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { date, startTime, endTime, notes, recurringRule } = body;

  if (!date || !startTime || !endTime) {
    return NextResponse.json({ error: "date, startTime, endTime required" }, { status: 400 });
  }

  const [created] = await db
    .insert(cleanerSchedule)
    .values({ date, startTime, endTime, notes, recurringRule })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
