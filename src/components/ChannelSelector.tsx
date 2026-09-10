"use client";

import React, { useState, useEffect, useRef } from "react";
import { rawData, technologies, TechnologyData, allQuestions } from "@/data";
import { StudyStatus } from "@/hooks/useStudyState";
import { MasteryRing } from "@/components/MasteryRing";
import {
  X,
  Layers,
  Compass,
  Cloud,
  Terminal,
  FileCode,
  Bot,
  Heart,
  ChevronRight,
  Sparkles,
  Play,
  Flame,
  ShieldAlert,
  BookOpen,
  Network,
  GitBranch,
} from "lucide-react";

export const runbooksList = [
  {
    key: "linux",
    name: "Linux Outages",
    description: "Kernel panics, OOM killer, disk saturation, process locks, zombie reaping",
    icon: Terminal,
    color: "#00E676",
  },
  {
    key: "git",
    name: "Git Recovery",
    description: "Dangling commits, reflog forensics, detached HEAD, merge conflict undo",
    icon: GitBranch,
    color: "#FF5F56",
  },
  {
    key: "networking",
    name: "Network Triage",
    description: "DNS failure, port exhaustion, iptables/nftables, TCP RST, MTU black holes",
    icon: Network,
    color: "#00C8FF",
  },
  {
    key: "docker",
    name: "Docker Container",
    description: "Daemon hang, bridge exhaustion, rootfs corrupt, zombie processes, cgroup limits",
    icon: Layers,
    color: "#00C8FF",
  },
  {
    key: "kubernetes",
    name: "K8s Control Plane",
    description: "CrashLoopBackOff, etcd split-brain, pending pods, webhook timeouts, evictions",
    icon: Compass,
    color: "#326CE5",
  },
  {
    key: "terraform",
    name: "Terraform State",
    description: "State lock, drift detection, corrupted state recovery, import untracked",
    icon: FileCode,
    color: "#7B42BC",
  },
];

interface ChannelSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeTechId: string;
  activeCategoryId: number;
  activeRunbookTool?: string;
  onSelectChannel: (
    type: "tech" | "all" | "saved" | "runbooks" | "incident_labs",
    techId?: string,
    categoryId?: number,
    runbookKey?: string
  ) => void;
  progress: Record<string, StudyStatus>;
  bookmarks: string[];
}

