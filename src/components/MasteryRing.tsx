"use client";

import React, { useEffect, useRef, useState } from "react";

interface MasteryRingProps {
  total: number;
  mastered: number;
  size: number;
}

export function MasteryRing({ total, mastered, size }: MasteryRingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Determine stroke color based on progress percentage
  let strokeColor = "#ef4444";
  if (pct >= 80) {
    strokeColor = "#22c55e";
  } else if (pct >= 60) {
    strokeColor = "#3b82f6";
  } else if (pct >= 30) {
    strokeColor = "#f59e0b";
  }

  const dashArray = isVisible ? `${pct} ${100 - pct}` : `0 100`;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      title={`${mastered}/${total} mastered`}
    >
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full transform -rotate-90 select-none"
      >
        {/* Background circle */}
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <circle
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset="25"
          className="transition-[stroke-dasharray] duration-[800ms] ease-out"
        />
      </svg>
      {/* Centered text */}
      <span
        className="absolute text-white font-bold font-mono tracking-tighter"
        style={{ fontSize: size * 0.28 }}
      >
        {mastered}
      </span>
    </div>
  );
}
