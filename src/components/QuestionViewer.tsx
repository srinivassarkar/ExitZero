"use client";

import React, { useState, useEffect } from "react";
import { Question } from "@/data";
import { StudyStatus } from "@/hooks/useStudyState";
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
  status: StudyStatus;
  onToggleFavorite: () => void;
  onStatusChange: (status: StudyStatus) => void;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
}

export function QuestionViewer({
  question,
  isFavorite,
  status,
  onToggleFavorite,
  onStatusChange,
  onPrev,
  onNext,
  onRandom,
}: QuestionViewerProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Hide answer when question changes
  useEffect(() => {
    setShowAnswer(false);
  }, [question.id]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col space-y-6">
      {/* Question Header Card */}
      <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-xs flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest font-semibold">
              Question {question.questionNumber}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${
                question.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : question.difficulty === "Medium"
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Favorite button */}
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-lg border transition-all ${
                isFavorite
                  ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                  : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Question Text */}
        <h2 className="text-lg md:text-xl font-bold text-foreground leading-snug">
          {question.question}
        </h2>

        {/* Study State selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground mr-1">Study Status:</span>
          <button
            onClick={() => onStatusChange("unseen")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              status === "unseen" || !status
                ? "bg-secondary text-foreground font-semibold border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Unmarked
          </button>
          <button
            onClick={() => onStatusChange("studying")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
              status === "studying"
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Studying</span>
          </button>
          <button
            onClick={() => onStatusChange("mastered")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1.5 ${
              status === "mastered"
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Mastered</span>
          </button>
        </div>
      </div>

      {/* Toggle Answer Button */}
      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide border flex items-center justify-center space-x-2 transition-all ${
          showAnswer
            ? "bg-card border-border hover:bg-muted text-foreground"
            : "bg-primary text-primary-foreground border-transparent hover:bg-primary/95 shadow-md shadow-primary/10"
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

      {/* Answer Content */}
      {showAnswer && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Answer Description */}
          <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
              Answer Explanation
            </h3>
            <p className="text-foreground leading-relaxed text-sm md:text-base whitespace-pre-wrap">
              {question.answer}
            </p>

            {/* Key Points */}
            {question.keyPoints && question.keyPoints.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Key Points
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-foreground">
                  {question.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-primary mt-1 shrink-0">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Code Blocks / Commands */}
          {question.codeBlocks && question.codeBlocks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Commands & Configurations
              </h3>
              <div className="space-y-3">
                {question.codeBlocks.map((block, idx) => {
                  const blockId = `${question.id}-${idx}`;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950 text-slate-400 text-xs font-mono">
                        <span className="lowercase">
                          {block.filename || block.language || "terminal"}
                        </span>
                        <button
                          onClick={() => copyToClipboard(block.code, blockId)}
                          className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors"
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
                      {/* Code */}
                      <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-slate-100 leading-relaxed bg-slate-900">
                        <code>{block.code}</code>
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Warnings callout */}
          {question.warnings && question.warnings.length > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-start space-x-3">
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
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl flex items-start space-x-3">
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
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 p-4 rounded-xl flex items-start space-x-3">
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
            <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl flex items-start space-x-3">
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
            <div className="flex flex-wrap gap-1.5 pt-2">
              {question.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-muted text-muted-foreground border border-border text-[10px] font-medium px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-border flex items-center justify-between bg-background shrink-0 pb-10">
        <button
          onClick={onPrev}
          className="flex items-center space-x-1.5 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted font-medium transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={onRandom}
          className="flex items-center space-x-1.5 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted font-medium transition-all"
          title="Pick a Random Question"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Random</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center space-x-1.5 px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted font-medium transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
