"use client";

import { useCalendar } from "@/lib/context";
import { format, isSameDay, isToday } from "date-fns";
import { BookingChip } from "./BookingChip";
import type { Booking } from "@/lib/types";
import { useState } from "react";
import { BookingModal } from "@/components/modals/BookingModal";

export function DayView() {
  const { bookings, rooms, visibleRoomIds, currentDate, isAdmin, cleanerSlots } = useCalendar();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newSlot, setNewSlot] = useState<{ date: string; roomId?: number } | null>(null);

  const dayBookings = bookings.filter((b) => isSameDay(new Date(b.date + "T00:00:00"), currentDate));
  const dayCleaner = cleanerSlots.filter((c) => isSameDay(new Date(c.date + "T00:00:00"), currentDate));
  const visibleRooms = rooms.filter((r) => visibleRoomIds.has(r.id));
  const dateStr = format(currentDate, "yyyy-MM-dd");

  return (
    <>
      <div className="flex-1 overflow-auto p-4">
        <div className={`text-center mb-6 ${isToday(currentDate) ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-200"}`}>
          <p className="text-sm font-medium">{format(currentDate, "EEEE")}</p>
          <p className="text-4xl font-light">{format(currentDate, "d")}</p>
          <p className="text-sm text-gray-500">{format(currentDate, "MMMM yyyy")}</p>
        </div>

        {/* Cleaner */}
        {dayCleaner.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">🧹 Cleaner</p>
            {dayCleaner.map((c) => (
              <p key={c.id} className="text-sm text-gray-600 dark:text-gray-300">{c.startTime} – {c.endTime}{c.notes ? ` · ${c.notes}` : ""}</p>
            ))}
          </div>
        )}

        {/* Rooms as columns */}
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${visibleRooms.length}, 1fr)` }}>
          {visibleRooms.map((room) => {
            const roomBookings = dayBookings.filter((b) => b.roomId === room.id);
            return (
              <div key={room.id} className="flex flex-col">
                <div
                  className="rounded-t-lg px-3 py-2 text-white text-sm font-semibold text-center"
                  style={{ backgroundColor: room.color }}
                >
                  {room.name}
                </div>
                <div
                  className="flex-1 border border-t-0 rounded-b-lg p-2 min-h-[200px] flex flex-col gap-1 border-gray-200 dark:border-gray-700"
                  onClick={() => isAdmin && !roomBookings.length && setNewSlot({ date: dateStr, roomId: room.id })}
                >
                  {roomBookings.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                      {isAdmin ? "Click to add" : "Available"}
                    </p>
                  )}
                  {roomBookings.map((b) => (
                    <BookingChip key={b.id} booking={b} room={room} onClick={() => isAdmin ? setSelected(b) : undefined} />
                  ))}
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
