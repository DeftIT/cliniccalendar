"use client";

import { useCalendar } from "@/lib/context";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import type { Booking } from "@/lib/types";
import { useState } from "react";
import { BookingModal } from "@/components/modals/BookingModal";

export function MobileWeekView() {
  const { bookings, rooms, visibleRoomIds, currentDate, setCurrentDate, setView, isAdmin, cleanerSlots } = useCalendar();
  const [selected, setSelected] = useState<Booking | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const visibleRooms = rooms.filter((r) => visibleRoomIds.has(r.id));

  const bookingsForDay = (date: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.date + "T00:00:00"), date));

  const cleanerForDay = (date: Date) =>
    cleanerSlots.some((c) => isSameDay(new Date(c.date + "T00:00:00"), date));

  return (
    <>
      <div className="flex-1 overflow-auto">
        {/* Day strip */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="grid grid-cols-7">
            {days.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => { setCurrentDate(day); setView("day"); }}
                className="flex flex-col items-center py-2 gap-0.5"
              >
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{format(day, "EEE")}</span>
                <span className={[
                  "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                  isToday(day) ? "bg-blue-600 text-white" : isSameDay(day, currentDate) ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200",
                ].join(" ")}>
                  {format(day, "d")}
                </span>
                {cleanerForDay(day) && <span className="text-[8px]">🧹</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Room rows */}
        <div className="flex flex-col">
          {visibleRooms.map((room) => (
            <div key={room.id} className="border-b border-gray-100 dark:border-gray-800">
              {/* Room label */}
              <div
                className="px-3 py-1.5 flex items-center gap-2"
                style={{ borderLeftWidth: 3, borderLeftColor: room.color }}
              >
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{room.name}</span>
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7 border-t border-gray-50 dark:border-gray-800">
                {days.map((day) => {
                  const dayBookings = bookingsForDay(day).filter((b) => b.roomId === room.id);
                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => { setCurrentDate(day); setView("day"); }}
                      className={[
                        "min-h-[52px] px-0.5 py-1 flex flex-col gap-0.5 cursor-pointer",
                        isToday(day) ? "bg-blue-50/50 dark:bg-blue-950/20" : "",
                      ].join(" ")}
                    >
                      {dayBookings.map((b) => (
                        <div
                          key={b.id}
                          className="rounded text-[9px] font-semibold px-1 py-0.5 truncate leading-tight"
                          style={{ backgroundColor: room.color + "25", color: room.color, borderLeft: `2px solid ${room.color}` }}
                          onClick={(e) => { e.stopPropagation(); if (isAdmin) setSelected(b); }}
                        >
                          {b.title}
                          {b.bookingType === "custom" && b.startTime && (
                            <span className="block opacity-70 font-normal">{b.startTime?.slice(0,5)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && <BookingModal open={!!selected} booking={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
