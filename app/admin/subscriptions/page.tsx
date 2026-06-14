"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { useCalendar } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Subscription } from "@/lib/types";
import { ArrowLeft, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function SubscriptionsPage() {
  const { isAdmin, rooms } = useCalendar();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"ical" | "rss">("ical");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/subscriptions").then((r) => r.json()).then(setSubs);

  useEffect(() => { load(); }, []);

  if (!isAdmin) return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Admin access required.</p>
      </div>
    </div>
  );

  const add = async () => {
    if (!name || !url || !roomId) { setError("All fields required."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, type, roomId: Number(roomId) }),
    });
    setLoading(false);
    if (res.ok) {
      setName(""); setUrl("");
      load();
    } else {
      setError("Failed to add subscription.");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this subscription and all its imported events?")) return;
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    load();
  };

  const sync = async (id: number) => {
    setSyncing(id);
    await fetch("/api/subscriptions/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSyncing(null);
    load();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
            </Link>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Calendar Subscriptions</h1>
          </div>

          {/* Add form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">Add New Subscription</h2>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Google Calendar" className="mt-1" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as "ical" | "rss")}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ical">iCal (Google Calendar)</SelectItem>
                      <SelectItem value="rss">RSS Feed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>URL</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="mt-1" />
              </div>
              <div>
                <Label>Attach to Room</Label>
                <Select value={roomId} onValueChange={(v) => v && setRoomId(v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select room" /></SelectTrigger>
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
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button onClick={add} disabled={loading}>{loading ? "Adding…" : "Add Subscription"}</Button>
            </div>
          </div>

          {/* Existing subscriptions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">Active Subscriptions</h2>
            {subs.length === 0 ? (
              <p className="text-sm text-gray-400">No subscriptions yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {subs.map((sub) => {
                  const room = rooms.find((r) => r.id === sub.roomId);
                  return (
                    <div key={sub.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{sub.name}</p>
                        <p className="text-xs text-gray-400 truncate">{sub.url}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded uppercase">{sub.type}</span>
                          {room && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: room.color }} />
                              {room.name}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {sub.lastSynced ? `Synced ${formatDistanceToNow(new Date(sub.lastSynced), { addSuffix: true })}` : "Never synced"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => sync(sub.id)}
                          disabled={syncing === sub.id}
                          title="Sync now"
                        >
                          <RefreshCw size={14} className={syncing === sub.id ? "animate-spin" : ""} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => remove(sub.id)}
                          title="Remove subscription"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
