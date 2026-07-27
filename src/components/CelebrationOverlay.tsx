"use client";

import React, { useEffect } from "react";

interface CelebrationOverlayProps {
  subjectName: string;
  onDismiss: () => void;
}

export function CelebrationOverlay({ subjectName, onDismiss }: CelebrationOverlayProps) {
  // Handle escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#1a2332] border border-[#22c55e] rounded-xl p-8 md:p-10 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
        {/* exit 0 logo */}
        <div className="font-mono text-3xl md:text-4xl font-bold text-[#22c55e] tracking-tight">
          $ exit 0
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
            {subjectName} &mdash; Interview Ready
          </h2>
          <p className="text-sm text-[#94a3b8]">
            You&apos;ve mastered 80% of {subjectName} questions.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 bg-transparent border border-[#22c55e] hover:bg-[#22c55e] hover:text-[#111827] text-[#22c55e] font-bold text-sm tracking-widest rounded-lg transition-all"
        >
          Keep going &rarr;
        </button>
      </div>
    </div>
  );
}
