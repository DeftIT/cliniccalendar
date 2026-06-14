export type BookingType = "full_day" | "half_day_am" | "half_day_pm" | "custom";

export interface Room {
  id: number;
  name: string;
  color: string;
  sortOrder: number;
}

export interface Booking {
  id: number;
  roomId: number;
  title: string;
  date: string;
  bookingType: BookingType;
  startTime: string | null;
  endTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  roomId: number;
  name: string;
  type: "ical" | "rss";
  url: string;
  color: string | null;
  lastSynced: string | null;
  createdAt: string;
}

export interface SubscriptionEvent {
  id: number;
  subscriptionId: number;
  roomId: number;
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  uid: string | null;
}

export interface CleanerSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  recurringRule: string | null;
}

export type CalendarView = "month" | "week" | "work_week" | "day";
