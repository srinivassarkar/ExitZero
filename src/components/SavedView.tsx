"use client";

import React from "react";
import { allQuestions, SearchableQuestion } from "@/data";
import { Play } from "lucide-react";

interface SavedViewProps {
  bookmarks: string[];
  onSelectQuestion: (techId: string, categoryId: number, questionId: number) => void;
  onStartStudy: () => void;
}

export function SavedView({ bookmarks, onSelectQuestion, onStartStudy }: SavedViewProps) {
  // Find matching question details from flat data
  const savedQuestions = allQuestions.filter((q) => bookmarks.includes(`${q.technologyId}-${q.id}`));

  // Group by technology
  const grouped: Record<string, SearchableQuestion[]> = {};
  savedQuestions.forEach((q) => {
    if (!grouped[q.technologyName]) {
      grouped[q.technologyName] = [];
    }
    grouped[q.technologyName].push(q);
  });

  const subjectsList = Object.keys(grouped);
  let subheaderText = "";
  if (subjectsList.length > 0) {
    if (subjectsList.length === 1) {
      subheaderText = `1 subject: ${subjectsList[0]}`;
    } else {
      const last = subjectsList.pop();
      subheaderText = `${bookmarks.length} questions across ${subjectsList.join(", ")} and ${last}`;
    }
  }

  const isEmpty = bookmarks.length === 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col space-y-6 bg-background">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-xl p-5 md:p-6 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center space-x-2">
            <span>Saved Questions</span>
            <span className="text-muted-foreground font-normal">({bookmarks.length})</span>
          </h2>
          {!isEmpty && (
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">
              {subheaderText}
            </p>
          )}
        </div>

        {!isEmpty && (
          <button
            onClick={onStartStudy}
            className="flex items-center justify-center space-x-2 bg-card border border-[#22c55e] hover:bg-[#22c55e]/10 text-[#22c55e] font-bold text-sm tracking-wider px-5 py-3 rounded-lg transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Study Saved</span>
          </button>
        )}
      </div>

      {/* Main List */}
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
          <div className="text-5xl text-[#475569] font-light select-none animate-pulse">
            ♡
          </div>
          <h3 className="font-mono text-base font-bold text-[#475569]">
            No saved questions yet
          </h3>
          <p className="font-mono text-xs text-[#475569]">
            Tap ♡ on any question to save it here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([techName, questions]) => (
            <div key={techName} className="space-y-3">
              {/* Group divider */}
              <div className="flex items-center space-x-3 text-xs font-mono font-bold text-muted-foreground/60 uppercase tracking-widest select-none">
                <span className="flex-1 h-px bg-border" />
                <span>
                  &mdash; {techName} ({questions.length}) &mdash;
                </span>
                <span className="flex-1 h-px bg-border" />
              </div>

              {/* Questions mapping */}
              <div className="grid grid-cols-1 gap-3">
                {questions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => onSelectQuestion(q.technologyId, q.categoryId, q.id)}
                    className="w-full text-left p-4 bg-card border border-border hover:border-[#2563eb] rounded-xl hover:bg-muted/40 transition-all flex flex-col space-y-2 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#2563eb] font-semibold uppercase tracking-wider">
                        Topic: {q.categoryTitle}
                      </span>
                      <span
                        className={`px-2 py-0.5 border rounded text-[9px] uppercase font-bold tracking-wide bg-transparent ${
                          q.difficulty === "Easy"
                            ? "border-[#22c55e] text-[#22c55e]"
                            : q.difficulty === "Medium"
                            ? "border-amber-500 text-amber-500"
                            : "border-rose-500 text-rose-500"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-[#2563eb] transition-colors leading-snug line-clamp-2">
                      {q.question}
                    </h4>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
