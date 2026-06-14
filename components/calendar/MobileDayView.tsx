"use client";

import { useCalendar } from "@/lib/context";
import { format, isSameDay, isToday } from "date-fns";
import type { Booking } from "@/lib/types";
import { useState } from "react";
import { BookingModal } from "@/components/modals/BookingModal";

const TYPE_LABEL: Record<string, string> = {
  full_day: "Full Day",
  half_day_am: "Morning",
  half_day_pm: "Afternoon",
  custom: "",
};

export function MobileDayView() {
  const { bookings, rooms, visibleRoomIds, currentDate, isAdmin, cleanerSlots } = useCalendar();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newSlot, setNewSlot] = useState<{ date: string; roomId?: number } | null>(null);

  const dayBookings = bookings.filter((b) => isSameDay(new Date(b.date + "T00:00:00"), currentDate));
  const dayCleaner = cleanerSlots.filter((c) => isSameDay(new Date(c.date + "T00:00:00"), currentDate));
  const visibleRooms = rooms.filter((r) => visibleRoomIds.has(r.id));
  const dateStr = format(currentDate, "yyyy-MM-dd");

  return (
    <>
      {/* Fix #3: pb-2 instead of large empty gap; use flex-1 + overflow-auto on wrapper */}
      <div className="flex-1 overflow-auto pb-4">
        {/* Day header */}
        <div className={[
          "px-4 py-4 border-b border-gray-100 dark:border-gray-800",
          isToday(currentDate) ? "bg-blue-50 dark:bg-blue-950/30" : "",
        ].join(" ")}>
          <p className={`text-sm font-medium ${isToday(currentDate) ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
            {isToday(currentDate) ? "Today · " : ""}{format(currentDate, "EEEE")}
          </p>
          <p className={`text-3xl font-light ${isToday(currentDate) ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-white"}`}>
            {format(currentDate, "d MMMM yyyy")}
          </p>
          {/* Fix #7: subtle swipe hint */}
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">← swipe or use arrows to change day</p>
        </div>

        {/* Cleaner banner */}
        {dayCleaner.length > 0 && (
          <div className="mx-4 mt-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center gap-2">
            <span className="text-base">🧹</span>
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Cleaner</p>
              {dayCleaner.map((c) => (
                <p key={c.id} className="text-xs text-gray-500">{c.startTime} – {c.endTime}{c.notes ? ` · ${c.notes}` : ""}</p>
              ))}
            </div>
          </div>
        )}

        {/* Room cards */}
        <div className="p-4 flex flex-col gap-3">
          {visibleRooms.map((room) => {
            const roomBookings = dayBookings.filter((b) => b.roomId === room.id);
            const available = roomBookings.length === 0;
            return (
              <div
                key={room.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
              >
                {/* Room header — Fix #4: only show Available in header, remove body text */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: room.color }}
                >
                  <span className="text-white font-semibold text-base">{room.name}</span>
                  {available && (
                    <span className="text-white/90 text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                      Available
                    </span>
                  )}
                </div>

                {/* Bookings body */}
                <div className="bg-white dark:bg-gray-900">
                  {available ? (
                    isAdmin ? (
                      <button
                        onClick={() => setNewSlot({ date: dateStr, roomId: room.id })}
                        className="w-full py-4 text-sm text-gray-400 dark:text-gray-500 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                      >
                        + Tap to add booking
                      </button>
                    ) : null  /* Fix #4: no redundant "No bookings" text — header shows Available */
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {roomBookings.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => isAdmin && setSelected(b)}
                          className="w-full px-4 py-4 text-left active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-gray-800 dark:text-white text-lg leading-tight">{b.title}</span>
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                              style={{ backgroundColor: room.color + "22", color: room.color }}
                            >
                              {b.bookingType === "custom"
                                ? `${b.startTime?.slice(0, 5)} – ${b.endTime?.slice(0, 5)}`
                                : TYPE_LABEL[b.bookingType]}
                            </span>
                          </div>
                          {b.notes && <p className="text-xs text-gray-400 mt-1">{b.notes}</p>}
                          {isAdmin && <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">Tap to edit</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdmin && (
        <>
          <BookingModal open={!!selected} booking={selected} onClose={() => setSelected(null)} />
          <BookingModal open={!!newSlot} defaultDate={newSlot?.date} defaultRoomId={newSlot?.roomId} onClose={() => setNewSlot(null)} />
        </>
      )}
    </>
  );
}
