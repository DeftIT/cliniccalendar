import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const ROOMS = [
  { name: "Room 1", color: "#4285F4", sortOrder: 1 },
  { name: "Room 2", color: "#0F9D58", sortOrder: 2 },
  { name: "Room 3", color: "#F4B400", sortOrder: 3 },
  { name: "Room 4", color: "#DB4437", sortOrder: 4 },
];

async function seed() {
  console.log("Seeding rooms...");
  for (const room of ROOMS) {
    await db.insert(schema.rooms).values(room).onConflictDoNothing();
  }
  console.log("Done.");
}

seed().catch(console.error);
