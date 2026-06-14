import { NextResponse } from "next/server";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(rooms).orderBy(asc(rooms.sortOrder));
  return NextResponse.json(data);
}
