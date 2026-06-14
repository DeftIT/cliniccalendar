import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CalendarProvider } from "@/lib/context";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Clinic Calendar",
  description: "Room booking calendar for the clinic",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable}>
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 h-full">
        <TooltipProvider>
          <CalendarProvider>
            {children}
          </CalendarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
