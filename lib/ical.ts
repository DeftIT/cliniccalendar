// eslint-disable-next-line @typescript-eslint/no-require-imports
const ICAL = require("ical.js");

export interface ParsedEvent {
  uid: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  allDay: boolean;
}

export async function fetchAndParseICal(url: string): Promise<ParsedEvent[]> {
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Failed to fetch iCal: ${res.status}`);
  const text = await res.text();
  return parseICal(text);
}

export function parseICal(text: string): ParsedEvent[] {
  const jcal = ICAL.parse(text);
  const comp = new ICAL.Component(jcal);
  const vevents = comp.getAllSubcomponents("vevent");
  const events: ParsedEvent[] = [];

  for (const vevent of vevents) {
    const ev = new ICAL.Event(vevent);
    const dtstart = ev.startDate;
    if (!dtstart) continue;

    const uid = ev.uid || "";
    const title = ev.summary || "(No title)";
    const isAllDay = dtstart.isDate;

    const date = `${dtstart.year}-${String(dtstart.month).padStart(2, "0")}-${String(dtstart.day).padStart(2, "0")}`;

    if (isAllDay) {
      events.push({ uid, title, date, allDay: true });
    } else {
      const dtend = ev.endDate;
      const startTime = `${String(dtstart.hour).padStart(2, "0")}:${String(dtstart.minute).padStart(2, "0")}`;
      const endTime = dtend
        ? `${String(dtend.hour).padStart(2, "0")}:${String(dtend.minute).padStart(2, "0")}`
        : undefined;
      events.push({ uid, title, date, startTime, endTime, allDay: false });
    }
  }

  return events;
}

export async function fetchAndParseRSS(url: string): Promise<ParsedEvent[]> {
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Failed to fetch RSS: ${res.status}`);
  const text = await res.text();

  // Basic RSS date-based event extraction
  const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  const events: ParsedEvent[] = [];

  for (const [, item] of items) {
    const titleMatch = item.match(/<title>(.*?)<\/title>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
    const guidMatch = item.match(/<guid[^>]*>(.*?)<\/guid>/);

    if (!titleMatch || !pubDateMatch) continue;

    const d = new Date(pubDateMatch[1]);
    if (isNaN(d.getTime())) continue;

    const date = d.toISOString().slice(0, 10);
    const uid = guidMatch?.[1] || `${date}-${titleMatch[1]}`;

    events.push({ uid, title: titleMatch[1], date, allDay: true });
  }

  return events;
}
