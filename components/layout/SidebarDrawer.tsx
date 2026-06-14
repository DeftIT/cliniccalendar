"use client";

import { useCalendar } from "@/lib/context";
import {
  format, addMonths, subMonths, startOfMonth, startOfWeek,
  addDays, isSameMonth, isSameDay, isToday,
} from "date-fns";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SidebarDrawer({ open, onClose }: Props) {
  const { rooms, visibleRoomIds, toggleRoom, currentDate, setCurrentDate } = useCalendar();
  const [miniMonth, setMiniMonth] = useState(new Date());

  const monthStart = startOfMonth(miniMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(calStart, i));

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-800 dark:text-white">Clinic Calendar</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {/* Mini calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMiniMonth(subMonths(miniMonth, 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">‹</button>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{format(miniMonth, "MMMM yyyy")}</span>
              <button onClick={() => setMiniMonth(addMonths(miniMonth, 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">›</button>
            </div>
            <div className="grid grid-cols-7 gap-0 text-center">
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i} className="text-[11px] font-medium text-gray-400 py-1">{d}</div>
              ))}
              {days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentDate(day); setMiniMonth(day); onClose(); }}
                  className={[
                    "text-[13px] h-8 w-8 mx-auto rounded-full flex items-center justify-center transition-colors",
                    !isSameMonth(day, miniMonth) ? "text-gray-300 dark:text-gray-600" : "text-gray-700 dark:text-gray-200",
                    isToday(day) ? "bg-blue-600 text-white font-bold" : "",
                    isSameDay(day, currentDate) && !isToday(day) ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200" : "",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                  ].join(" ")}
                >
                  {format(day, "d")}
                </button>
              ))}
            </div>
          </div>

          {/* Room filters */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Filter Rooms</p>
            <div className="flex flex-col gap-1">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => toggleRoom(room.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left w-full"
                >
                  <span
                    className="w-4 h-4 rounded flex-shrink-0 transition-opacity"
                    style={{
                      backgroundColor: room.color,
                      opacity: visibleRoomIds.has(room.id) ? 1 : 0.25,
                    }}
                  />
                  <span className={`text-base ${visibleRoomIds.has(room.id) ? "text-gray-800 dark:text-gray-100 font-medium" : "text-gray-400 dark:text-gray-500"}`}>
                    {room.name}
                  </span>
                  {visibleRoomIds.has(room.id) && (
                    <span className="ml-auto text-xs text-blue-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
