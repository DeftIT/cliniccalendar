"use client";

import { useCalendar } from "@/lib/context";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const { rooms, visibleRoomIds, toggleRoom, currentDate, setCurrentDate } = useCalendar();
  const [miniMonth, setMiniMonth] = useState(new Date());

  const monthStart = startOfMonth(miniMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(calStart, i));

  return (
    <aside className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col gap-4 py-4 px-3 overflow-y-auto">
      {/* Mini calendar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setMiniMonth(subMonths(miniMonth, 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            {format(miniMonth, "MMMM yyyy")}
          </span>
          <button onClick={() => setMiniMonth(addMonths(miniMonth, 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0 text-center">
          {["M","T","W","T","F","S","S"].map((d, i) => (
            <div key={i} className="text-[10px] font-medium text-gray-400 py-1">{d}</div>
          ))}
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => { setCurrentDate(day); setMiniMonth(day); }}
              className={[
                "text-[11px] h-6 w-6 mx-auto rounded-full flex items-center justify-center transition-colors",
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
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Rooms</p>
        <div className="flex flex-col gap-1">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => toggleRoom(room.id)}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-left w-full"
            >
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0 transition-opacity"
                style={{
                  backgroundColor: room.color,
                  opacity: visibleRoomIds.has(room.id) ? 1 : 0.25,
                }}
              />
              <span className={`text-sm ${visibleRoomIds.has(room.id) ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
                {room.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
