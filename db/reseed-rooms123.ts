import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { inArray } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const weeks = [
  { mon: "2026-06-15", tue: "2026-06-16", wed: "2026-06-17", thu: "2026-06-18", fri: "2026-06-19" },
  { mon: "2026-06-22", tue: "2026-06-23", wed: "2026-06-24", thu: "2026-06-25", fri: "2026-06-26" },
  { mon: "2026-06-29", tue: "2026-06-30", wed: "2026-07-01", thu: "2026-07-02", fri: "2026-07-03" },
  { mon: "2026-07-06", tue: "2026-07-07", wed: "2026-07-08", thu: "2026-07-09", fri: "2026-07-10" },
];

const bookings: schema.NewBooking[] = [];

for (const w of weeks) {
  // ── Room 1: Elisa & Kate ──────────────────────────────────────────────────
  // Monday: Elisa 14:00–19:00
  bookings.push({ roomId: 1, title: "Elisa", date: w.mon, bookingType: "custom", startTime: "14:00", endTime: "19:00" });
  // Tuesday: Elisa 08:30–13:30, Kate 14:00–19:00
  bookings.push({ roomId: 1, title: "Elisa", date: w.tue, bookingType: "custom", startTime: "08:30", endTime: "13:30" });
  bookings.push({ roomId: 1, title: "Kate",  date: w.tue, bookingType: "custom", startTime: "14:00", endTime: "19:00" });
  // Wednesday: Elisa 08:30–13:30, Kate 14:00–19:00
  bookings.push({ roomId: 1, title: "Elisa", date: w.wed, bookingType: "custom", startTime: "08:30", endTime: "13:30" });
  bookings.push({ roomId: 1, title: "Kate",  date: w.wed, bookingType: "custom", startTime: "14:00", endTime: "19:00" });
  // Thursday: Kate 08:30–13:30, Elisa 14:00–19:00
  bookings.push({ roomId: 1, title: "Kate",  date: w.thu, bookingType: "custom", startTime: "08:30", endTime: "13:30" });
  bookings.push({ roomId: 1, title: "Elisa", date: w.thu, bookingType: "custom", startTime: "14:00", endTime: "19:00" });
  // Friday: Elisa 08:30–13:30
  bookings.push({ roomId: 1, title: "Elisa", date: w.fri, bookingType: "custom", startTime: "08:30", endTime: "13:30" });

  // ── Room 2: Kate & Anna ───────────────────────────────────────────────────
  // Monday: Kate 08:30–17:00
  bookings.push({ roomId: 2, title: "Kate", date: w.mon, bookingType: "custom", startTime: "08:30", endTime: "17:00" });
  // Tuesday: Anna 08:20–13:40
  bookings.push({ roomId: 2, title: "Anna", date: w.tue, bookingType: "custom", startTime: "08:20", endTime: "13:40" });
  // Wednesday: Anna 08:20–13:40
  bookings.push({ roomId: 2, title: "Anna", date: w.wed, bookingType: "custom", startTime: "08:20", endTime: "13:40" });
  // Thursday: Anna 08:20–13:40
  bookings.push({ roomId: 2, title: "Anna", date: w.thu, bookingType: "custom", startTime: "08:20", endTime: "13:40" });
  // Friday: Kate 08:30–17:00
  bookings.push({ roomId: 2, title: "Kate", date: w.fri, bookingType: "custom", startTime: "08:30", endTime: "17:00" });

  // ── Room 3: Mary & Nicki (moved from old Room 1) ─────────────────────────
  // Mon–Thu: Mary 09:00–17:00
  for (const d of [w.mon, w.tue, w.wed, w.thu]) {
    bookings.push({ roomId: 3, title: "Mary", date: d, bookingType: "custom", startTime: "09:00", endTime: "17:00" });
  }
  // Friday: Nicki 09:00–15:00
  bookings.push({ roomId: 3, title: "Nicki", date: w.fri, bookingType: "custom", startTime: "09:00", endTime: "15:00" });
}

async function reseed() {
  console.log("Deleting existing bookings for rooms 1, 2 & 3...");
  await db.delete(schema.bookings).where(inArray(schema.bookings.roomId, [1, 2, 3]));

  console.log(`Inserting ${bookings.length} new bookings...`);
  await db.insert(schema.bookings).values(bookings);
  console.log("Done.");
}

reseed().catch(console.error);
