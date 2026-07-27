"use client";

import React, { useState, useEffect, useRef } from "react";
import Fuse from "fuse.js";
import { allQuestions, SearchableQuestion } from "@/data";
import { Search, X } from "lucide-react";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (techId: string, categoryId: number, questionId: number) => void;
}

export function SearchDialog({ isOpen, onClose, onSelectQuestion }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchableQuestion[]>([]);
  const fuseRef = useRef<Fuse<SearchableQuestion> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Fuse.js client-side
  useEffect(() => {
    fuseRef.current = new Fuse(allQuestions, {
      keys: [
        { name: "question", weight: 0.5 },
        { name: "answer", weight: 0.2 },
        { name: "tags", weight: 0.2 },
        { name: "categoryTitle", weight: 0.1 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Run search
  const handleSearch = (val: string) => {
    setQuery(val);
    if (!val.trim() || !fuseRef.current) {
      setResults([]);
      return;
    }
    const searchRes = fuseRef.current.search(val).slice(0, 8);
    setResults(searchRes.map((r) => r.item));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 md:px-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[70vh]">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-hidden text-base"
            placeholder="Type to search questions, answers, tags..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((q) => (
                <button
                  key={`${q.technologyId}-${q.id}`}
                  onClick={() => {
                    onSelectQuestion(q.technologyId, q.categoryId, q.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/80 focus:bg-muted flex flex-col transition-colors border border-transparent hover:border-border/30"
                >
                  <div className="flex items-center space-x-2 text-xs font-semibold text-primary mb-1">
                    <span className="uppercase tracking-wider">{q.technologyName}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="truncate max-w-[200px]">{q.categoryTitle}</span>
                    <span className="text-muted-foreground">•</span>
                    <span>Q{q.questionNumber}</span>
                    <span
                      className={`ml-auto px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${
                        q.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : q.difficulty === "Medium"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground line-clamp-1">
                    {q.question}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {q.answer}
                  </p>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Tip: type terms like &ldquo;Docker&rdquo;, &ldquo;OIDC&rdquo;, &ldquo;Rate limiting&rdquo;, or specific commands.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground flex justify-between bg-muted/40">
          <span>Search powered by Fuse.js</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
