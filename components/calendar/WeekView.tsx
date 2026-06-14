"use client";

import { useCalendar } from "@/lib/context";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { BookingChip } from "./BookingChip";
import type { Booking } from "@/lib/types";
import { useState } from "react";
import { BookingModal } from "@/components/modals/BookingModal";

interface Props {
  workWeek?: boolean;
}

export function WeekView({ workWeek }: Props) {
  const { bookings, rooms, visibleRoomIds, currentDate, isAdmin, cleanerSlots } = useCalendar();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [newSlot, setNewSlot] = useState<{ date: string; roomId?: number } | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: workWeek ? 5 : 7 }, (_, i) => addDays(weekStart, i));

  const visibleRooms = rooms.filter((r) => visibleRoomIds.has(r.id));

  const bookingsForDay = (date: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.date + "T00:00:00"), date));

  const cleanerForDay = (date: Date) =>
    cleanerSlots.filter((c) => isSameDay(new Date(c.date + "T00:00:00"), date));

  return (
    <>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="w-20 py-2 px-2 text-left text-xs font-medium text-gray-400 dark:text-gray-500">Room</th>
              {days.map((day) => (
                <th key={day.toISOString()} className="py-2 px-1 text-center min-w-[100px]">
                  <div className={`flex flex-col items-center ${isToday(day) ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300"}`}>
                    <span className="text-xs font-medium">{format(day, "EEE")}</span>
                    <span className={`text-lg font-light ${isToday(day) ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium" : ""}`}>
                      {format(day, "d")}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Cleaner row */}
            <tr className="border-b border-dashed border-gray-100 dark:border-gray-800">
              <td className="py-1 px-2 text-[10px] font-medium text-gray-400 dark:text-gray-500">Cleaner</td>
              {days.map((day) => {
                const slots = cleanerForDay(day);
                return (
                  <td key={day.toISOString()} className="py-1 px-1 align-top">
                    {slots.map((slot) => (
                      <div key={slot.id} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded px-1 py-0.5 truncate">
                        🧹 {slot.startTime}–{slot.endTime}
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>

            {/* Room rows */}
            {visibleRooms.map((room) => (
              <tr key={room.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                <td className="py-2 px-2 align-top">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: room.color }} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{room.name}</span>
                  </div>
                </td>
                {days.map((day) => {
                  const dayBookings = bookingsForDay(day).filter((b) => b.roomId === room.id);
                  const dateStr = format(day, "yyyy-MM-dd");
                  return (
                    <td
                      key={day.toISOString()}
                      className="py-1 px-1 align-top"
                      onClick={() => isAdmin && !dayBookings.length && setNewSlot({ date: dateStr, roomId: room.id })}
                    >
                      <div className="flex flex-col gap-0.5 min-h-[36px]">
                        {dayBookings.map((b) => (
                          <BookingChip
                            key={b.id}
                            booking={b}
                            room={room}
                            onClick={() => isAdmin ? setSelected(b) : undefined}
                          />
                        ))}
                        {isAdmin && dayBookings.length === 0 && (
                          <div className="min-h-[36px] rounded border-2 border-dashed border-transparent hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer transition-colors" />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <>
          <BookingModal
            open={!!selected}
            booking={selected}
            onClose={() => setSelected(null)}
          />
          <BookingModal
            open={!!newSlot}
            defaultDate={newSlot?.date}
            defaultRoomId={newSlot?.roomId}
            onClose={() => setNewSlot(null)}
          />
        </>
      )}
    </>
  );
}
