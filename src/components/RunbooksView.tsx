"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Terminal,
  Network,
  GitBranch,
  Search,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Cpu,
  Layers,
  Compass,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  Eye,
  EyeOff,
  Info,
  ThumbsUp,
  X,
  FileCode,
  SlidersHorizontal,
  CheckCircle2,
  Circle
} from "lucide-react";
import { playSoundEffect, triggerHapticFeedback } from "@/utils/audio";

// Import all runbook JSON files
import linuxData from "@/data/runbooks/01.linux.json";
import gitData from "@/data/runbooks/02.git.json";
import networkingData from "@/data/runbooks/03.networking.json";
import dockerData from "@/data/runbooks/04.docker.json";
import kubernetesData from "@/data/runbooks/05.kubernetes.json";
import terraformData from "@/data/runbooks/06.terraform.json";

interface CommandItem {
  id: number;
  title: string;
  command: string;
  summary: string;
  problem: string;
  why_this_command: string;
  thinking_process: string[];
  syntax: string;
  examples: string[];
  expected_output: string;
  how_to_interpret_output: string;
  real_world_incidents: string[];
  common_mistakes: string[];
  what_to_check_before: string[];
  what_to_check_after: string[];
  related_commands: string[];
  best_practices: string[];
  interview_question: string;
  interview_answer: string;
  importance: number;
  frequency: string;
  difficulty: string;
  tags: string[];
}

interface Runbook {
  tool: string;
  version: string;
  description: string;
  totalCommands: number;
  commands: CommandItem[];
}

interface RunbooksViewProps {
  soundHapticsEnabled?: boolean;
  activeTool?: string;
  setActiveTool?: (tool: string) => void;
}

