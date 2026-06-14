"use client";

import { useCalendar } from "@/lib/context";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { MonthView } from "./MonthView";
import { BulkBookingModal } from "@/components/modals/BulkBookingModal";
import { BookingModal } from "@/components/modals/BookingModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, CalendarRange } from "lucide-react";

export function CalendarMain() {
  const { view, isAdmin } = useCalendar();
  const [bulkOpen, setBulkOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      {isAdmin && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button size="sm" onClick={() => setNewOpen(true)} className="gap-1">
            <Plus size={14} /> New Booking
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)} className="gap-1">
            <CalendarRange size={14} /> Bulk Add
          </Button>
        </div>
      )}

      {/* View */}
      {view === "day" && <DayView />}
      {view === "week" && <WeekView />}
      {view === "work_week" && <WeekView workWeek />}
      {view === "month" && <MonthView />}

      {isAdmin && (
        <>
          <BookingModal open={newOpen} onClose={() => setNewOpen(false)} />
          <BulkBookingModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
        </>
      )}
    </div>
  );
}
