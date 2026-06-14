"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCalendar } from "@/lib/context";
import { format } from "date-fns";
import type { BookingType } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

const BOOKING_TYPES: { value: BookingType; label: string }[] = [
  { value: "full_day", label: "Full Day" },
  { value: "half_day_am", label: "Half Day (AM)" },
  { value: "half_day_pm", label: "Half Day (PM)" },
  { value: "custom", label: "Custom Hours" },
];

export function BulkBookingModal({ open, onClose }: Props) {
  const { rooms, refreshBookings } = useCalendar();
  const today = format(new Date(), "yyyy-MM-dd");

  const [title, setTitle] = useState("");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [selectedRooms, setSelectedRooms] = useState<Set<number>>(new Set());
  const [bookingType, setBookingType] = useState<BookingType>("full_day");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState("");

  const toggleRoom = (id: number) => {
    setSelectedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async () => {
    if (!title || !fromDate || !toDate || selectedRooms.size === 0) {
      setError("Please fill in all required fields and select at least one room.");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");

    const res = await fetch("/api/bookings/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        fromDate,
        toDate,
        roomIds: [...selectedRooms],
        bookingType,
        startTime: bookingType === "custom" ? startTime : null,
        endTime: bookingType === "custom" ? endTime : null,
        skipWeekends,
      }),
    });

    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setResult(`Created ${data.created} booking${data.created !== 1 ? "s" : ""}.`);
      refreshBookings();
    } else {
      setError("Failed to create bookings.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Add Bookings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <div>
            <Label>Name / Description</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Dr. Smith" className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>From Date</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>To Date</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Rooms</Label>
            <div className="flex flex-wrap gap-2">
              {rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => toggleRoom(r.id)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium transition-colors",
                    selectedRooms.has(r.id)
                      ? "text-white border-transparent"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300",
                  ].join(" ")}
                  style={selectedRooms.has(r.id) ? { backgroundColor: r.color, borderColor: r.color } : {}}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Booking Type</Label>
            <Select value={bookingType} onValueChange={(v) => setBookingType(v as BookingType)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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

          <div className="flex items-center gap-2">
            <Switch id="skip-weekends" checked={skipWeekends} onCheckedChange={setSkipWeekends} />
            <Label htmlFor="skip-weekends">Skip weekends</Label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {result && <p className="text-sm text-green-600 dark:text-green-400 font-medium">{result}</p>}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={submit} disabled={loading}>{loading ? "Creating…" : "Create Bookings"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
