import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, rooms, cleanerSchedule, subscriptions } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { format, subDays } from "date-fns";

export async function GET() {
  const today = format(new Date(), "yyyy-MM-dd");
  const twoDaysAgo = format(subDays(new Date(), 2), "yyyy-MM-dd");

  const [todayBookings, recentChanges, todayCleaner, allRooms, allSubs] =
    await Promise.all([
      db
        .select({ booking: bookings, room: rooms })
        .from(bookings)
        .innerJoin(rooms, eq(bookings.roomId, rooms.id))
        .where(eq(bookings.date, today)),

      db
        .select()
        .from(bookings)
        .where(gte(bookings.updatedAt, new Date(subDays(new Date(), 2))))
        .orderBy(desc(bookings.updatedAt))
        .limit(20),

      db
        .select()
        .from(cleanerSchedule)
        .where(eq(cleanerSchedule.date, today)),

      db.select().from(rooms),

      db.select().from(subscriptions),
    ]);

  return NextResponse.json({
    today,
    todayBookings,
    recentChanges,
    todayCleaner,
    rooms: allRooms,
    subscriptions: allSubs,
  });
}