export function ChannelSelector({
  isOpen,
  onClose,
  activeTechId,
  activeCategoryId,
  activeRunbookTool = "linux",
  onSelectChannel,
  progress,
  bookmarks,
}: ChannelSelectorProps) {
  // Navigation tabs inside modal: "interview" | "runbooks" | "all" | "saved"
  const [activeTab, setActiveTab] = useState<"interview" | "runbooks" | "all" | "saved">(
    activeTechId === "runbooks"
      ? "runbooks"
      : activeTechId === "saved"
      ? "saved"
      : activeTechId === "all"
      ? "all"
      : "interview"
  );

  const [selectedTechId, setSelectedTechId] = useState<string>(
    technologies.some((t) => t.id === activeTechId) ? activeTechId : "docker"
  );
  const dragStartYRef = useRef<number | null>(null);

  const handleDragStart = (e: React.TouchEvent) => {
    dragStartYRef.current = e.touches[0].clientY;
  };

  const handleDragEnd = (e: React.TouchEvent) => {
    if (dragStartYRef.current === null) return;
    const diffY = e.changedTouches[0].clientY - dragStartYRef.current;
    if (diffY > 60) {
      onClose();
    }
    dragStartYRef.current = null;
  };

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (activeTechId === "runbooks") {
        setActiveTab("runbooks");
      } else if (activeTechId === "saved") {
        setActiveTab("saved");
      } else if (activeTechId === "all") {
        setActiveTab("all");
      } else {
        setActiveTab("interview");
        if (technologies.some((t) => t.id === activeTechId)) {
          setSelectedTechId(activeTechId);
        }
      }
    }
  }, [isOpen, activeTechId, activeRunbookTool]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  const getChannelIcon = (id: string, className = "w-4 h-4") => {
    switch (id) {
      case "docker":
        return <Layers className={className} />;
      case "kubernetes":
        return <Compass className={className} />;
      case "aws":
        return <Cloud className={className} />;
      case "devops":
        return <Terminal className={className} />;
      case "jenkins":
        return <Bot className={className} />;
      case "terraform":
        return <FileCode className={className} />;
      case "saved":
        return <Heart className={className} />;
      default:
        return <Terminal className={className} />;
    }
  };

  const currentTechData: TechnologyData | undefined = rawData[selectedTechId];
  const currentStats = getTechStats(selectedTechId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Target profile and channel selector"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-[#0B0F14]/90 backdrop-blur-md flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[#151B23] border-t sm:border border-[#26303C] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[88vh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200">
        {/* Mobile Pull Handle */}
        <div
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          className="sm:hidden pt-3 pb-1.5 flex justify-center bg-[#0B0F14]/70 cursor-grab active:cursor-grabbing shrink-0"
        >
          <div className="w-12 h-1.5 bg-[#26303C] rounded-full" />
        </div>

        {/* Header */}
        <div
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          className="px-5 py-3 sm:py-3.5 border-b border-[#26303C] flex items-center justify-between shrink-0 bg-[#0B0F14]/60"
        >
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#00E676] font-bold">
                $ target --profile
              </div>
              <h2 className="text-sm md:text-base font-bold text-[#E6EDF3] font-mono">
                Select Study Feed Channel
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close channel selector"
            className="p-1.5 rounded-lg border border-[#26303C] text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#26303C]/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Type Category Nav Pills */}
        <div className="px-4 py-2 border-b border-[#26303C] bg-[#0B0F14]/30 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
          <button
            onClick={() => setActiveTab("interview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === "interview"
                ? "bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 shadow-[0_0_8px_rgba(0,230,118,0.15)]"
                : "text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#26303C]/30 border border-transparent"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interview Prep</span>
          </button>

          <button
            onClick={() => setActiveTab("runbooks")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === "runbooks"
                ? "bg-[#00C8FF]/15 text-[#00C8FF] border border-[#00C8FF]/30 shadow-[0_0_8px_rgba(0,200,255,0.15)]"
                : "text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#26303C]/30 border border-transparent"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Runbooks ({runbooksList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === "all"
                ? "bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 shadow-[0_0_8px_rgba(0,230,118,0.15)]"
                : "text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#26303C]/30 border border-transparent"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Questions</span>
          </button>

          {bookmarks.length > 0 && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                activeTab === "saved"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.15)]"
                  : "text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#26303C]/30 border border-transparent"
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Bookmarks ({bookmarks.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              onSelectChannel("incident_labs");
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 text-[#7D8590] hover:text-amber-400 hover:bg-[#26303C]/30 border border-transparent"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Incident Labs</span>
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5">
          {/* TAB 1: INTERVIEW PREP */}
          {activeTab === "interview" && (
            <div className="space-y-4">
              {/* Technology Profiles Grid */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7D8590] block mb-2">
                  1. Choose Target Domain
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {technologies.map((tech) => {
                    const stats = getTechStats(tech.id);
                    const isSelected = selectedTechId === tech.id;
                    return (
                      <button
                        key={tech.id}
                        onClick={() => setSelectedTechId(tech.id)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-150 cursor-pointer relative group ${
                          isSelected
                            ? "border-[#00E676] bg-[#00E676]/10 shadow-[0_0_12px_rgba(0,230,118,0.15)]"
                            : "border-[#26303C] bg-[#0B0F14]/60 hover:border-[#7D8590] hover:bg-[#151B23]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-lg border ${
                              isSelected
                                ? "border-[#00E676]/40 bg-[#00E676]/20 text-[#00E676]"
                                : "border-[#26303C] bg-[#151B23] text-[#7D8590] group-hover:text-[#E6EDF3]"
                            }`}
                          >
                            {getChannelIcon(tech.id, "w-4 h-4")}
                          </div>
                          <MasteryRing total={stats.total} mastered={stats.mastered} size={26} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#E6EDF3] block leading-tight font-mono">
                            {tech.name}
                          </span>
                          <span className="text-[10px] text-[#7D8590] font-mono block">
                            {stats.total} questions &bull; {stats.mastered} mastered
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtopic Modules for Selected Tech */}
              {currentTechData && (
                <div className="pt-3 border-t border-[#26303C] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7D8590]">
                      2. Scope: {currentTechData.technology}
                    </span>
                    <span className="text-[10px] font-mono text-[#00E676]">
                      {currentStats.total} Questions Available
                    </span>
                  </div>

                  {/* Quick button to practice ALL questions in this tech */}
                  <button
                    onClick={() => {
                      onSelectChannel("tech", selectedTechId, -1);
                      onClose();
                    }}
                    className="w-full p-3 rounded-xl border border-[#00E676] bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] font-mono font-bold text-xs flex items-center justify-between transition-all group cursor-pointer shadow-[0_0_12px_rgba(0,230,118,0.15)]"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded bg-[#00E676] text-[#0B0F14]">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-extrabold text-[#E6EDF3] flex items-center space-x-1.5">
                          <span>Practice ALL {currentTechData.technology} Questions</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40">
                            {currentStats.total} Qs
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7D8590]">
                          Full queue combining all {currentTechData.categories.length} subtopics
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Subtopic Category Cards */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-[#7D8590] block px-0.5">
                      Or zero-in on a specific module:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentTechData.categories.map((cat) => {
                        const catTotal = cat.questions.length;
                        const catMastered = cat.questions.filter(
                          (q) => progress[`${selectedTechId}-${q.id}`] === "mastered"
                        ).length;
                        const isCatActive =
                          activeTechId === selectedTechId && activeCategoryId === cat.id;

                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              onSelectChannel("tech", selectedTechId, cat.id);
                              onClose();
                            }}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer group ${
                              isCatActive
                                ? "border-[#00E676] bg-[#00E676]/5 text-[#E6EDF3]"
                                : "border-[#26303C] bg-[#0B0F14]/40 hover:border-[#7D8590] hover:bg-[#151B23] text-[#7D8590] hover:text-[#E6EDF3]"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-mono font-bold block truncate">
                                {cat.title}
                              </span>
                              <span className="text-[10px] font-mono text-[#7D8590]">
                                {catTotal} questions &bull; {catMastered} mastered
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#00E676]" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RUNBOOKS */}
          {activeTab === "runbooks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00C8FF] block">
                    Operational Incident Runbooks
                  </span>
                  <p className="text-xs text-[#7D8590] mt-0.5">
                    Select an operational procedure to diagnose outages and execute triage commands.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 px-2 py-0.5 rounded shrink-0">
                  {runbooksList.length} Runbooks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {runbooksList.map((rb) => {
                  const Icon = rb.icon;
                  const isActive = activeTechId === "runbooks" && activeRunbookTool === rb.key;

                  return (
                    <button
                      key={rb.key}
                      onClick={() => {
                        onSelectChannel("runbooks", undefined, -1, rb.key);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group relative ${
                        isActive
                          ? "border-[#00E676] bg-[#00E676]/10 shadow-[0_0_12px_rgba(0,230,118,0.15)]"
                          : "border-[#26303C] bg-[#0B0F14]/60 hover:border-[#00C8FF]/50 hover:bg-[#151B23]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className="p-2 rounded-lg border border-[#26303C] bg-[#151B23] text-[#00C8FF] group-hover:text-[#00E676] group-hover:border-[#00E676]/30 transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-mono uppercase font-bold text-[#7D8590] group-hover:text-[#E6EDF3] flex items-center space-x-1">
                          <span>Open Runbook</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#E6EDF3] block leading-tight font-mono mb-1">
                          {rb.name}
                        </span>
                        <p className="text-[10px] text-[#7D8590] line-clamp-2 leading-relaxed">
                          {rb.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ALL QUESTIONS */}
          {activeTab === "all" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#00E676]/30 bg-[#00E676]/5 space-y-3">
                <div className="flex items-center space-x-2 text-[#00E676] font-mono text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Master DevOps Queue &bull; All 6 Technologies</span>
                </div>
                <p className="text-xs text-[#7D8590] leading-relaxed">
                  Study session combining all {allQuestions.length} questions from Docker, Kubernetes, AWS, Jenkins, Linux & Terraform, automatically prioritized by your SM-2 spaced repetition review schedule.
                </p>
                <button
                  onClick={() => {
                    onSelectChannel("all", "all", -1);
                    onClose();
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C8FF] hover:opacity-95 text-[#0B0F14] font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_16px_rgba(0,230,118,0.25)] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Practice ALL {allQuestions.length} DevOps Questions</span>
                </button>
              </div>

              {/* Quick breakdown */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7D8590] block">
                  Channel Breakdown
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {technologies.map((t) => {
                    const stats = getTechStats(t.id);
                    return (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-lg border border-[#26303C] bg-[#0B0F14]/40 flex items-center justify-between"
                      >
                        <span className="text-xs font-mono text-[#E6EDF3]">{t.name}</span>
                        <span className="text-[10px] font-mono text-[#00E676] font-bold">
                          {stats.total} Qs
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAVED BOOKMARKS */}
          {activeTab === "saved" && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold">
                <Heart className="w-4 h-4 fill-current" />
                <span>Personal Saved Bookmarks</span>
              </div>
              <p className="text-xs text-[#7D8590] leading-relaxed">
                Practice exclusively through your {bookmarks.length} saved / favorite questions.
              </p>
              <button
                onClick={() => {
                  onSelectChannel("saved");
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-mono font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>Study {bookmarks.length} Bookmarked Questions</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#26303C] bg-[#0B0F14]/60 flex items-center justify-between text-[11px] font-mono text-[#7D8590]">
          <span className="hidden sm:inline">Tip: Press [t] anytime to switch feed channel</span>
          <span className="sm:hidden">Press [Esc] to exit</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border border-[#26303C] hover:bg-[#26303C]/40 text-[#E6EDF3] transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
