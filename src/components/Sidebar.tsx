"use client";

import React from "react";
import { technologies, rawData, TechnologyData, Category } from "@/data";
import { StudyStatus } from "@/hooks/useStudyState";
import { MasteryRing } from "./MasteryRing";
import { BookOpen, X, Heart, ChevronDown, ChevronRight, Activity, Terminal, ShieldAlert, Cpu } from "lucide-react";

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
  activeRunbookTool?: string;
  setActiveRunbookTool?: (tool: string) => void;
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
  activeRunbookTool,
  setActiveRunbookTool,
}: SidebarProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    prep: true,
    runbooks: false,
    labs: false,
  });

  const toggleSection = (section: string) => {
    setExpanded((prev) => {
      const isCurrentlyOpen = prev[section];
      const nextExpanded = {
        prep: false,
        runbooks: false,
        labs: false,
      };
      nextExpanded[section as "prep" | "runbooks" | "labs"] = !isCurrentlyOpen;
      return nextExpanded;
    });
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
        {/* Sidebar Header with Simple Monospace Text Logo */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4 bg-card/85 select-none shrink-0">
          <div className="flex items-center space-x-1.5">
            <span className="font-mono text-base font-extrabold tracking-tight text-white">$</span>
            <span className="font-mono text-base font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00E676] to-[#A3FF1A]">exit 0</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#475569] hover:text-foreground hover:bg-muted md:hidden cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List scroll container */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5 bg-card select-none custom-scrollbar">
          
          {/* Module 1: Interview Prep */}
          <div className="space-y-1.5">
            <button
              onClick={() => toggleSection("prep")}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground font-mono transition-colors cursor-pointer bg-[#151B23]/40 border border-border/30 rounded-md"
            >
              <span className="flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Interview Prep</span>
              </span>
              {expanded.prep ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            
            {expanded.prep && (
              <div className="space-y-1 pl-1.5 border-l border-border/40 ml-2 animate-in fade-in duration-200">
                {/* Bookmarks */}
                <button
                  onClick={() => {
                    setActiveTechId("saved");
                    setActiveCategoryId(-1);
                    setActiveQuestionId(-1);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold font-mono transition-all duration-150 cursor-pointer border-l-2 ${
                    isSavedActive
                      ? "bg-[#1B2430]/60 text-[#00E676] border-l-[#00E676] shadow-xs"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-[#151B23]/35"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Heart className={`w-3.5 h-3.5 ${isSavedActive ? "text-[#00E676] fill-[#00E676]" : "text-muted-foreground"}`} />
                    <span className="truncate">Saved Questions</span>
                  </div>
                  {bookmarks.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border font-mono ${
                      isSavedActive
                        ? "border-[#00E676] text-[#00E676] bg-[#00E676]/5"
                        : "border-border text-muted-foreground"
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
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold font-mono transition-all duration-150 cursor-pointer border-l-2 ${
                            isActive
                              ? "bg-[#1B2430]/60 text-[#00E676] border-l-[#00E676] shadow-xs"
                              : "text-muted-foreground border-transparent hover:text-foreground hover:bg-[#151B23]/35"
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="truncate">{tech.name}</span>
                            {isReady && (
                              <span
                                className="text-[8px] font-mono font-bold text-[#0B0F14] bg-gradient-to-r from-[#00E676] to-[#A3FF1A] rounded px-1 py-0.2 shrink-0 select-none shadow-xs"
                                title="Ready to Interview"
                              >
                                exit 0
                              </span>
                            )}
                          </div>

                          <MasteryRing
                            total={stats.total}
                            mastered={stats.mastered}
                            size={26}
                          />
                        </button>

                        {/* Sub-Topics Accordion */}
                        {isActive && activeTech && !isSavedActive && (
                          <div className="mt-0.5 ml-4 pl-3.5 border-l border-border/40 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
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
                                  className={`w-full flex items-center justify-between py-2 px-2.5 rounded-md text-[11px] font-mono transition-all duration-150 cursor-pointer border-l-2 ${
                                    isCatActive
                                      ? "bg-[#1B2430]/35 text-[#00E676] border-l-[#00E676]"
                                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-[#151B23]/20"
                                  }`}
                                >
                                  <span className="truncate text-left max-w-[130px]">
                                    {cat.title}
                                  </span>
                                  <span className="text-[9px] font-bold ml-2 shrink-0 text-muted-foreground">
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
          <div className="space-y-1.5">
            <button
              onClick={() => toggleSection("runbooks")}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground font-mono transition-colors cursor-pointer bg-[#151B23]/40 border border-border/30 rounded-md"
            >
              <span className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#00C8FF]" />
                <span>Runbooks</span>
              </span>
              {expanded.runbooks ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            
            {expanded.runbooks && (
              <div className="space-y-1 pl-1.5 border-l border-border/40 ml-2 animate-in fade-in duration-200">
                {/* Active Runbooks links */}
                <div className="space-y-0.5">
                  {[
                    { key: "linux", name: "Linux Outages" },
                    { key: "git", name: "Git Recovery" },
                    { key: "networking", name: "Network Triage" },
                    { key: "docker", name: "Docker Container" },
                    { key: "kubernetes", name: "K8s Control Plane" },
                    { key: "terraform", name: "Terraform State" }
                  ].map((item) => {
                    const isSelected = activeTechId === "runbooks" && activeRunbookTool === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setActiveTechId("runbooks");
                          setActiveCategoryId(-1);
                          setActiveQuestionId(-1);
                          if (setActiveRunbookTool) {
                            setActiveRunbookTool(item.key);
                          }
                          onClose();
                        }}
                        className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border-l-2 font-mono ${
                          isSelected
                            ? "bg-[#1B2430]/60 text-[#00E676] border-l-[#00E676] shadow-xs"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:bg-[#151B23]/35"
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Module 3: Incident Labs */}
          <div className="space-y-1.5">
            <button
              onClick={() => toggleSection("labs")}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground font-mono transition-colors cursor-pointer bg-[#151B23]/40 border border-border/30 rounded-md"
            >
              <span className="flex items-center space-x-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#FFBD2E]" />
                <span>Incident Labs</span>
              </span>
              {expanded.labs ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>

            {expanded.labs && (
              <div className="space-y-1 pl-1.5 border-l border-border/40 ml-2 animate-in fade-in duration-200">
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTechId("incident_labs");
                      setActiveCategoryId(-1);
                      setActiveQuestionId(-1);
                      onClose();
                    }}
                    className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border-l-2 font-mono flex items-center justify-between ${
                      activeTechId === "incident_labs"
                        ? "bg-[#1B2430]/60 text-[#00E676] border-l-[#00E676] shadow-xs"
                        : "text-muted-foreground border-transparent hover:text-foreground hover:bg-[#151B23]/35"
                    }`}
                  >
                    <span>SRE Outage Quiz</span>
                    <span className="text-[8px] font-mono font-bold text-amber-500 border border-amber-500/30 bg-amber-500/10 rounded px-1.5 py-0.2 shrink-0 animate-pulse">
                      Soon
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border bg-card text-[10px] text-muted-foreground space-y-2.5 select-none shrink-0 font-mono">
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.4)]" />
            <span>Mastered (&gt; 7 days)</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00C8FF] shadow-[0_0_8px_rgba(0,200,255,0.4)]" />
            <span>Studying (&lt; 7 days)</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="w-2 h-2 rounded-full bg-[#26303C]" />
            <span>Unseen / New</span>
          </div>
        </div>
      </aside>
    </>
  );
}
