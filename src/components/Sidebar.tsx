"use client";

import React from "react";
import { technologies, rawData, TechnologyData, Category } from "@/data";
import { StudyStatus } from "@/hooks/useStudyState";
import { BookOpen, CheckCircle, Circle, ChevronRight, X } from "lucide-react";

interface SidebarProps {
  activeTechId: string;
  setActiveTechId: (id: string) => void;
  activeCategoryId: number;
  setActiveCategoryId: (id: number) => void;
  setActiveQuestionId: (id: number) => void;
  progress: Record<number, StudyStatus>;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  activeTechId,
  setActiveTechId,
  activeCategoryId,
  setActiveCategoryId,
  setActiveQuestionId,
  progress,
  isOpen,
  onClose,
}: SidebarProps) {
  
  // Calculate technology stats
  const getTechStats = (techId: string) => {
    const tech = rawData[techId];
    if (!tech) return { total: 0, mastered: 0 };
    
    let total = 0;
    let mastered = 0;
    
    tech.categories.forEach((cat) => {
      cat.questions.forEach((q) => {
        total++;
        if (progress[q.id] === "mastered") {
          mastered++;
        }
      });
    });
    
    return { total, mastered };
  };

  // Calculate category stats
  const getCatStats = (cat: Category) => {
    let total = cat.questions.length;
    let mastered = cat.questions.filter((q) => progress[q.id] === "mastered").length;
    return { total, mastered };
  };

  const activeTech: TechnologyData = rawData[activeTechId];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-card border-r border-border flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-base tracking-tight text-foreground">
              Interview Prep
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Technologies List */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 block mb-2">
              Subjects
            </span>
            <nav className="space-y-1">
              {technologies.map((tech) => {
                const isActive = tech.id === activeTechId;
                const stats = getTechStats(tech.id);
                const percent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

                return (
                  <div key={tech.id}>
                    <button
                      onClick={() => {
                        setActiveTechId(tech.id);
                        const techData = rawData[tech.id];
                        if (techData && techData.categories.length > 0) {
                          const firstCat = techData.categories[0];
                          setActiveCategoryId(firstCat.id);
                          if (firstCat.questions.length > 0) {
                            setActiveQuestionId(firstCat.questions[0].id);
                          }
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="truncate">{tech.name}</span>
                      <span className="flex items-center space-x-1.5 text-xs text-muted-foreground ml-2">
                        <span>
                          {stats.mastered}/{stats.total}
                        </span>
                        {percent > 0 && (
                          <span
                            className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                              percent === 100
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {percent}%
                          </span>
                        )}
                      </span>
                    </button>

                    {/* Nested Topics (Active Tech Only) */}
                    {isActive && activeTech && (
                      <div className="mt-1.5 ml-3 pl-2.5 border-l border-border/80 space-y-1">
                        {activeTech.categories.map((cat) => {
                          const isCatActive = cat.id === activeCategoryId;
                          const catStats = getCatStats(cat);
                          
                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setActiveCategoryId(cat.id);
                                if (cat.questions.length > 0) {
                                  setActiveQuestionId(cat.questions[0].id);
                                }
                                onClose(); // Close on mobile
                              }}
                              className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-xs transition-colors ${
                                isCatActive
                                  ? "text-primary font-semibold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <span className="truncate text-left max-w-[150px]">
                                {cat.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground/80 font-mono ml-2 shrink-0">
                                {catStats.mastered}/{catStats.total}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer / Legend */}
        <div className="p-4 border-t border-border bg-muted/30 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mastered</span>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="w-3.5 h-3.5 text-amber-500 fill-amber-500/15" />
            <span>Studying</span>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="w-3.5 h-3.5 text-slate-400" />
            <span>Unseen / Unmarked</span>
          </div>
        </div>
      </aside>
    </>
  );
}
