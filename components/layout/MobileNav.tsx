"use client";

import { useCalendar } from "@/lib/context";
import { CalendarDays, CalendarRange, Grid3x3, LayoutDashboard, Plus } from "lucide-react";
import type { CalendarView } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";
import { BookingModal } from "@/components/modals/BookingModal";

const VIEWS: { label: string; value: CalendarView; icon: React.ReactNode }[] = [
  { label: "Day", value: "day", icon: <CalendarDays size={22} /> },
  { label: "Week", value: "week", icon: <CalendarRange size={22} /> },
  { label: "Month", value: "month", icon: <Grid3x3 size={22} /> },
];

export function MobileNav() {
  const { view, setView, isAdmin } = useCalendar();
  const [newOpen, setNewOpen] = useState(false);

  return (
    <>
      {/* Fix #5: pb-safe adds padding above iPhone home indicator */}
      <nav className="flex items-center border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0 pb-safe">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            onClick={() => setView(v.value)}
            className={[
              "flex-1 flex flex-col items-center gap-1 pt-2 pb-1 text-[11px] font-medium transition-colors",
              view === v.value
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500",
            ].join(" ")}
          >
            {v.icon}
            {v.label}
          </button>
        ))}

        <Link href="/dashboard" className="flex-1 flex flex-col items-center gap-1 pt-2 pb-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
          <LayoutDashboard size={22} />
          Board
        </Link>

        {isAdmin && (
          <button
            onClick={() => setNewOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 pt-2 pb-1 text-[11px] font-medium text-blue-600 dark:text-blue-400"
          >
            <Plus size={22} />
            Add
          </button>
        )}
      </nav>

      {isAdmin && <BookingModal open={newOpen} onClose={() => setNewOpen(false)} />}
    </>
  );
}
