"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCalendar } from "@/lib/context";
import type { Room } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PRESET_COLORS = [
  "#4285F4", "#0F9D58", "#F4B400", "#DB4437",
  "#9C27B0", "#00BCD4", "#FF5722", "#607D8B",
  "#E91E63", "#3F51B5", "#009688", "#8BC34A",
];

export function RoomSettingsModal({ open, onClose }: Props) {
  const { rooms, refreshBookings } = useCalendar();
  const [edits, setEdits] = useState<Record<number, { name: string; color: string }>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      const initial: Record<number, { name: string; color: string }> = {};
      rooms.forEach((r) => { initial[r.id] = { name: r.name, color: r.color }; });
      setEdits(initial);
      setSaved(false);
    }
  }, [open, rooms]);

  const save = async () => {
    setSaving(true);
    await Promise.all(
      rooms.map((r) =>
        fetch(`/api/rooms/${r.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(edits[r.id]),
        })
      )
    );
    setSaving(false);
    setSaved(true);
    refreshBookings();
    // Reload to pick up new room names in context
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Room Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5 pt-1">
          {rooms.map((room) => (
            <div key={room.id} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: edits[room.id]?.color ?? room.color }}
                />
                <Label className="text-sm font-medium">Room {room.sortOrder}</Label>
              </div>
              <Input
                value={edits[room.id]?.name ?? room.name}
                onChange={(e) =>
                  setEdits((prev) => ({ ...prev, [room.id]: { ...prev[room.id], name: e.target.value } }))
                }
                placeholder="Room name"
              />
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setEdits((prev) => ({ ...prev, [room.id]: { ...prev[room.id], color: c } }))
                    }
                    className="w-5 h-5 rounded-sm border-2 transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: edits[room.id]?.color === c ? "#000" : "transparent",
                    }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          ))}

          {saved && <p className="text-sm text-green-600 dark:text-green-400 font-medium">Saved! Reloading…</p>}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
