"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, Sun, Moon, Menu, Clock, Settings, ChevronDown } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  onSearchOpen: () => void;
  onOpenChannelSelector?: () => void;
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
  soundHapticsEnabled: boolean;
  onToggleSoundHaptics: () => void;
  autoRevealEnabled: boolean;
  onToggleAutoReveal: () => void;
  notificationTime: string;
  onUpdateNotificationTime: (time: string) => void;
  difficultyExclusions: string[];
  onToggleDifficultyExclusion: (difficulty: string) => void;
}

export function Header({
  onMenuToggle,
  onSearchOpen,
  onOpenChannelSelector,
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
  soundHapticsEnabled,
  onToggleSoundHaptics,
  autoRevealEnabled,
  onToggleAutoReveal,
  notificationTime,
  onUpdateNotificationTime,
  difficultyExclusions,
  onToggleDifficultyExclusion,
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
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 z-30 relative shrink-0">
      {/* Subject / Category Info & Channel Selector */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={onOpenChannelSelector}
          className={`flex flex-col min-w-0 ${onOpenChannelSelector ? "cursor-pointer group" : ""}`}
          title={onOpenChannelSelector ? "Click to switch channel [$ target --profile]" : undefined}
        >
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-[#A3FF1A] select-none font-mono">
            {activeTechName}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-foreground truncate select-none max-w-[90px] min-[380px]:max-w-[120px] min-[500px]:max-w-[180px] sm:max-w-xs md:max-w-md block group-hover:text-[#00E676] transition-colors">
            {activeCategoryName}
          </span>
        </div>

        {/* Target Profile / Channel Selector Trigger */}
        {onOpenChannelSelector && (
          <button
            onClick={onOpenChannelSelector}
            className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-lg border border-[#26303C] bg-[#0B0F14]/70 hover:border-[#00E676]/40 hover:bg-[#151B23] active:scale-95 transition-all cursor-pointer group text-xs font-mono shrink-0"
            title="Select Study Feed Channel [$ target --profile] [t]"
          >
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse shrink-0" />
            <span className="text-muted-foreground hidden sm:inline">$ target</span>
            <span className="text-[#00E676] font-bold">--profile</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </button>
        )}
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
        {/* Streak Counter */}
        {streakCount > 0 && (
          <div
            className="flex items-center space-x-1 px-2 py-1 bg-muted rounded-lg border border-border select-none group relative"
            title={`Longest streak: ${longestStreak} days`}
          >
            <span className={`text-base ${streakCount >= 3 ? "animate-streak-pulse origin-bottom" : ""}`}>
              🔥
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {streakCount}
              <span className="hidden sm:inline"> day streak</span>
            </span>
          </div>
        )}

        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center space-x-1.5 text-xs font-semibold border border-border transition-all cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex px-1.5 py-0.2 bg-card border border-[#26303C] text-[#00E676] rounded text-[9px] font-mono select-none">
            /
          </kbd>
        </button>

        {/* Timer Mode Toggle & Settings */}
        <div className="relative flex items-center" ref={settingsRef}>
          <button
            onClick={onToggleTimerMode}
            className={`p-1.5 md:p-2 rounded-lg flex items-center space-x-1.5 text-xs font-bold font-mono transition-all border cursor-pointer ${
              timerMode
                ? "border-[#00C8FF] text-[#00C8FF] bg-transparent shadow-[0_0_8px_rgba(0,200,255,0.15)]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
            title={timerMode ? "Deactivate Timer Mode" : "Activate Timer Mode"}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Timer</span>
          </button>

          {/* Timer Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-1.5 md:p-2 rounded-lg hover:text-foreground hover:bg-muted transition-colors ml-0.5 cursor-pointer ${
              isSettingsOpen ? "text-foreground" : "text-muted-foreground"
            }`}
            title="Timer Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          {/* Settings Popover */}
          {isSettingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-xl p-4 shadow-2xl space-y-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Duration Slider */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-mono">
                  Timer Duration
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {[60, 90, 120, 180].map((sec) => (
                    <label
                      key={sec}
                      className={`flex items-center justify-center p-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer transition-all ${
                        timerDuration === sec
                          ? "border-[#00C8FF] text-[#00C8FF] bg-[#00C8FF]/5"
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/20"
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

              {/* Toggles Group */}
              <div className="space-y-2.5 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Auto-advance
                  </span>
                  <button
                    onClick={onToggleTimerAutoAdvance}
                    className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer border ${
                      timerAutoAdvance ? "border-[#00E676]" : "border-[#26303C]"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full absolute top-0.75 left-0.75 transition-transform duration-200 ${
                        timerAutoAdvance ? "translate-x-4 bg-gradient-to-r from-[#00E676] to-[#A3FF1A]" : "translate-x-0 bg-[#475569]"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Auto-reveal
                  </span>
                  <button
                    onClick={onToggleAutoReveal}
                    className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer border ${
                      autoRevealEnabled ? "border-[#00E676]" : "border-[#26303C]"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full absolute top-0.75 left-0.75 transition-transform duration-200 ${
                        autoRevealEnabled ? "translate-x-4 bg-gradient-to-r from-[#00E676] to-[#A3FF1A]" : "translate-x-0 bg-[#475569]"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Sound & Haptic
                  </span>
                  <button
                    onClick={onToggleSoundHaptics}
                    className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer border ${
                      soundHapticsEnabled ? "border-[#00E676]" : "border-[#26303C]"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full absolute top-0.75 left-0.75 transition-transform duration-200 ${
                        soundHapticsEnabled ? "translate-x-4 bg-gradient-to-r from-[#00E676] to-[#A3FF1A]" : "translate-x-0 bg-[#475569]"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Notification reminder time selector */}
              <div className="flex flex-col space-y-1.5 pt-2 border-t border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-mono">
                  Daily Reminder
                </span>
                <select
                  value={notificationTime}
                  onChange={(e) => onUpdateNotificationTime(e.target.value)}
                  className="w-full bg-card border border-border text-foreground rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-hidden cursor-pointer"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="19:00">07:00 PM</option>
                  <option value="20:00">08:00 PM</option>
                  <option value="21:00">09:00 PM</option>
                  <option value="22:00">10:00 PM</option>
                </select>
              </div>

              {/* Exclusions */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-mono">
                  Exclude Difficulty
                </span>
                <div className="flex gap-1">
                  {["Easy", "Medium", "Hard"].map((diff) => {
                    const isExcluded = difficultyExclusions.includes(diff);
                    return (
                      <button
                        key={diff}
                        onClick={() => onToggleDifficultyExclusion(diff)}
                        className={`flex-1 py-1 text-[9px] font-bold rounded-lg border transition-all cursor-pointer ${
                          isExcluded
                            ? "border-rose-500 text-rose-500 bg-rose-500/10"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border cursor-pointer"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
