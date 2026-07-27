"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, Sun, Moon, Menu, Clock, Settings } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  onSearchOpen: () => void;
  activeTechName: string;
  activeCategoryName: string;
  streakCount: number;
  longestStreak: number;
  timerMode: boolean;
  onToggleTimerMode: () => void;
  timerDuration: number;
  onUpdateTimerDuration: (val: number) => void;
  timerAutoAdvance: boolean;
  onToggleTimerAutoAdvance: () => void;
}

export function Header({
  onMenuToggle,
  onSearchOpen,
  activeTechName,
  activeCategoryName,
  streakCount,
  longestStreak,
  timerMode,
  onToggleTimerMode,
  timerDuration,
  onUpdateTimerDuration,
  timerAutoAdvance,
  onToggleTimerAutoAdvance,
}: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage/system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("exitzero_theme");
    const initialTheme = savedTheme === "light" ? "light" : "dark"; // Default to dark for ExitZero feel
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle clicking outside the settings popover to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("exitzero_theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="h-14 border-b border-border bg-[#1a2332] flex items-center justify-between px-4 z-30 relative shrink-0">
      {/* Subject / Category Info */}
      <div className="flex items-center space-x-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-md text-[#94a3b8] hover:text-white hover:bg-slate-800 md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#22c55e] select-none">
            {activeTechName}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#f1f5f9] truncate select-none max-w-[100px] min-[400px]:max-w-[140px] min-[500px]:max-w-[200px] sm:max-w-xs md:max-w-md block">
            {activeCategoryName}
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
        {/* Streak Counter */}
        {streakCount > 0 && (
          <div
            className="flex items-center space-x-1 px-2 py-1 bg-slate-800/80 rounded-lg border border-border/40 select-none group relative"
            title={`Longest streak: ${longestStreak} days`}
          >
            <span className={`text-base ${streakCount >= 3 ? "animate-streak-pulse origin-bottom" : ""}`}>
              🔥
            </span>
            <span className="font-mono text-xs font-bold text-[#f1f5f9]">
              {streakCount}
              <span className="hidden sm:inline"> day streak</span>
            </span>
          </div>
        )}

        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="p-1.5 md:p-2 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-slate-800 flex items-center space-x-1.5 text-xs font-semibold border border-border/40 hover:border-border transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex px-1 bg-[#1a2332] border border-[#22c55e] text-[#22c55e] rounded text-[9px] font-mono select-none">
            /
          </kbd>
        </button>

        {/* Timer Mode Toggle & Settings */}
        <div className="relative flex items-center" ref={settingsRef}>
          <button
            onClick={onToggleTimerMode}
            className={`p-1.5 md:p-2 rounded-lg flex items-center space-x-1.5 text-xs font-bold transition-all border cursor-pointer ${
              timerMode
                ? "border-[#2563eb] text-[#2563eb] bg-transparent"
                : "border-transparent text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-slate-800"
            }`}
            title={timerMode ? "Deactivate Timer Mode" : "Activate Timer Mode"}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Timer</span>
          </button>

          {/* Timer Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-1.5 md:p-2 rounded-lg hover:text-[#f1f5f9] hover:bg-slate-800 transition-colors ml-0.5 cursor-pointer ${
              isSettingsOpen ? "text-[#f1f5f9]" : "text-[#94a3b8]"
            }`}
            title="Timer Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Settings Popover */}
          {isSettingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a2332] border border-border rounded-xl p-4 shadow-2xl space-y-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] block font-mono">
                  Duration
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[60, 90, 120, 180].map((sec) => (
                    <label
                      key={sec}
                      className={`flex items-center justify-center p-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all ${
                        timerDuration === sec
                          ? "border-[#2563eb] text-[#2563eb] bg-transparent"
                          : "border-slate-800 text-[#475569] hover:text-[#94a3b8]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="timer-duration"
                        value={sec}
                        checked={timerDuration === sec}
                        onChange={() => onUpdateTimerDuration(sec)}
                        className="sr-only"
                      />
                      <span>{sec}s</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-[#f1f5f9]">
                  Auto-advance
                </span>
                <button
                  onClick={onToggleTimerAutoAdvance}
                  className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer border ${
                    timerAutoAdvance ? "border-[#22c55e]" : "border-[#475569]"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full absolute top-0.75 left-0.75 transition-transform duration-200 ${
                      timerAutoAdvance ? "translate-x-4 bg-[#22c55e]" : "translate-x-0 bg-[#475569]"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 md:p-2 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-slate-800 transition-colors border border-border/40 cursor-pointer"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
