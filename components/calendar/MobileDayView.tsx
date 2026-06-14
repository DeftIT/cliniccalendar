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
      <div className="flex-1 overflow-auto">
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
            return (
              <div
                key={room.id}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
              >
                {/* Room header bar */}
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ backgroundColor: room.color }}
                >
                  <span className="text-white font-semibold text-base">{room.name}</span>
                  {roomBookings.length === 0 && (
                    <span className="text-white/80 text-xs font-medium">Available</span>
                  )}
                </div>

                {/* Bookings */}
                <div className="bg-white dark:bg-gray-900 min-h-[60px]">
                  {roomBookings.length === 0 ? (
                    isAdmin ? (
                      <button
                        onClick={() => setNewSlot({ date: dateStr, roomId: room.id })}
                        className="w-full py-4 text-sm text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        + Tap to add booking
                      </button>
                    ) : (
                      <div className="py-4 px-4 text-sm text-gray-400 dark:text-gray-500">No bookings</div>
                    )
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {roomBookings.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => isAdmin && setSelected(b)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 dark:text-white text-base">{b.title}</span>
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: room.color + "22", color: room.color }}
                            >
                              {b.bookingType === "custom"
                                ? `${b.startTime?.slice(0, 5)} – ${b.endTime?.slice(0, 5)}`
                                : TYPE_LABEL[b.bookingType]}
                            </span>
                          </div>
                          {b.notes && <p className="text-xs text-gray-400 mt-0.5">{b.notes}</p>}
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
