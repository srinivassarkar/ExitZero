"use client";

import React, { useEffect, useState } from "react";
import { Search, Sun, Moon, Menu, Download } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
  onSearchOpen: () => void;
  activeTechName: string;
  activeCategoryName: string;
  totalProgress: { total: number; mastered: number };
}

export function Header({
  onMenuToggle,
  onSearchOpen,
  activeTechName,
  activeCategoryName,
  totalProgress,
}: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Initialize theme from localStorage/system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme === "light" ? "light" : "dark"; // Default to dark for premium feel
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Handle PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default browser install banner
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const percent = totalProgress.total > 0
    ? Math.round((totalProgress.mastered / totalProgress.total) * 100)
    : 0;

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 z-30 relative shrink-0">
      {/* Subject Title */}
      <div className="flex items-center space-x-3 truncate">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col truncate">
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
            {activeTechName}
          </span>
          <span className="text-sm font-semibold text-foreground truncate">
            {activeCategoryName}
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
        {/* Progress Bar (Desktop only) */}
        <div className="hidden lg:flex items-center space-x-2 mr-2">
          <span className="text-xs text-muted-foreground">Total Mastery:</span>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-foreground">{percent}%</span>
        </div>

        {/* Search */}
        <button
          onClick={onSearchOpen}
          className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center space-x-1.5 text-xs font-medium border border-border/60 hover:border-border transition-all"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline-flex px-1 bg-muted border border-border/80 rounded text-[9px] font-mono">
            /
          </kbd>
        </button>

        {/* Install App */}
        {isInstallable && (
          <button
            onClick={handleInstallClick}
            className="p-1.5 md:p-2 rounded-lg text-primary hover:text-primary-foreground bg-primary/10 hover:bg-primary flex items-center space-x-1.5 text-xs font-semibold transition-all border border-primary/20"
            title="Download App for Offline Study"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 md:p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/60"
          title="Toggle Light/Dark Mode"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
