import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Generate dates for the next 4 weeks from Mon 16 Jun 2026
const weeks = [
  { mon: "2026-06-15", tue: "2026-06-16", wed: "2026-06-17", thu: "2026-06-18", fri: "2026-06-19" },
  { mon: "2026-06-22", tue: "2026-06-23", wed: "2026-06-24", thu: "2026-06-25", fri: "2026-06-26" },
  { mon: "2026-06-29", tue: "2026-06-30", wed: "2026-07-01", thu: "2026-07-02", fri: "2026-07-03" },
  { mon: "2026-07-06", tue: "2026-07-07", wed: "2026-07-08", thu: "2026-07-09", fri: "2026-07-10" },
];

const bookings: schema.NewBooking[] = [];

for (const w of weeks) {
  // Room 1 — Mary: Mon–Thu 9:00–17:00
  for (const d of [w.mon, w.tue, w.wed, w.thu]) {
    bookings.push({ roomId: 1, title: "Mary", date: d, bookingType: "custom", startTime: "09:00", endTime: "17:00" });
  }
  // Room 1 — Nicki: Friday 9:00–15:00
  bookings.push({ roomId: 1, title: "Nicki", date: w.fri, bookingType: "custom", startTime: "09:00", endTime: "15:00" });

  // Room 2 — Elisa: Monday & Friday 9:00–17:00
  bookings.push({ roomId: 2, title: "Elisa", date: w.mon, bookingType: "custom", startTime: "09:00", endTime: "17:00" });
  bookings.push({ roomId: 2, title: "Elisa", date: w.fri, bookingType: "custom", startTime: "09:00", endTime: "17:00" });

  // Room 3 — Anna: Tue, Wed, Thu 8:20–13:50
  for (const d of [w.tue, w.wed, w.thu]) {
    bookings.push({ roomId: 3, title: "Anna", date: d, bookingType: "custom", startTime: "08:20", endTime: "13:50" });
  }

  // Room 4 — Proactive Physio: Mon–Fri 9:00–17:00
  for (const d of [w.mon, w.tue, w.wed, w.thu, w.fri]) {
    bookings.push({ roomId: 4, title: "Proactive Physio", date: d, bookingType: "custom", startTime: "09:00", endTime: "17:00" });
  }
}

async function seed() {
  console.log(`Inserting ${bookings.length} bookings...`);
  await db.insert(schema.bookings).values(bookings);
  console.log("Done.");
}

seed().catch(console.error);
