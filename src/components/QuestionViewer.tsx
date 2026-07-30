"use client";

import React, { useState, useEffect, useRef } from "react";
import { Question, rawData, technologies } from "@/data";
import { StudyStatus, SRSData } from "@/hooks/useStudyState";
import { triggerHapticFeedback } from "@/utils/audio";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  FileText,
  AlertOctagon,
} from "lucide-react";

interface QuestionViewerProps {
  question: Question;
  isFavorite: boolean;
  srsData: Record<string, SRSData>;
  timerMode: boolean;
  timerDuration: number;
  timerAutoAdvance: boolean;
  autoRevealEnabled: boolean;
  soundHapticsEnabled: boolean;
  onToggleFavorite: () => void;
  onSRSReview: (score: "Again" | "Good" | "Easy") => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  addToast: (msg: string, duration?: number) => void;
  isScopedSession?: boolean;
  techId: string;
}

export function QuestionViewer({
  question,
  isFavorite,
  srsData,
  timerMode,
  timerDuration,
  timerAutoAdvance,
  autoRevealEnabled,
  soundHapticsEnabled,
  onToggleFavorite,
  onSRSReview,
  onPrev,
  onNext,
  onRandom,
  addToast,
  isScopedSession = false,
  techId,
}: QuestionViewerProps) {
  const [showAnswer, setShowAnswer] = useState(autoRevealEnabled);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [animateHeart, setAnimateHeart] = useState(false);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset answer visibility and timer when question changes
  useEffect(() => {
    setShowAnswer(autoRevealEnabled);
    setTimeLeft(timerDuration);
    
    // Clear any existing timeouts/intervals
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);

    if (timerMode) {
      startTimer();
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    };
  }, [question.id, timerMode, timerDuration, autoRevealEnabled]);

  // Start timer interval
  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleTimerExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Pause timer when answer is revealed
  useEffect(() => {
    if (showAnswer && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, [showAnswer]);

  const handleTimerExpire = () => {
    setShowAnswer(true);
    addToast("Time's up — answer revealed", 2);

    if (timerAutoAdvance) {
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        onNext();
      }, 8000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (soundHapticsEnabled) {
      triggerHapticFeedback("light");
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleBookmarkClick = () => {
    onToggleFavorite();
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 200);
  };

  // Get SRS Pill Details
  const getSrsPill = () => {
    const record = srsData[`${techId}-${question.id}`];
    if (!record || record.status === "unseen") {
      return { text: "New", color: "border-[#475569] text-[#475569]" };
    }
    if (record.status === "mastered") {
      return { text: "Mastered", color: "border-[#22c55e] text-[#22c55e]" };
    }

    const nextReviewDate = new Date(record.nextReview);
    const diffTime = nextReviewDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { text: "Due today", color: "border-[#f59e0b] text-[#f59e0b]" };
    }
    return { text: `Review in ${diffDays}d`, color: "border-[#2563eb] text-[#2563eb]" };
  };

  const srsPill = getSrsPill();
  const tech = rawData[techId];
  const techName = tech?.technology || techId;
  const category = tech?.categories.find((c) =>
    c.questions.some((q) => q.id === question.id)
  );
  const categoryName = category?.title || "Fundamentals";

  // Progress Percent for Timer Bar
  const timerPercent = (timeLeft / timerDuration) * 100;
  let timerColor = "bg-[#22c55e]";
  let timerTextColor = "text-[#22c55e]";

  if (timerPercent < 20) {
    timerColor = "bg-[#ef4444]";
    timerTextColor = "text-[#ef4444]";
  } else if (timerPercent <= 50) {
    timerColor = "bg-[#f59e0b]";
    timerTextColor = "text-[#f59e0b]";
  }

  // Format Time Left to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full px-4 py-4 md:py-6 md:px-8 overflow-hidden bg-background">
      {/* 1. Question Card (Fixed at the top) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-lg relative flex flex-col shrink-0 mb-4">
        {/* Timer Progress Bar */}
        {timerMode && (
          <div className="w-full h-[3px] bg-muted absolute top-0 left-0 right-0 z-10">
            <div
              className={`h-full ${timerColor} transition-all duration-1000 ease-linear`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        )}

        <div className="p-5 md:p-6 space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 select-none">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2 min-w-0">
              {/* Monospace Directory Breadcrumbs */}
              <div className="flex items-center space-x-1.5 font-mono text-[10px] text-muted-foreground overflow-x-auto whitespace-nowrap py-0.5 no-scrollbar max-w-full">
                <span className="opacity-80">interview prep</span>
                <span className="text-slate-700 font-normal select-none">&gt;</span>
                <span className="capitalize font-bold text-foreground">{techName}</span>
                <span className="text-slate-700 font-normal select-none">&gt;</span>
                <span className="opacity-85">{categoryName}</span>
                <span className="text-slate-700 font-normal select-none">&gt;</span>
                <span className="text-[#00E676] font-extrabold bg-[#00E676]/5 border border-[#00E676]/20 rounded px-1.5 py-0.2 shrink-0">Q#{question.questionNumber}</span>
              </div>

              <span
                className={`px-1.5 py-0.2 border rounded text-[9px] uppercase font-bold tracking-wider bg-transparent shrink-0 ${
                  question.difficulty === "Easy"
                    ? "border-[#00E676] text-[#00E676]"
                    : question.difficulty === "Medium"
                    ? "border-amber-500 text-amber-500"
                    : "border-rose-500 text-rose-500"
                }`}
              >
                {question.difficulty}
              </span>

              {/* Spaced Repetition status pill */}
              <span
                className={`px-1.5 py-0.2 border rounded font-mono text-[9px] font-bold bg-transparent select-none shrink-0 ${
                  srsPill.text === "Mastered"
                    ? "border-[#00E676] text-[#00E676]"
                    : srsPill.text.startsWith("Review")
                    ? "border-[#00C8FF] text-[#00C8FF]"
                    : srsPill.text.startsWith("Due")
                    ? "border-amber-500 text-amber-500 animate-pulse"
                    : "border-muted-foreground/40 text-muted-foreground/80"
                }`}
              >
                {srsPill.text}
              </span>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              {/* Timer Text */}
              {timerMode && (
                <span
                  className={`font-mono text-xs font-bold leading-none ${timerTextColor} ${
                    timeLeft <= 10 ? "animate-timer-pulse" : ""
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              )}

              {/* Bookmark Toggle Heart */}
              <button
                onClick={handleBookmarkClick}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isFavorite
                    ? "border-rose-500/20 bg-rose-500/10 text-[#ef4444]"
                    : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                } ${animateHeart ? "scale-130" : "scale-100"} duration-200`}
                title={isFavorite ? "Remove Bookmark" : "Save Bookmark"}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-[#ef4444]" : ""}`} />
              </button>
            </div>
          </div>

          {/* Question Title */}
          <h2 className="text-base md:text-lg lg:text-xl font-bold text-foreground leading-snug">
            {question.question}
          </h2>
        </div>
      </div>

      {/* 2. Scrollable Answer Details Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 bg-background">
        {/* Reveal Answer Button */}
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide border flex items-center justify-center space-x-2 transition-all cursor-pointer bg-card hover:bg-muted text-foreground ${
            showAnswer
              ? "border-[#22c55e]"
              : "border-[#2563eb]"
          }`}
        >
          {showAnswer ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Hide Answer</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Reveal Answer</span>
            </>
          )}
        </button>

        {showAnswer && (
          <div className="space-y-4 pb-4 animate-in fade-in slide-in-from-top-4 duration-300">
            {/* Answer Explanation */}
            <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2563eb] font-mono">
                Answer Explanation
              </h3>
              <p className="text-foreground leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                {question.answer}
              </p>

              {/* Key Points */}
              {question.keyPoints && question.keyPoints.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 font-mono">
                    Key Points
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-foreground">
                    {question.keyPoints.map((pt, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-[#2563eb] mt-1 shrink-0">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Code Blocks / Configurations */}
            {question.codeBlocks && question.codeBlocks.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 font-mono">
                  Commands & Configurations
                </h3>
                <div className="space-y-2.5">
                  {question.codeBlocks.map((block, idx) => {
                    const blockId = `${question.id}-${idx}`;
                    return (
                      <div
                        key={idx}
                        className="bg-card border border-border rounded-xl overflow-hidden shadow-lg"
                      >
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30 text-muted-foreground text-xs font-mono select-none">
                          <span>{block.filename || block.language || "terminal"}</span>
                          <button
                            onClick={() => copyToClipboard(block.code, blockId)}
                            className="flex items-center space-x-1.5 hover:text-foreground transition-colors cursor-pointer"
                          >
                            {copiedId === blockId ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-foreground leading-relaxed bg-background/50">
                          <code className="animate-cursor-blink">{block.code}</code>
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Warnings callout */}
            {question.warnings && question.warnings.length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-start space-x-3 shadow-xs">
                <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Warnings & Risks
                  </span>
                  <ul className="list-disc list-inside space-y-1">
                    {question.warnings.map((warn, i) => (
                      <li key={i}>{warn}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Best Practices callout */}
            {question.bestPractices && question.bestPractices.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-start space-x-3 shadow-xs">
                <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Best Practices
                  </span>
                  <ul className="list-disc list-inside space-y-1">
                    {question.bestPractices.map((bp, i) => (
                      <li key={i}>{bp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Interview Notes & Tips */}
            {question.interviewNotes && question.interviewNotes.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl flex items-start space-x-3 shadow-xs">
                <FileText className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Interview Notes
                  </span>
                  <ul className="list-disc list-inside space-y-1">
                    {question.interviewNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Examples callout */}
            {question.examples && question.examples.length > 0 && (
              <div className="bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#3b82f6] p-4 rounded-xl flex items-start space-x-3 shadow-xs">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Real-world Examples
                  </span>
                  <ul className="list-disc list-inside space-y-1">
                    {question.examples.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 select-none">
                {question.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-card text-muted-foreground border border-border text-[10px] font-semibold px-2.5 py-0.5 rounded-full font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* SRS Score Options (Moved to the very end of answer details) */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3 mt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block font-mono">
                Record Review Difficulty
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    onSRSReview("Again");
                    addToast("Review set to Again (Study mode)", 2);
                  }}
                  className="flex-1 py-2.5 bg-transparent border border-rose-500 text-rose-500 hover:bg-rose-500/10 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Again (Not sure)
                </button>
                <button
                  onClick={() => {
                    onSRSReview("Good");
                    addToast("Review set to Good (Scheduled)", 2);
                  }}
                  className="flex-1 py-2.5 bg-transparent border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb]/10 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Good (Knew it)
                </button>
                <button
                  onClick={() => {
                    onSRSReview("Easy");
                    addToast("Review set to Easy (Mastered)", 2);
                  }}
                  className="flex-1 py-2.5 bg-transparent border border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e]/10 font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Easy (Too easy)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Navigation Footer (Fixed at the bottom) */}
      <div className="pt-4 border-t border-border bg-background shrink-0 mt-4 grid grid-cols-3 gap-2 sm:gap-4 w-full">
        {/* Column 1 */}
        <div className="flex justify-start">
          {!timerMode ? (
            <button
              onClick={onPrev}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3 py-2 border border-border rounded-lg text-xs sm:text-sm text-foreground hover:bg-muted font-semibold transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">Previous</span>
              <span className="xs:hidden">Prev</span>
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Column 2 */}
        <div className="flex justify-center">
          <button
            onClick={onRandom}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3 py-2 border border-border rounded-lg text-xs sm:text-sm text-foreground hover:bg-muted font-semibold transition-all cursor-pointer"
            title="Pick a Random Question"
          >
            <Shuffle className="w-3.5 h-3.5 shrink-0" />
            <span>Random</span>
          </button>
        </div>

        {/* Column 3 */}
        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-3 py-2 border border-border rounded-lg text-xs sm:text-sm text-foreground hover:bg-muted font-semibold transition-all cursor-pointer"
          >
            <span className="hidden xs:inline">Next Question</span>
            <span className="xs:hidden">Next</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