export function RunbooksView({
  soundHapticsEnabled = true,
  activeTool: propActiveTool,
  setActiveTool: propSetActiveTool,
}: RunbooksViewProps) {
  // Map tools to their imports
  const runbooks: Record<string, Runbook> = {
    linux: linuxData as unknown as Runbook,
    git: gitData as unknown as Runbook,
    networking: networkingData as unknown as Runbook,
    docker: dockerData as unknown as Runbook,
    kubernetes: kubernetesData as unknown as Runbook,
    terraform: terraformData as unknown as Runbook,
  };

  // State management
  const [localActiveTool, setLocalActiveTool] = useState<string>("linux");
  const activeTool = propActiveTool || localActiveTool;
  const setActiveTool = propSetActiveTool || setLocalActiveTool;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [selectedCommandId, setSelectedCommandId] = useState<number | null>(1);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState<boolean>(false);
  
  // Accordion section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    diagnostics: true,
    execution: true,
    recovery: false,
    interview: false,
  });

  // Reveal interview answer state
  const [revealAnswer, setRevealAnswer] = useState<boolean>(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  // Interactive Triage Checklist state
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`exitzero_runbook_checks_${activeTool}`);
      if (saved) {
        setCheckedSteps(JSON.parse(saved));
      } else {
        setCheckedSteps({});
      }
    } catch (e) {}
  }, [activeTool]);

  const toggleStepCheck = (id: number) => {
    const key = `${activeTool}-${id}`;
    const nextVal = !checkedSteps[key];
    const updated = { ...checkedSteps, [key]: nextVal };
    setCheckedSteps(updated);
    try {
      localStorage.setItem(`exitzero_runbook_checks_${activeTool}`, JSON.stringify(updated));
    } catch (e) {}

    if (soundHapticsEnabled) {
      if (nextVal) {
        playSoundEffect("success");
        triggerHapticFeedback("medium");
      } else {
        playSoundEffect("click");
        triggerHapticFeedback("light");
      }
    }
  };

  const resetChecks = () => {
    setCheckedSteps({});
    try {
      localStorage.removeItem(`exitzero_runbook_checks_${activeTool}`);
    } catch (e) {}
    if (soundHapticsEnabled) {
      playSoundEffect("click");
      triggerHapticFeedback("light");
    }
  };

  // Active runbook
  const activeRunbook = runbooks[activeTool];

  const verifiedCount = useMemo(() => {
    if (!activeRunbook) return 0;
    return activeRunbook.commands.filter((c) => checkedSteps[`${activeTool}-${c.id}`]).length;
  }, [activeRunbook, activeTool, checkedSteps]);

  const progressPct = useMemo(() => {
    if (!activeRunbook || activeRunbook.commands.length === 0) return 0;
    return Math.round((verifiedCount / activeRunbook.commands.length) * 100);
  }, [activeRunbook, verifiedCount]);

  // Auto-select the first command when switching tools
  useEffect(() => {
    if (activeRunbook && activeRunbook.commands.length > 0) {
      // Find the first command ID
      const firstId = activeRunbook.commands[0].id;
      setSelectedCommandId(firstId);
      setRevealAnswer(false);
      setIsMobileDetailOpen(false);
    }
  }, [activeTool]);

  // Extract all unique tags for the active runbook
  const uniqueTags = useMemo(() => {
    if (!activeRunbook) return [];
    const tags = new Set<string>();
    activeRunbook.commands.forEach((cmd) => {
      cmd.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [activeRunbook]);

  // Filtered commands list
  const filteredCommands = useMemo(() => {
    if (!activeRunbook) return [];
    return activeRunbook.commands.filter((cmd) => {
      const matchesSearch =
        cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDifficulty =
        selectedDifficulty === "All" || cmd.difficulty === selectedDifficulty;

      const matchesTag =
        selectedTag === "All" || cmd.tags.includes(selectedTag);

      return matchesSearch && matchesDifficulty && matchesTag;
    });
  }, [activeRunbook, searchQuery, selectedDifficulty, selectedTag]);

  // Active selected command object
  const activeCommand = useMemo(() => {
    if (!activeRunbook) return null;
    return (
      activeRunbook.commands.find((cmd) => cmd.id === selectedCommandId) ||
      activeRunbook.commands[0] ||
      null
    );
  }, [activeRunbook, selectedCommandId]);

  // Helper to get tool icons
  const getToolIcon = (tool: string, className = "w-5 h-5") => {
    switch (tool) {
      case "linux":
        return <Cpu className={className} />;
      case "git":
        return <GitBranch className={className} />;
      case "networking":
        return <Network className={className} />;
      case "docker":
        return <Layers className={className} />;
      case "kubernetes":
        return <Compass className={className} />;
      case "terraform":
        return <FileCode className={className} />;
      default:
        return <Terminal className={className} />;
    }
  };

  // Toggle accordion section
  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    if (soundHapticsEnabled) {
      playSoundEffect("click");
      triggerHapticFeedback("light");
    }
  };

  // Copy to clipboard helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    if (soundHapticsEnabled) {
      playSoundEffect("click");
      triggerHapticFeedback("light");
    }
    setTimeout(() => {
      setCopiedTextId(null);
    }, 2000);
  };

  // Reveal flashcard helper
  const handleRevealAnswer = () => {
    setRevealAnswer(true);
    if (soundHapticsEnabled) {
      playSoundEffect("success");
      triggerHapticFeedback("medium");
    }
  };

  // Handle command click in list
  const handleSelectCommand = (id: number) => {
    setSelectedCommandId(id);
    setRevealAnswer(false);
    setIsMobileDetailOpen(true);
    if (soundHapticsEnabled) {
      playSoundEffect("click");
      triggerHapticFeedback("light");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
      {/* Top Navigation - Tool Selector bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between shrink-0 overflow-x-auto select-none no-scrollbar">
        <div className="flex space-x-1.5 min-w-max">
          {Object.keys(runbooks).map((toolKey) => {
            const isActive = activeTool === toolKey;
            const book = runbooks[toolKey];
            return (
              <button
                key={toolKey}
                onClick={() => {
                  setActiveTool(toolKey);
                  setSelectedTag("All");
                  setSelectedDifficulty("All");
                  if (soundHapticsEnabled) {
                    playSoundEffect("click");
                    triggerHapticFeedback("light");
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#2563eb]/10 border-[#2563eb] text-[#2563eb] shadow-xs"
                    : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {getToolIcon(toolKey, "w-4 h-4")}
                <span className="capitalize">{toolKey}</span>
                <span className="text-[9px] opacity-60 border border-current/20 rounded px-1">
                  v{book.version}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container: Split screen on Desktop, dynamic single pane on Mobile */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Filter and Command List */}
        <div
          className={`w-full md:w-[360px] border-r border-border flex flex-col bg-card/25 shrink-0 ${
            isMobileDetailOpen ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Filter Options */}
          <div className="p-3 border-b border-border space-y-2.5 bg-card/50">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search ${activeTool} commands...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-[#2563eb] transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center justify-between gap-2 text-[10px] font-bold font-mono text-muted-foreground">
              <div className="flex items-center space-x-1">
                <SlidersHorizontal className="w-3 h-3 text-[#2563eb]" />
                <span>FILTERS</span>
              </div>
              <div className="flex space-x-1">
                {/* Difficulty Select */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-background border border-border rounded px-1.5 py-0.5 text-[9px] font-bold outline-hidden focus:border-[#2563eb] cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                {/* Tag Select */}
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-background border border-border rounded px-1.5 py-0.5 text-[9px] font-bold max-w-[100px] outline-hidden focus:border-[#2563eb] cursor-pointer"
                >
                  <option value="All">All Tags</option>
                  {uniqueTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checklist Progress Bar */}
            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-[#00E676]" />
                    <span>Triage Progress</span>
                  </span>
                  <span className="font-bold text-foreground">
                    {verifiedCount}/{activeRunbook?.commands.length || 0} ({progressPct}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-[#00E676] to-[#A3FF1A] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
              {verifiedCount > 0 && (
                <button
                  onClick={resetChecks}
                  className="text-[9px] font-mono text-muted-foreground hover:text-rose-400 transition-colors px-1.5 py-0.5 rounded border border-border shrink-0 cursor-pointer"
                  title="Reset all verified steps for this runbook"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Commands List Scroll */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd) => {
                const isSelected = selectedCommandId === cmd.id;
                const isChecked = !!checkedSteps[`${activeTool}-${cmd.id}`];

                return (
                  <div
                    key={cmd.id}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col space-y-1.5 ${
                      isSelected
                        ? "bg-card border-[#2563eb] shadow-sm relative before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-[#2563eb] before:rounded-r"
                        : isChecked
                        ? "bg-[#00E676]/5 border-[#00E676]/30 hover:border-[#00E676]/50"
                        : "bg-transparent border-transparent hover:bg-card/40 hover:border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStepCheck(cmd.id);
                          }}
                          className="text-muted-foreground hover:text-[#00E676] transition-colors shrink-0 p-0.5 cursor-pointer"
                          title={isChecked ? "Mark unverified" : "Mark verified"}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-[#00E676] fill-[#00E676]/20" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground/60 hover:text-[#00E676]" />
                          )}
                        </button>
                        <h4
                          onClick={() => handleSelectCommand(cmd.id)}
                          className={`text-xs font-bold leading-snug line-clamp-1 font-mono cursor-pointer flex-1 ${
                            isChecked ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {cmd.title}
                        </h4>
                      </div>
                      <span
                        className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 border rounded shrink-0 ${
                          cmd.difficulty === "Easy"
                            ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                            : cmd.difficulty === "Medium"
                            ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                            : "border-rose-500/30 text-rose-500 bg-rose-500/5"
                        }`}
                      >
                        {cmd.difficulty}
                      </span>
                    </div>

                    <div
                      onClick={() => handleSelectCommand(cmd.id)}
                      className="flex items-center space-x-1.5 bg-slate-950/60 border border-slate-900 rounded-md py-1 px-2 font-mono text-[10px] text-slate-300 select-all leading-none overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                    >
                      <span className="text-slate-600 select-none">$</span>
                      <span className="truncate">{cmd.command}</span>
                    </div>

                    <p
                      onClick={() => handleSelectCommand(cmd.id)}
                      className="text-[10px] text-muted-foreground line-clamp-1 cursor-pointer"
                    >
                      {cmd.summary}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                No matching commands found.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Command Details */}
        <div
          className={`flex-1 flex flex-col h-full bg-background overflow-hidden ${
            isMobileDetailOpen ? "flex" : "hidden md:flex"
          }`}
        >
          {activeCommand ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Detail Header (with back button on Mobile) */}
              <div className="border-b border-border bg-card/30 px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <button
                    onClick={() => setIsMobileDetailOpen(false)}
                    className="md:hidden p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-[#2563eb] font-bold uppercase tracking-wider">
                      <span>{activeTool} runbook</span>
                      <span>&bull;</span>
                      <span>CMD #{activeCommand.id}</span>
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-foreground truncate leading-normal">
                      {activeCommand.title}
                    </h3>
                  </div>
                </div>

                {/* Actions & Metrics */}
                <div className="flex items-center space-x-2 shrink-0">
                  {/* Step Verified Toggle Button */}
                  <button
                    onClick={() => toggleStepCheck(activeCommand.id)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      checkedSteps[`${activeTool}-${activeCommand.id}`]
                        ? "bg-[#00E676]/15 border-[#00E676] text-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.2)]"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-[#00E676]/50"
                    }`}
                    title="Toggle step verification"
                  >
                    {checkedSteps[`${activeTool}-${activeCommand.id}`] ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Verify Step</span>
                      </>
                    )}
                  </button>

                  {/* Score / Metrics indicator */}
                  <div className="hidden sm:flex items-center space-x-1.5 font-mono text-[9px] shrink-0 border border-border rounded-lg bg-card/60 px-2.5 py-1">
                    <span className="text-muted-foreground">Importance:</span>
                    <span className="font-bold text-[#2563eb]">{activeCommand.importance}/10</span>
                    <span className="text-muted-foreground font-light px-0.5">|</span>
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-bold text-foreground">{activeCommand.frequency}</span>
                  </div>
                </div>
              </div>

              {/* Scrollable details view */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 custom-scrollbar">
                {/* Main Command Console Card */}
                <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-xl flex flex-col font-mono text-xs text-slate-300">
                  {/* Console Title bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-900/60 select-none">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-[#2563eb]" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        terminal
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyText(activeCommand.command, "main-cmd")}
                      className="text-[10px] font-bold text-slate-400 hover:text-foreground flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      {copiedTextId === "main-cmd" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Console Code Block */}
                  <div className="p-4 leading-relaxed bg-black/40 overflow-x-auto text-[11px] font-bold text-slate-100 flex items-start space-x-2 select-all">
                    <span className="text-[#2563eb] select-none">$</span>
                    <span>{activeCommand.command}</span>
                  </div>

                  {/* Syntax details if available */}
                  <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-900/60 flex flex-wrap gap-2 text-[10px] leading-relaxed text-slate-400 select-text">
                    <span className="font-bold text-[#2563eb]">SYNTAX:</span>
                    <span>{activeCommand.syntax}</span>
                  </div>
                </div>

                {/* Problem & Summary blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border border-border p-4 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-rose-500">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider">
                        The Problem
                      </span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">
                      {activeCommand.problem}
                    </p>
                  </div>

                  <div className="bg-card border border-border p-4 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[#2563eb]">
                      <Info className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider">
                        Why this command
                      </span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed font-sans">
                      {activeCommand.why_this_command}
                    </p>
                  </div>
                </div>

                {/* Interactive Accordion Sections */}
                <div className="space-y-3.5">
                  {/* Section 1: Diagnostics & Thinking Process */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
                    <button
                      onClick={() => toggleSection("diagnostics")}
                      className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 font-bold font-mono text-xs text-foreground cursor-pointer"
                    >
                      <span className="flex items-center space-x-2">
                        <Cpu className="w-4 h-4 text-[#2563eb]" />
                        <span>1. DIAGNOSTICS & THINKING PROCESS</span>
                      </span>
                      {openSections.diagnostics ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {openSections.diagnostics && (
                      <div className="p-4 border-t border-border space-y-4 animate-in slide-in-from-top-1 duration-200">
                        {/* Thinking Steps */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                            Outage Thinking Process
                          </span>
                          <ol className="space-y-2.5 text-xs text-foreground list-none pl-0">
                            {activeCommand.thinking_process.map((step, idx) => (
                              <li key={idx} className="flex items-start space-x-2.5">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#2563eb]/10 border border-[#2563eb]/30 text-[#2563eb] text-[10px] font-bold shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="leading-relaxed pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Expected Output & Interpretation */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
                    <button
                      onClick={() => toggleSection("execution")}
                      className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 font-bold font-mono text-xs text-foreground cursor-pointer"
                    >
                      <span className="flex items-center space-x-2">
                        <Terminal className="w-4 h-4 text-emerald-500" />
                        <span>2. EXPECTED OUTPUT & INTERPRETATION</span>
                      </span>
                      {openSections.execution ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {openSections.execution && (
                      <div className="p-4 border-t border-border space-y-4 animate-in slide-in-from-top-1 duration-200">
                        {/* Expected Output console box */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                            Expected Output Example
                          </span>
                          <div className="bg-slate-950 border border-slate-900 rounded-lg p-3.5 font-mono text-[10px] text-slate-300 whitespace-pre-wrap select-text leading-relaxed">
                            {activeCommand.expected_output}
                          </div>
                        </div>

                        {/* How to interpret */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                            Metrics Interpretation
                          </span>
                          <p className="text-xs text-foreground leading-relaxed">
                            {activeCommand.how_to_interpret_output}
                          </p>
                        </div>

                        {/* Pre & Post flight checks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                              Pre-Check Verification
                            </span>
                            <ul className="space-y-1 text-xs text-foreground list-disc pl-4 leading-relaxed">
                              {activeCommand.what_to_check_before.map((check, idx) => (
                                <li key={idx}>{check}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold font-mono text-[#2563eb] uppercase tracking-wider block">
                              Post-Check Evaluation
                            </span>
                            <ul className="space-y-1 text-xs text-foreground list-disc pl-4 leading-relaxed">
                              {activeCommand.what_to_check_after.map((check, idx) => (
                                <li key={idx}>{check}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Incident Log & Pro Tips */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
                    <button
                      onClick={() => toggleSection("recovery")}
                      className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 font-bold font-mono text-xs text-foreground cursor-pointer"
                    >
                      <span className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>3. ON-CALL OUTAGES & PLAYBOOK LESSONS</span>
                      </span>
                      {openSections.recovery ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {openSections.recovery && (
                      <div className="p-4 border-t border-border space-y-4 animate-in slide-in-from-top-1 duration-200">
                        {/* Real world incidents */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold font-mono text-rose-500 uppercase tracking-wider block">
                            Real-World Incidents (Resolved)
                          </span>
                          <div className="space-y-2">
                            {activeCommand.real_world_incidents.map((incident, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-xs leading-relaxed flex items-start space-x-2"
                              >
                                <span className="font-bold text-rose-500 shrink-0 font-mono">
                                  #{idx + 1}:
                                </span>
                                <span>{incident}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Common Mistakes & Best Practices */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold font-mono text-amber-500 uppercase tracking-wider block">
                              Common Pitfalls
                            </span>
                            <ul className="space-y-1 text-xs text-foreground list-disc pl-4 leading-relaxed">
                              {activeCommand.common_mistakes.map((mistake, idx) => (
                                <li key={idx} className="text-amber-500/90">{mistake}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-bold font-mono text-emerald-500 uppercase tracking-wider block">
                              Best Practices
                            </span>
                            <ul className="space-y-1 text-xs text-foreground list-disc pl-4 leading-relaxed">
                              {activeCommand.best_practices.map((bp, idx) => (
                                <li key={idx} className="text-emerald-500/90">{bp}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Related Commands */}
                        {activeCommand.related_commands && activeCommand.related_commands.length > 0 && (
                          <div className="space-y-1.5 pt-3 border-t border-border/60">
                            <span className="text-[9px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                              Related Runbook Commands
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {activeCommand.related_commands.map((relName) => {
                                // Try to find matching command in current runbook
                                const relCmd = activeRunbook.commands.find(
                                  (c) => c.command.toLowerCase().includes(relName.toLowerCase()) || 
                                         c.title.toLowerCase().includes(relName.toLowerCase())
                                );
                                return (
                                  <button
                                    key={relName}
                                    onClick={() => {
                                      if (relCmd) {
                                        handleSelectCommand(relCmd.id);
                                      } else {
                                        setSearchQuery(relName);
                                      }
                                    }}
                                    className="px-2 py-1 rounded bg-muted hover:bg-muted/75 border border-border text-[9px] font-bold font-mono cursor-pointer transition-colors"
                                  >
                                    {relName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 4: Self-Interview Flashcard */}
                  <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
                    <button
                      onClick={() => toggleSection("interview")}
                      className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 font-bold font-mono text-xs text-foreground cursor-pointer"
                    >
                      <span className="flex items-center space-x-2">
                        <HelpCircle className="w-4 h-4 text-purple-500" />
                        <span>4. ON-CALL INTERVIEW PREP CHIP</span>
                      </span>
                      {openSections.interview ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {openSections.interview && (
                      <div className="p-4 border-t border-border space-y-4 animate-in slide-in-from-top-1 duration-200">
                        {/* Interview question block */}
                        <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl space-y-3">
                          <div className="flex items-start space-x-2">
                            <Lightbulb className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                            <h5 className="text-xs font-bold text-foreground leading-normal font-sans">
                              {activeCommand.interview_question}
                            </h5>
                          </div>

                          {/* Reveal area */}
                          {revealAnswer ? (
                            <div className="pt-3 border-t border-purple-500/20 text-xs leading-relaxed text-foreground animate-in fade-in duration-300">
                              <span className="text-[9px] font-bold font-mono text-purple-500 uppercase tracking-wider block mb-1">
                                Interview Answer Summary
                              </span>
                              {activeCommand.interview_answer}
                            </div>
                          ) : (
                            <div className="pt-2 flex justify-center">
                              <button
                                onClick={handleRevealAnswer}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold font-mono flex items-center space-x-1.5 cursor-pointer shadow-md active:scale-98 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Reveal Interview Answer</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground font-mono">
              Select a command from the list to view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
