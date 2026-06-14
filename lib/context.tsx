"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Room, Booking, CalendarView, CleanerSlot, SubscriptionEvent } from "./types";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns";

interface CalendarContextValue {
  rooms: Room[];
  bookings: Booking[];
  cleanerSlots: CleanerSlot[];
  subEvents: SubscriptionEvent[];
  view: CalendarView;
  currentDate: Date;
  isAdmin: boolean;
  setView: (v: CalendarView) => void;
  setCurrentDate: (d: Date) => void;
  setIsAdmin: (v: boolean) => void;
  refreshBookings: () => void;
  visibleRoomIds: Set<number>;
  toggleRoom: (id: number) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cleanerSlots, setCleanerSlots] = useState<CleanerSlot[]>([]);
  const [subEvents, setSubEvents] = useState<SubscriptionEvent[]>([]);
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAdmin, setIsAdminState] = useState(false);
  const [visibleRoomIds, setVisibleRoomIds] = useState<Set<number>>(new Set());
  const [darkMode, setDarkMode] = useState(false);

  // Restore admin state + dark mode from sessionStorage
  useEffect(() => {
    if (sessionStorage.getItem("clinic_admin") === "true") setIsAdminState(true);
    const savedDark = localStorage.getItem("clinic_dark");
    if (savedDark === "true") setDarkMode(true);
    else if (savedDark === null && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((d) => {
      localStorage.setItem("clinic_dark", String(!d));
      return !d;
    });
  };

  const setIsAdmin = (v: boolean) => {
    sessionStorage.setItem("clinic_admin", String(v));
    setIsAdminState(v);
  };

  // Load rooms once
  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data: Room[]) => {
        setRooms(data);
        setVisibleRoomIds(new Set(data.map((r) => r.id)));
      });
  }, []);

  // Date range for current view
  const getRange = useCallback(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
      return { from: format(start, "yyyy-MM-dd"), to: format(end, "yyyy-MM-dd") };
    }
    if (view === "day") {
      const d = format(currentDate, "yyyy-MM-dd");
      return { from: d, to: d };
    }
    // week / work_week
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = addDays(start, view === "work_week" ? 4 : 6);
    return { from: format(start, "yyyy-MM-dd"), to: format(end, "yyyy-MM-dd") };
  }, [view, currentDate]);

  const loadBookings = useCallback(() => {
    const { from, to } = getRange();
    Promise.all([
      fetch(`/api/bookings?from=${from}&to=${to}`).then((r) => r.json()),
      fetch(`/api/cleaner?from=${from}&to=${to}`).then((r) => r.json()),
    ]).then(([b, c]) => {
      setBookings(b);
      setCleanerSlots(c);
    });
  }, [getRange]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const toggleRoom = (id: number) => {
    setVisibleRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <CalendarContext.Provider
      value={{
        rooms,
        bookings,
        cleanerSlots,
        subEvents,
        view,
        currentDate,
        isAdmin,
        setView,
        setCurrentDate,
        setIsAdmin,
        refreshBookings: loadBookings,
        visibleRoomIds,
        toggleRoom,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}
