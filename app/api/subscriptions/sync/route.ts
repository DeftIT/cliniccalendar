import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, subscriptionEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchAndParseICal, fetchAndParseRSS } from "@/lib/ical";

export async function POST(req: NextRequest) {
  // Optional: sync a specific subscription id, or all
  const body = await req.json().catch(() => ({}));
  const targetId = body?.id ? Number(body.id) : null;

  const subs = await db
    .select()
    .from(subscriptions)
    .where(targetId ? eq(subscriptions.id, targetId) : undefined);

  const results: { id: number; synced: number; error?: string }[] = [];

  for (const sub of subs) {
    try {
      const events =
        sub.type === "ical"
          ? await fetchAndParseICal(sub.url)
          : await fetchAndParseRSS(sub.url);

      // Replace all cached events for this subscription
      await db.delete(subscriptionEvents).where(eq(subscriptionEvents.subscriptionId, sub.id));

      if (events.length) {
        await db.insert(subscriptionEvents).values(
          events.map((e) => ({
            subscriptionId: sub.id,
            roomId: sub.roomId,
            title: e.title,
            date: e.date,
            startTime: e.startTime ?? null,
            endTime: e.endTime ?? null,
            uid: e.uid,
          }))
        );
      }

      await db
        .update(subscriptions)
        .set({ lastSynced: new Date() })
        .where(eq(subscriptions.id, sub.id));

      results.push({ id: sub.id, synced: events.length });
    } catch (err) {
      results.push({ id: sub.id, synced: 0, error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
