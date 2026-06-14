"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { useCalendar } from "@/lib/context";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Booking, Room, CleanerSlot, Subscription } from "@/lib/types";

interface DashboardData {
  today: string;
  todayBookings: { booking: Booking; room: Room }[];
  recentChanges: Booking[];
  todayCleaner: CleanerSlot[];
  rooms: Room[];
  subscriptions: Subscription[];
}

export default function DashboardPage() {
  const { isAdmin } = useCalendar();
  const [data, setData] = useState<DashboardData | null>(null);
  const [syncing, setSyncing] = useState(false);

  const load = () =>
    fetch("/api/dashboard").then((r) => r.json()).then(setData);

  useEffect(() => { load(); }, []);

  const syncNow = async () => {
    setSyncing(true);
    await fetch("/api/subscriptions/sync", { method: "POST", body: "{}" });
    setSyncing(false);
    load();
  };

  if (!data) return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center text-gray-400">Loading…</div>
    </div>
  );

  const { todayBookings, recentChanges, todayCleaner, rooms, subscriptions } = data;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          {/* Title row */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
            </div>
          </div>

          {/* Today's rooms */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Today's Occupancy</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {rooms.map((room) => {
                const roomBookings = todayBookings.filter((tb) => tb.room.id === room.id);
                return (
                  <div key={room.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="px-4 py-2 text-white text-sm font-semibold" style={{ backgroundColor: room.color }}>
                      {room.name}
                    </div>
                    <div className="p-3 min-h-[80px]">
                      {roomBookings.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500">Available</p>
                      ) : (
                        roomBookings.map(({ booking }) => (
                          <div key={booking.id} className="mb-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">{booking.title}</p>
                            <p className="text-xs text-gray-500">
                              {booking.bookingType === "full_day" && "Full Day"}
                              {booking.bookingType === "half_day_am" && "Morning"}
                              {booking.bookingType === "half_day_pm" && "Afternoon"}
                              {booking.bookingType === "custom" && `${booking.startTime} – ${booking.endTime}`}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cleaner today */}
          {todayCleaner.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">🧹 Cleaner Today</h2>
              {todayCleaner.map((c) => (
                <p key={c.id} className="text-sm text-gray-700 dark:text-gray-200">
                  {c.startTime} – {c.endTime}{c.notes ? ` · ${c.notes}` : ""}
                </p>
              ))}
            </div>
          )}

          {/* Recent changes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Recent Changes (48h)</h2>
            {recentChanges.length === 0 ? (
              <p className="text-sm text-gray-400">No changes in the last 48 hours.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentChanges.map((b) => {
                  const room = rooms.find((r) => r.id === b.roomId);
                  return (
                    <div key={b.id} className="flex items-center gap-3 text-sm">
                      {room && <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: room.color }} />}
                      <span className="font-medium text-gray-800 dark:text-white">{b.title}</span>
                      <span className="text-gray-500">{room?.name}</span>
                      <span className="text-gray-400">{b.date}</span>
                      <span className="text-gray-400 ml-auto flex items-center gap-1">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(b.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subscriptions */}
          {isAdmin && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Calendar Subscriptions</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={syncNow} disabled={syncing} className="gap-1 text-xs">
                    <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                    Sync Now
                  </Button>
                  <Link href="/admin/subscriptions">
                    <Button size="sm" variant="outline" className="text-xs">Manage</Button>
                  </Link>
                </div>
              </div>
              {subscriptions.length === 0 ? (
                <p className="text-sm text-gray-400">No subscriptions yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {subscriptions.map((sub) => {
                    const room = rooms.find((r) => r.id === sub.roomId);
                    return (
                      <div key={sub.id} className="flex items-center gap-3 text-sm">
                        <span className="font-medium text-gray-800 dark:text-white">{sub.name}</span>
                        <span className="text-gray-400 text-xs uppercase">{sub.type}</span>
                        {room && <span className="text-gray-500">{room.name}</span>}
                        <span className="text-gray-400 ml-auto text-xs">
                          {sub.lastSynced ? `Synced ${formatDistanceToNow(new Date(sub.lastSynced), { addSuffix: true })}` : "Never synced"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
