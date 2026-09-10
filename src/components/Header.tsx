"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Search, Sun, Moon, Menu, Clock, Settings, ChevronDown, Bell } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  onSearchOpen: () => void;
  onOpenChannelSelector?: () => void;
  activeTechName: string;
  activeCategoryName: string;
  streakCount: number;
  longestStreak: number;
  studyHistory?: Record<string, number>;
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
  notifPermission?: "granted" | "denied" | "pending";
  onSendTestNotification?: () => void;
  onRequestNotifPermission?: () => void;
}

export function Header({
  onMenuToggle,
  onSearchOpen,
  onOpenChannelSelector,
  activeTechName,
  activeCategoryName,
  streakCount,
  longestStreak,
  studyHistory,
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
  notifPermission = "pending",
  onSendTestNotification,
  onRequestNotifPermission,
}: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);

  // Compute 30-day activity heatmap data
  const last30Days = useMemo(() => {
    const days: { dateStr: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toLocaleDateString("en-CA");
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const count = (studyHistory && studyHistory[dateStr]) || 0;
      days.push({ dateStr, label, count });
    }
    return days;
  }, [studyHistory]);

  const totalReviewsMonth = useMemo(() => {
    return Object.values(studyHistory || {}).reduce((a, b) => a + b, 0);
  }, [studyHistory]);

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

  // Handle clicking outside popovers to close them
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (streakRef.current && !streakRef.current.contains(event.target as Node)) {
        setIsStreakOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
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
          title={onOpenChannelSelector ? "Switch Channel [Press T]" : undefined}
        >
          <div className="flex items-center space-x-1">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-[#A3FF1A] select-none font-mono">
              {activeTechName}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-[#00E676] transition-colors shrink-0" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-foreground truncate select-none max-w-[140px] min-[360px]:max-w-[180px] min-[480px]:max-w-[240px] sm:max-w-xs md:max-w-md block group-hover:text-[#00E676] transition-colors">
            {activeCategoryName}
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 shrink-0">
        {/* Streak Counter & 30-Day Activity Heatmap */}
        <div className="relative flex items-center shrink-0" ref={streakRef}>
          <button
            onClick={() => setIsStreakOpen(!isStreakOpen)}
            className="flex items-center space-x-1 px-1.5 sm:px-2 py-1 bg-muted hover:bg-muted/80 rounded-lg border border-border select-none cursor-pointer transition-all shrink-0"
            title="Click to view 30-Day Study Activity Heatmap"
          >
            <span className={`text-sm sm:text-base ${streakCount >= 3 ? "animate-streak-pulse origin-bottom" : ""}`}>
              🔥
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {streakCount}
              <span className="hidden sm:inline"> day streak</span>
            </span>
          </button>

          {/* Activity Heatmap Popover */}
          {isStreakOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl p-3.5 shadow-2xl space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm">🔥</span>
                  <span className="text-xs font-bold font-mono text-foreground">
                    Study Activity
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#00E676] font-bold">
                  {streakCount}d streak &bull; {longestStreak}d best
                </span>
              </div>

              {/* Heatmap Grid (30 days: 10 columns x 3 rows) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  <span>30-Day Window ({last30Days[0]?.label} &rarr; Today)</span>
                  <span className="text-[#00E676] font-bold">{totalReviewsMonth} reviews</span>
                </div>
                <div className="grid grid-cols-10 gap-1 p-2 bg-secondary/30 rounded-lg border border-border">
                  {last30Days.map((day) => {
                    const levelClass =
                      day.count === 0
                        ? "bg-muted/60 border-border/50"
                        : day.count <= 2
                        ? "bg-[#00E676]/30 border-[#00E676]/40"
                        : day.count <= 5
                        ? "bg-[#00E676]/70 border-[#00E676]/80"
                        : "bg-[#00E676] border-[#A3FF1A] shadow-[0_0_4px_rgba(0,230,118,0.4)]";

                    return (
                      <div
                        key={day.dateStr}
                        className={`w-full aspect-square rounded-xs border transition-all ${levelClass} hover:scale-125 cursor-default`}
                        title={`${day.label}: ${day.count} questions reviewed`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[8px] font-mono text-muted-foreground pt-0.5">
                  <span>30d ago ({last30Days[0]?.label})</span>
                  <div className="flex items-center space-x-1">
                    <span>Less</span>
                    <span className="w-2 h-2 rounded-xs bg-muted/60 border border-border/50" />
                    <span className="w-2 h-2 rounded-xs bg-[#00E676]/30 border border-[#00E676]/40" />
                    <span className="w-2 h-2 rounded-xs bg-[#00E676]/70 border border-[#00E676]/80" />
                    <span className="w-2 h-2 rounded-xs bg-[#00E676] border border-[#A3FF1A]" />
                    <span>More</span>
                  </div>
                  <span>Today</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center space-x-1.5 text-xs font-semibold border border-border transition-all cursor-pointer shrink-0"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex px-1.5 py-0.2 bg-card border border-[#26303C] text-[#00E676] rounded text-[9px] font-mono select-none">
            /
          </kbd>
        </button>

        {/* Timer Mode Toggle & Settings */}
        <div className="relative flex items-center shrink-0" ref={settingsRef}>
          <button
            onClick={onToggleTimerMode}
            className={`hidden md:flex p-1.5 md:p-2 rounded-lg items-center space-x-1.5 text-xs font-bold font-mono transition-all border cursor-pointer shrink-0 ${
              timerMode
                ? "border-[#00C8FF] text-[#00C8FF] bg-transparent shadow-[0_0_8px_rgba(0,200,255,0.15)]"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
            title={timerMode ? "Deactivate Timer Mode" : "Activate Timer Mode"}
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Timer</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-1.5 md:p-2 rounded-lg hover:text-foreground hover:bg-muted transition-colors ml-0.5 cursor-pointer shrink-0 border border-border ${
              isSettingsOpen ? "text-foreground bg-muted" : "text-muted-foreground"
            }`}
            title="Study Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Settings Popover */}
          {isSettingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl p-4 shadow-2xl space-y-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Mobile Timer Mode Toggle */}
              <div className="flex items-center justify-between pb-2 border-b border-border md:hidden">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00C8FF]" />
                  <span className="text-xs font-semibold text-foreground">
                    Timer Mode
                  </span>
                </div>
                <button
                  onClick={onToggleTimerMode}
                  className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer border ${
                    timerMode ? "border-[#00C8FF]" : "border-[#26303C]"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full absolute top-0.75 left-0.75 transition-transform duration-200 ${
                      timerMode ? "translate-x-4 bg-[#00C8FF]" : "translate-x-0 bg-[#475569]"
                    }`}
                  />
                </button>
              </div>

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

              {/* Notification reminder section */}
              <div className="flex flex-col space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Bell className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-mono">
                      Daily Reminder
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      notifPermission === "granted"
                        ? "border-[#00E676]/40 text-[#00E676] bg-[#00E676]/10"
                        : notifPermission === "denied"
                        ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                        : "border-amber-500/40 text-amber-400 bg-amber-500/10"
                    }`}
                  >
                    {notifPermission === "granted" ? "● Active" : notifPermission === "denied" ? "✕ Blocked" : "○ Not Enabled"}
                  </span>
                </div>

                <select
                  value={notificationTime}
                  onChange={(e) => onUpdateNotificationTime(e.target.value)}
                  className="w-full bg-secondary/30 border border-border text-foreground rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-hidden cursor-pointer"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="19:00">07:00 PM</option>
                  <option value="20:00">08:00 PM</option>
                  <option value="21:00">09:00 PM (Default)</option>
                  <option value="22:00">10:00 PM</option>
                </select>

                <div className="flex items-center gap-1.5">
                  {notifPermission !== "granted" && onRequestNotifPermission && (
                    <button
                      onClick={onRequestNotifPermission}
                      className="flex-1 py-1 px-2 rounded-lg bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/30 text-[#00E676] text-[10px] font-mono font-semibold transition-colors cursor-pointer text-center"
                    >
                      Enable Reminder
                    </button>
                  )}
                  {onSendTestNotification && (
                    <button
                      onClick={onSendTestNotification}
                      className="flex-1 py-1 px-2 rounded-lg bg-secondary/40 hover:bg-secondary/70 border border-border text-foreground text-[10px] font-mono font-semibold transition-colors cursor-pointer text-center"
                      title="Send instant notification to test reminder system"
                    >
                      🔔 Test Alert
                    </button>
                  )}
                </div>
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

              {/* Mobile Theme Switcher Row */}
              <div className="flex items-center justify-between pt-2 border-t border-border sm:hidden">
                <span className="text-xs font-semibold text-foreground">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Desktop / Tablet) */}
        <button
          onClick={toggleTheme}
          className="hidden sm:flex p-1.5 md:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border cursor-pointer shrink-0"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>
      </div>
    </header>
  );
}
