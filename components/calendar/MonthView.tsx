"use client";

import { useCalendar } from "@/lib/context";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  eachDayOfInterval,
} from "date-fns";
import { BookingChip } from "./BookingChip";
import type { Booking } from "@/lib/types";
import { useState } from "react";
import { BookingModal } from "@/components/modals/BookingModal";

export function MonthView() {
  const { bookings, rooms, visibleRoomIds, currentDate, isAdmin, cleanerSlots, setCurrentDate, setView } = useCalendar();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newSlot, setNewSlot] = useState<{ date: string } | null>(null);

  const monthStart = startOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const visibleRooms = rooms.filter((r) => visibleRoomIds.has(r.id));

  const bookingsForDay = (date: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.date + "T00:00:00"), date));

  const cleanerForDay = (date: Date) =>
    cleanerSlots.filter((c) => isSameDay(new Date(c.date + "T00:00:00"), date));

  return (
    <>
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {days.map((day) => {
            const dayBookings = bookingsForDay(day);
            const hasCleaner = cleanerForDay(day).length > 0;
            const isCurrentMonth = isSameMonth(day, currentDate);
            const dateStr = format(day, "yyyy-MM-dd");
            const MAX_VISIBLE = 3;

            return (
              <div
                key={day.toISOString()}
                className={[
                  "min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700 p-1",
                  !isCurrentMonth ? "bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-900",
                ].join(" ")}
                onClick={() => isAdmin && dayBookings.length === 0 && setNewSlot({ date: dateStr })}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <button
                    className={[
                      "text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center",
                      isToday(day) ? "bg-blue-600 text-white" : isCurrentMonth ? "text-gray-700 dark:text-gray-200" : "text-gray-300 dark:text-gray-600",
                    ].join(" ")}
                    onClick={(e) => { e.stopPropagation(); setCurrentDate(day); setView("day"); }}
                  >
                    {format(day, "d")}
                  </button>
                  {hasCleaner && <span title="Cleaner scheduled" className="text-[10px]">🧹</span>}
                </div>

                {/* Room colour dots summary */}
                <div className="flex gap-0.5 mb-1 flex-wrap">
                  {visibleRooms.map((room) => {
                    const hasBooking = dayBookings.some((b) => b.roomId === room.id);
                    return hasBooking ? (
                      <span key={room.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: room.color }} />
                    ) : null;
                  })}
                </div>

                {/* Booking chips (max 3 then overflow) */}
                <div className="flex flex-col gap-0.5">
                  {dayBookings.slice(0, MAX_VISIBLE).map((b) => {
                    const room = visibleRooms.find((r) => r.id === b.roomId);
                    if (!room) return null;
                    return (
                      <BookingChip
                        key={b.id}
                        booking={b}
                        room={room}
                        compact
                        onClick={() => { if (isAdmin) setSelected(b); }}
                      />
                    );
                  })}
                  {dayBookings.length > MAX_VISIBLE && (
                    <button
                      className="text-[10px] text-blue-500 hover:underline text-left"
                      onClick={(e) => { e.stopPropagation(); setCurrentDate(day); setView("day"); }}
                    >
                      +{dayBookings.length - MAX_VISIBLE} more
                    </button>
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
          <BookingModal open={!!newSlot} defaultDate={newSlot?.date} onClose={() => setNewSlot(null)} />
        </>
      )}
    </>
  );
}
