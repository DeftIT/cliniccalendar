import { NextRequest, NextResponse } from "next/server";

// Vercel cron: hourly iCal refresh
// vercel.json: { "crons": [{ "path": "/api/cron/sync", "schedule": "0 * * * *" }] }
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${base}/api/subscriptions/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
