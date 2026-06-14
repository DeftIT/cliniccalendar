"use client";

import type { Booking, Room } from "@/lib/types";
import { useCalendar } from "@/lib/context";

interface Props {
  booking: Booking;
  room: Room;
  onClick: () => void;
  compact?: boolean;
}

const BOOKING_LABELS: Record<string, string> = {
  full_day: "Full Day",
  half_day_am: "AM",
  half_day_pm: "PM",
  custom: "",
};

export function BookingChip({ booking, room, onClick, compact }: Props) {
  const label = BOOKING_LABELS[booking.bookingType] ?? "";

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded px-1.5 py-0.5 text-xs font-medium truncate border-l-2 transition-opacity hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-blue-400"
      style={{
        borderLeftColor: room.color,
        backgroundColor: room.color + "22",
        color: room.color,
      }}
      title={`${booking.title}${label ? ` — ${label}` : ""}${booking.bookingType === "custom" ? ` ${booking.startTime}–${booking.endTime}` : ""}`}
    >
      {compact ? (
        <span style={{ color: room.color }}>{booking.title}</span>
      ) : (
        <>
          <span className="font-semibold">{booking.title}</span>
          {label && <span className="ml-1 opacity-70 text-[10px]">{label}</span>}
          {booking.bookingType === "custom" && booking.startTime && (
            <span className="ml-1 opacity-70 text-[10px]">{booking.startTime}–{booking.endTime}</span>
          )}
        </>
      )}
    </button>
  );
}
