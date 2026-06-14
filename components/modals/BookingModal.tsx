"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCalendar } from "@/lib/context";
import type { Booking, BookingType } from "@/lib/types";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onClose: () => void;
  booking?: Booking | null;
  defaultDate?: string;
  defaultRoomId?: number;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

const BOOKING_TYPES: { value: BookingType; label: string }[] = [
  { value: "full_day", label: "Full Day" },
  { value: "half_day_am", label: "Half Day (AM)" },
  { value: "half_day_pm", label: "Half Day (PM)" },
  { value: "custom", label: "Custom Hours" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return `${h}:00`;
});

export function BookingModal({ open, onClose, booking, defaultDate, defaultRoomId, defaultStartTime, defaultEndTime }: Props) {
  const { rooms, refreshBookings } = useCalendar();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate ?? format(new Date(), "yyyy-MM-dd"));
  const [roomId, setRoomId] = useState<string>(defaultRoomId?.toString() ?? "");
  const [bookingType, setBookingType] = useState<BookingType>("full_day");
  const [startTime, setStartTime] = useState(defaultStartTime ?? "09:00");
  const [endTime, setEndTime] = useState(defaultEndTime ?? "17:00");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (booking) {
      setTitle(booking.title);
      setDate(booking.date);
      setRoomId(booking.roomId.toString());
      setBookingType(booking.bookingType);
      setStartTime(booking.startTime ?? "09:00");
      setEndTime(booking.endTime ?? "17:00");
      setNotes(booking.notes ?? "");
    } else {
      setTitle("");
      setDate(defaultDate ?? format(new Date(), "yyyy-MM-dd"));
      setRoomId(defaultRoomId?.toString() ?? (rooms[0]?.id.toString() ?? ""));
      setBookingType("full_day");
      setStartTime(defaultStartTime ?? "09:00");
      setEndTime(defaultEndTime ?? "17:00");
      setNotes("");
    }
    setError("");
  }, [open, booking, defaultDate, defaultRoomId, defaultStartTime, defaultEndTime, rooms]);

  const save = async () => {
    if (!title || !date || !roomId) { setError("Name and date are required."); return; }
    setLoading(true);
    setError("");

    const body = {
      title,
      date,
      roomId: Number(roomId),
      bookingType,
      startTime: bookingType === "custom" ? startTime : null,
      endTime: bookingType === "custom" ? endTime : null,
      notes: notes || null,
    };

    const res = booking
      ? await fetch(`/api/bookings/${booking.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    setLoading(false);
    if (res.ok) {
      refreshBookings();
      onClose();
    } else {
      setError("Failed to save. Please try again.");
    }
  };

  const del = async () => {
    if (!booking) return;
    if (!confirm("Delete this booking?")) return;
    await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" });
    refreshBookings();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{booking ? "Edit Booking" : "New Booking"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-1">
          <div>
            <Label>Name / Description</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dr. Smith" className="mt-1" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Room</Label>
              <Select value={roomId} onValueChange={(v) => v && setRoomId(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: r.color }} />
                        {r.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Booking Type</Label>
            <Select value={bookingType} onValueChange={(v) => setBookingType(v as BookingType)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_TYPES.map((bt) => (
                  <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {bookingType === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Select value={startTime} onValueChange={(v) => v && setStartTime(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>End Time</Label>
                <Select value={endTime} onValueChange={(v) => v && setEndTime(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 resize-none" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 justify-between">
            {booking && (
              <Button variant="destructive" onClick={del}>Delete</Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={save} disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
