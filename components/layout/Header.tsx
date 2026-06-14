"use client";

import { useCalendar } from "@/lib/context";
import { format, addWeeks, subWeeks, addDays, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Sun, Moon, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalendarView } from "@/lib/types";
import { PinModal } from "@/components/modals/PinModal";
import { RoomSettingsModal } from "@/components/modals/RoomSettingsModal";
import { useState } from "react";
import Link from "next/link";

const VIEWS: { label: string; value: CalendarView }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Work week", value: "work_week" },
  { label: "Month", value: "month" },
];

export function Header() {
  const { view, setView, currentDate, setCurrentDate, darkMode, toggleDarkMode, isAdmin, setIsAdmin } = useCalendar();
  const [pinOpen, setPinOpen] = useState(false);
  const [roomSettingsOpen, setRoomSettingsOpen] = useState(false);

  const navigate = (dir: 1 | -1) => {
    if (view === "month") setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, dir));
    else setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const title = () => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "day") return format(currentDate, "d MMMM yyyy");
    return format(currentDate, "MMMM yyyy");
  };

  return (
    <>
      <header className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold text-gray-800 dark:text-white mr-2 whitespace-nowrap">
          Clinic Calendar
        </Link>

        {/* Today button */}
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs">
          Today
        </Button>

        {/* Prev / Next */}
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => navigate(1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRight size={18} />
          </button>
        </div>

        <h2 className="text-base font-medium text-gray-700 dark:text-gray-200 min-w-0">{title()}</h2>

        <div className="flex-1" />

        {/* View switcher */}
        <div className="flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              onClick={() => setView(v.value)}
              className={[
                "px-3 py-1 text-xs font-medium transition-colors",
                view === v.value
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
              ].join(" ")}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" title="Dashboard">
            <LayoutDashboard size={16} />
          </Button>
        </Link>

        {/* Dark mode */}
        <Button variant="ghost" size="sm" onClick={toggleDarkMode} title="Toggle dark mode">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button>

        {/* Admin */}
        {isAdmin ? (
          <div className="flex items-center gap-1">
            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-0.5 rounded-full font-medium">Admin</span>
            <Button variant="ghost" size="sm" onClick={() => setRoomSettingsOpen(true)} title="Room settings">
              <Settings size={16} />
            </Button>
            <Link href="/admin/subscriptions">
              <Button variant="ghost" size="sm" title="Subscriptions" className="text-xs">Subs</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setIsAdmin(false)} className="text-xs text-gray-500">
              Lock
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setPinOpen(true)} className="text-xs">
            Admin
          </Button>
        )}
      </header>

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} onSuccess={() => { setIsAdmin(true); setPinOpen(false); }} />
      <RoomSettingsModal open={roomSettingsOpen} onClose={() => setRoomSettingsOpen(false)} />
    </>
  );
}
