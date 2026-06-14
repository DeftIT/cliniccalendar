"use client";

import { useCalendar } from "@/lib/context";
import { format, addWeeks, subWeeks, addDays, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Menu, Sun, Moon } from "lucide-react";
import { PinModal } from "@/components/modals/PinModal";
import { RoomSettingsModal } from "@/components/modals/RoomSettingsModal";
import { useState } from "react";

interface Props {
  onMenuOpen: () => void;
}

export function MobileHeader({ onMenuOpen }: Props) {
  const { view, currentDate, setCurrentDate, darkMode, toggleDarkMode, isAdmin, setIsAdmin } = useCalendar();
  const [pinOpen, setPinOpen] = useState(false);
  const [roomSettingsOpen, setRoomSettingsOpen] = useState(false);

  const navigate = (dir: 1 | -1) => {
    if (view === "month") setCurrentDate(dir === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    else if (view === "day") setCurrentDate(addDays(currentDate, dir));
    else setCurrentDate(dir === 1 ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const title = () => {
    if (view === "day") return format(currentDate, "EEE d MMM");
    return format(currentDate, "MMMM yyyy");
  };

  return (
    <>
      {/* Fix #8: tighter layout so Admin button doesn't clip */}
      <header className="flex items-center gap-1 px-2 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <button onClick={onMenuOpen} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
          <Menu size={20} />
        </button>

        {/* Nav group — takes remaining space, centered */}
        <div className="flex items-center flex-1 justify-center gap-0.5 min-w-0">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-sm font-medium text-gray-700 dark:text-gray-200 px-1 truncate max-w-[140px] text-center"
          >
            {title()}
          </button>
          <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right actions */}
        <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isAdmin ? (
          <button
            onClick={() => setRoomSettingsOpen(true)}
            className="text-[11px] bg-blue-600 text-white px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
          >
            ⚙ Admin
          </button>
        ) : (
          <button
            onClick={() => setPinOpen(true)}
            className="text-[11px] border border-gray-300 dark:border-gray-600 px-2.5 py-1 rounded-full text-gray-600 dark:text-gray-300 flex-shrink-0"
          >
            Admin
          </button>
        )}
      </header>

      <PinModal open={pinOpen} onClose={() => setPinOpen(false)} onSuccess={() => { setIsAdmin(true); setPinOpen(false); }} />
      <RoomSettingsModal open={roomSettingsOpen} onClose={() => setRoomSettingsOpen(false)} />
    </>
  );
}
