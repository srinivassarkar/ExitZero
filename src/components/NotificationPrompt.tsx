"use client";

import React, { useEffect, useState } from "react";

interface NotificationPromptProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function NotificationPrompt({ onAccept, onDecline }: NotificationPromptProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div
        className={`w-full max-w-sm bg-[#1a2332] border border-[#2563eb] rounded-xl p-5 shadow-2xl flex flex-col space-y-4 transition-transform duration-300 ease-out ${
          mounted ? "translate-y-0" : "translate-y-10 md:translate-y-0 md:scale-95"
        } motion-reduce:transition-none motion-reduce:transform-none`}
      >
        <div className="flex flex-col space-y-1">
          <h3 className="text-base font-bold text-[#f1f5f9] flex items-center space-x-1.5">
            <span>Stay on your streak</span>
            <span>🔥</span>
          </h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Get a reminder at 9pm if you haven&apos;t studied that day.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={onAccept}
            className="flex-1 py-2 bg-transparent border border-[#2563eb] hover:bg-[#2563eb]/10 text-[#2563eb] font-bold text-xs rounded-lg transition-all cursor-pointer"
          >
            Sure, remind me
          </button>
          <button
            onClick={onDecline}
            className="flex-1 py-2 bg-transparent hover:bg-slate-800 text-[#94a3b8] hover:text-white font-bold text-xs rounded-lg transition-all border border-slate-700"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
