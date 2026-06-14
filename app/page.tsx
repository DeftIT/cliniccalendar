"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { CalendarMain } from "@/components/calendar/CalendarMain";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { SidebarDrawer } from "@/components/layout/SidebarDrawer";
import { MobileDayView } from "@/components/calendar/MobileDayView";
import { MobileWeekView } from "@/components/calendar/MobileWeekView";
import { MonthView } from "@/components/calendar/MonthView";
import { BulkBookingModal } from "@/components/modals/BulkBookingModal";
import { useCalendar } from "@/lib/context";
import { useState } from "react";

function DesktopLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <CalendarMain />
      </div>
    </div>
  );
}

function MobileLayout() {
  const { view, isAdmin } = useCalendar();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <MobileHeader onMenuOpen={() => setDrawerOpen(true)} />
      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Admin bulk add toolbar */}
      {isAdmin && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900 flex-shrink-0">
          <span className="text-xs text-blue-700 dark:text-blue-300 font-medium flex-1">Admin mode active</span>
          <button
            onClick={() => setBulkOpen(true)}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full font-medium"
          >
            Bulk Add
          </button>
        </div>
      )}

      {/* Views */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {view === "day" && <MobileDayView />}
        {(view === "week" || view === "work_week") && <MobileWeekView />}
        {view === "month" && <MonthView />}
      </div>

      <MobileNav />

      {isAdmin && <BulkBookingModal open={bulkOpen} onClose={() => setBulkOpen(false)} />}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Desktop (md and above) */}
      <div className="hidden md:flex flex-col h-screen overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <CalendarMain />
        </div>
      </div>

      {/* Mobile / tablet (below md) */}
      <div className="flex md:hidden flex-col h-screen overflow-hidden">
        <MobileLayout />
      </div>
    </>
  );
}
