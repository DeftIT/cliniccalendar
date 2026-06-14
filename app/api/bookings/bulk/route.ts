import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { addDays, eachDayOfInterval, parseISO, getDay } from "date-fns";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    roomIds,
    fromDate,
    toDate,
    bookingType,
    startTime,
    endTime,
    title,
    notes,
    skipWeekends,
  } = body;

  if (!roomIds?.length || !fromDate || !toDate || !title) {
    return NextResponse.json({ error: "roomIds, fromDate, toDate, title required" }, { status: 400 });
  }

  const days = eachDayOfInterval({
    start: parseISO(fromDate),
    end: parseISO(toDate),
  });

  const toInsert = [];
  for (const day of days) {
    const dow = getDay(day); // 0=Sun, 6=Sat
    if (skipWeekends && (dow === 0 || dow === 6)) continue;

    const dateStr = day.toISOString().slice(0, 10);
    for (const roomId of roomIds) {
      toInsert.push({
        roomId: Number(roomId),
        title,
        date: dateStr,
        bookingType: bookingType ?? "full_day",
        startTime: startTime ?? null,
        endTime: endTime ?? null,
        notes: notes ?? null,
      });
    }
  }

  if (!toInsert.length) {
    return NextResponse.json({ created: 0 });
  }

  const created = await db.insert(bookings).values(toInsert).returning();
  return NextResponse.json({ created: created.length }, { status: 201 });
}
