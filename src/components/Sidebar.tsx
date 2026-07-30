"use client";

import React from "react";
import { technologies, rawData, TechnologyData, Category } from "@/data";
import { StudyStatus } from "@/hooks/useStudyState";
import { MasteryRing } from "./MasteryRing";
import { BookOpen, X, Heart, ChevronDown, ChevronRight, Activity } from "lucide-react";

interface SidebarProps {
  activeTechId: string;
  setActiveTechId: (id: string) => void;
  activeCategoryId: number;
  setActiveCategoryId: (id: number) => void;
  setActiveQuestionId: (id: number) => void;
  progress: Record<string, StudyStatus>;
  bookmarks: string[];
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
  bookmarks,
  isOpen,
  onClose,
}: SidebarProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    prep: true,
    runbooks: false,
    labs: false,
  });

  const toggleSection = (section: string) => {
    setExpanded((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  // Calculate technology stats
  const getTechStats = (techId: string) => {
    const tech = rawData[techId];
    if (!tech) return { total: 0, mastered: 0 };
    
    let total = 0;
    let mastered = 0;
    
    tech.categories.forEach((cat) => {
      cat.questions.forEach((q) => {
        total++;
        if (progress[`${techId}-${q.id}`] === "mastered") {
          mastered++;
        }
      });
    });
    
    return { total, mastered };
  };

  // Calculate category stats
  const getCatStats = (cat: Category) => {
    let total = cat.questions.length;
    let mastered = cat.questions.filter((q) => progress[`${activeTechId}-${q.id}`] === "mastered").length;
    return { total, mastered };
  };

  const activeTech: TechnologyData = rawData[activeTechId];
  const isSavedActive = activeTechId === "saved";

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
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#22c55e]" />
            <h1 className="font-bold text-base tracking-tight text-foreground font-mono">
              ExitZero
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#475569] hover:text-foreground hover:bg-muted md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List scroll container */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4 bg-card select-none">
          {/* Module 1: Interview Prep */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection("prep")}
              className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] hover:text-foreground font-mono transition-colors cursor-pointer"
            >
              <span>Interview Prep</span>
              {expanded.prep ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            
            {expanded.prep && (
              <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                {/* Bookmarks */}
                <button
                  onClick={() => {
                    setActiveTechId("saved");
                    setActiveCategoryId(-1);
                    setActiveQuestionId(-1);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-l-2 ${
                    isSavedActive
                      ? "bg-background text-foreground border-[#22c55e]"
                      : "text-[#475569] border-transparent hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Heart className={`w-3.5 h-3.5 ${isSavedActive ? "text-[#22c55e] fill-[#22c55e]" : "text-[#475569]"}`} />
                    <span className="truncate">Saved Questions</span>
                  </div>
                  {bookmarks.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
                      isSavedActive
                        ? "border-[#22c55e] text-[#22c55e]"
                        : "border-border text-[#475569]"
                    }`}>
                      {bookmarks.length}
                    </span>
                  )}
                </button>

                {/* Technologies List */}
                <nav className="space-y-0.5">
                  {technologies.map((tech) => {
                    const isActive = tech.id === activeTechId;
                    const stats = getTechStats(tech.id);
                    const percent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
                    const isReady = percent >= 80;

                    return (
                      <div key={tech.id} className="space-y-0.5">
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
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-l-2 ${
                            isActive
                              ? "bg-background text-foreground border-[#22c55e]"
                              : "text-[#475569] border-transparent hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="truncate font-semibold">{tech.name}</span>
                            {isReady && (
                              <span
                                className="text-[9px] font-mono font-bold text-[#22c55e] bg-transparent border border-[#22c55e] rounded px-1.5 py-0.5"
                                title="Ready to Interview"
                              >
                                exit 0
                              </span>
                            )}
                          </div>

                          <MasteryRing
                            total={stats.total}
                            mastered={stats.mastered}
                            size={28}
                          />
                        </button>

                        {/* Sub-Topics Accordion */}
                        {isActive && activeTech && !isSavedActive && (
                          <div className="mt-0.5 ml-3 pl-2.5 border-l border-border space-y-0.5">
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
                                    onClose();
                                  }}
                                  className={`w-full flex items-center justify-between py-1.5 px-2 rounded-md text-xs transition-colors cursor-pointer border-l-2 ${
                                    isCatActive
                                      ? "bg-background text-foreground border-[#22c55e]"
                                      : "text-[#475569] border-transparent hover:text-foreground hover:bg-muted/20"
                                  }`}
                                >
                                  <span className="truncate text-left max-w-[150px] font-mono">
                                    {cat.title}
                                  </span>
                                  <span className="text-[10px] font-bold font-mono ml-2 shrink-0 text-muted-foreground">
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
            )}
          </div>

          {/* Module 2: Runbooks */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => toggleSection("runbooks")}
              className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] hover:text-foreground font-mono transition-colors cursor-pointer"
            >
              <span>Runbooks</span>
              {expanded.runbooks ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            
            {expanded.runbooks && (
              <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                {/* Active Runbooks links */}
                <div className="ml-3 pl-2.5 border-l border-border space-y-0.5">
                  {["K8s Control Plane Upgrade", "Private Docker Registry", "AWS IAM Policy Audit"].map((name, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveTechId("runbooks");
                        setActiveCategoryId(-1);
                        setActiveQuestionId(-1);
                        onClose();
                      }}
                      className={`w-full text-left py-2 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border-l-2 font-mono ${
                        activeTechId === "runbooks"
                          ? "bg-background text-foreground border-[#22c55e]"
                          : "text-[#475569] border-transparent hover:text-foreground hover:bg-muted/20"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Module 3: Incident Labs */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => toggleSection("labs")}
              className="w-full flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94a3b8] hover:text-foreground font-mono transition-colors cursor-pointer"
            >
              <span>Incident Labs</span>
              {expanded.labs ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {expanded.labs && (
              <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                <div className="ml-3 pl-2.5 border-l border-border space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTechId("incident_labs");
                      setActiveCategoryId(-1);
                      setActiveQuestionId(-1);
                      onClose();
                    }}
                    className={`w-full text-left py-2 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border-l-2 font-mono flex items-center justify-between ${
                      activeTechId === "incident_labs"
                        ? "bg-background text-foreground border-[#22c55e]"
                        : "text-[#475569] border-transparent hover:text-foreground hover:bg-muted/20"
                    }`}
                  >
                    <span>SRE Outage Quiz</span>
                    <span className="text-[8px] font-mono font-bold text-amber-500 border border-amber-500/30 bg-amber-500/10 rounded px-1.5 py-0.5">
                      Soon
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-card text-xs text-muted-foreground space-y-2 select-none">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span className="font-mono text-[10px]">Mastered (&gt; 7 days)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
            <span className="font-mono text-[10px]">Studying (&lt; 7 days)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#475569]" />
            <span className="font-mono text-[10px]">Unseen / New</span>
          </div>
        </div>
      </aside>
    </>
  );
}
