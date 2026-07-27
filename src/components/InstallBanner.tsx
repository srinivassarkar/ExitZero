"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface InstallBannerProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallBanner({ onInstall, onDismiss }: InstallBannerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger smooth slide-in animation
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] bg-[#1a2332] border-t border-[#2563eb] px-5 py-3 shadow-2xl flex items-center justify-between transition-transform duration-300 ease-out ${
        mounted ? "translate-y-0" : "translate-y-full"
      } motion-reduce:transition-none motion-reduce:transform-none`}
    >
      {/* Left side */}
      <div className="flex items-center space-x-3 min-w-0">
        <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden border border-slate-700">
          <Image
            src="./icon-192.png"
            alt="ExitZero logo"
            width={36}
            height={36}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="text-sm font-bold text-[#f1f5f9] truncate">
            ExitZero works better as an app
          </h4>
          <p className="text-xs text-[#94a3b8] truncate">
            Offline access, push notifications, no browser UI
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3 shrink-0 ml-4">
        <button
          onClick={onInstall}
          className="border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer"
        >
          Install
        </button>
        <button
          onClick={onDismiss}
          className="text-[#94a3b8] hover:text-white p-1 text-sm font-bold transition-colors"
          title="Dismiss install suggestion"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
