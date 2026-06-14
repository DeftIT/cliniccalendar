"use client";

import { useCalendar } from "@/lib/context";
import { CalendarDays, CalendarRange, Grid3x3, LayoutDashboard, Plus } from "lucide-react";
import type { CalendarView } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";
import { BookingModal } from "@/components/modals/BookingModal";

const VIEWS: { label: string; value: CalendarView; icon: React.ReactNode }[] = [
  { label: "Day", value: "day", icon: <CalendarDays size={20} /> },
  { label: "Week", value: "week", icon: <CalendarRange size={20} /> },
  { label: "Month", value: "month", icon: <Grid3x3 size={20} /> },
];

export function MobileNav() {
  const { view, setView, isAdmin } = useCalendar();
  const [newOpen, setNewOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0 safe-area-pb">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            onClick={() => setView(v.value)}
            className={[
              "flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              view === v.value
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400",
            ].join(" ")}
          >
            {v.icon}
            {v.label}
          </button>
        ))}

        {/* Dashboard */}
        <Link href="/dashboard" className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-gray-500 dark:text-gray-400">
          <LayoutDashboard size={20} />
          Board
        </Link>

        {/* Add booking (admin only) */}
        {isAdmin && (
          <button
            onClick={() => setNewOpen(true)}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-blue-600 dark:text-blue-400"
          >
            <Plus size={20} />
            Add
          </button>
        )}
      </nav>

      {isAdmin && <BookingModal open={newOpen} onClose={() => setNewOpen(false)} />}
    </>
  );
}
