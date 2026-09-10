"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldAlert,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Copy,
  Check,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  Clock,
  Activity,
  Cpu,
  Server,
  Lock,
  Compass
} from "lucide-react";
import { incidentScenarios, IncidentScenario, TriageOption } from "@/data/incidentsData";
import { playSoundEffect, triggerHapticFeedback } from "@/utils/audio";

interface IncidentLabsViewProps {
  soundHapticsEnabled?: boolean;
}

export function IncidentLabsView({ soundHapticsEnabled = true }: IncidentLabsViewProps) {
  // Category Filter: "all" | "kubernetes" | "linux" | "database" | "aws" | "networking" | "terraform"
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeIncidentId, setActiveIncidentId] = useState<string>(incidentScenarios[0].id);

  // Solved tracking stored in localStorage
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Load resolved incidents from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("exitzero_incident_labs_resolved");
      if (saved) {
        setResolvedIds(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Filter scenarios by category
  const filteredScenarios = useMemo(() => {
    if (selectedCategory === "all") return incidentScenarios;
    return incidentScenarios.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  // Active scenario object
  const activeScenario = useMemo(() => {
    return (
      incidentScenarios.find((s) => s.id === activeIncidentId) ||
      filteredScenarios[0] ||
      incidentScenarios[0]
    );
  }, [activeIncidentId, filteredScenarios]);

  // Reset selected option when switching incidents
  useEffect(() => {
    setSelectedOptionId(null);
    setIsEvaluating(false);
  }, [activeIncidentId]);

  // Selected Option object
  const chosenOption = useMemo(() => {
    if (!selectedOptionId) return null;
    return activeScenario.options.find((o) => o.id === selectedOptionId) || null;
  }, [selectedOptionId, activeScenario]);

  // Handle Triage Option Click
  const handleSelectOption = (option: TriageOption) => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setSelectedOptionId(option.id);

    if (soundHapticsEnabled) {
      playSoundEffect("click");
      triggerHapticFeedback("light");
    }

    setTimeout(() => {
      setIsEvaluating(false);
      if (option.isCorrect) {
        if (!resolvedIds.includes(activeScenario.id)) {
          const updated = [...resolvedIds, activeScenario.id];
          setResolvedIds(updated);
          try {
            localStorage.setItem("exitzero_incident_labs_resolved", JSON.stringify(updated));
          } catch (e) {}
        }
        if (soundHapticsEnabled) {
          playSoundEffect("success");
          triggerHapticFeedback("medium");
        }
      } else {
        if (soundHapticsEnabled) {
          playSoundEffect("warning");
          triggerHapticFeedback("heavy");
        }
      }
    }, 600);
  };

  // Move to next incident
  const handleNextIncident = () => {
    const currentIndex = incidentScenarios.findIndex((s) => s.id === activeScenario.id);
    const nextIndex = (currentIndex + 1) % incidentScenarios.length;
    setActiveIncidentId(incidentScenarios[nextIndex].id);
    if (soundHapticsEnabled) {
      playSoundEffect("click");
      triggerHapticFeedback("light");
    }
  };

  // Reset all incident progress
  const handleResetProgress = () => {
    setResolvedIds([]);
    setSelectedOptionId(null);
    try {
      localStorage.removeItem("exitzero_incident_labs_resolved");
    } catch (e) {}
    if (soundHapticsEnabled) {
      playSoundEffect("click");
      triggerHapticFeedback("light");
    }
  };

  // Copy command helper
  const handleCopyCommand = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    if (soundHapticsEnabled) {
      playSoundEffect("click");
      triggerHapticFeedback("light");
    }
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isCurrentResolved = resolvedIds.includes(activeScenario.id);

  return (
    <div className="flex-1 overflow-y-auto bg-background text-foreground flex flex-col min-h-0">
      <div className="max-w-5xl mx-auto w-full px-4 py-5 md:py-8 space-y-6">
        
        {/* Apple-style Top Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span>On-Call Triage Simulator</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">v1.0 Production</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-foreground flex items-center space-x-2">
              <span>Incident Labs</span>
              <span className="text-[#00E676] text-xl">&bull;</span>
              <span className="text-sm sm:text-base font-normal text-muted-foreground">
                Live SRE Outage Simulations
              </span>
            </h1>
          </div>

          {/* Progress Pill & Reset */}
          <div className="flex items-center space-x-3 self-start md:self-center">
            <div className="px-3 py-1.5 rounded-xl border border-border bg-card/60 backdrop-blur-md flex items-center space-x-2.5 shadow-xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono uppercase text-muted-foreground font-bold">
                  Mitigation Score
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold text-foreground">
                  <span className="text-[#00E676]">{resolvedIds.length}</span> / {incidentScenarios.length} Solved
                </span>
              </div>
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00E676] to-[#00C8FF] transition-all duration-500 rounded-full"
                  style={{ width: `${(resolvedIds.length / incidentScenarios.length) * 100}%` }}
                />
              </div>
            </div>

            {resolvedIds.length > 0 && (
              <button
                onClick={handleResetProgress}
                title="Reset completed incident progress"
                className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 select-none">
          {[
            { id: "all", label: "All Outages", count: incidentScenarios.length },
            { id: "kubernetes", label: "Kubernetes", count: incidentScenarios.filter((s) => s.category === "kubernetes").length },
            { id: "linux", label: "Linux & OS", count: incidentScenarios.filter((s) => s.category === "linux").length },
            { id: "database", label: "Databases", count: incidentScenarios.filter((s) => s.category === "database").length },
            { id: "aws", label: "AWS & IAM", count: incidentScenarios.filter((s) => s.category === "aws").length },
            { id: "networking", label: "Networking", count: incidentScenarios.filter((s) => s.category === "networking").length },
            { id: "terraform", label: "Terraform", count: incidentScenarios.filter((s) => s.category === "terraform").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center space-x-1.5 ${
                selectedCategory === tab.id
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Incident Scenarios Horizontal Carousel / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredScenarios.map((scenario) => {
            const isSelected = scenario.id === activeScenario.id;
            const isResolved = resolvedIds.includes(scenario.id);

            return (
              <button
                key={scenario.id}
                onClick={() => setActiveIncidentId(scenario.id)}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer relative group ${
                  isSelected
                    ? "bg-card border-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.12)] ring-1 ring-[#00E676]/50"
                    : "bg-card/60 hover:bg-card border-border hover:border-border/80"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                          scenario.severity === "SEV-1"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {scenario.severity}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {scenario.categoryLabel}
                      </span>
                    </div>

                    {isResolved ? (
                      <span className="flex items-center space-x-1 text-[10px] font-mono font-bold text-[#00E676]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mitigated</span>
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold font-mono text-foreground line-clamp-2 leading-snug">
                    {scenario.title}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>svc: {scenario.service}</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{scenario.mttrTarget}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ACTIVE INCIDENT TRIAGE WORKSPACE */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 transition-all duration-300">
          
          {/* PagerDuty Incident Alert Header */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-mono font-black text-rose-400 uppercase tracking-wider">
                  {activeScenario.severity} Triggered: {activeScenario.service}
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                Target MTTR: <strong className="text-foreground">{activeScenario.mttrTarget}</strong>
              </span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-foreground font-semibold">
              {activeScenario.pagerDutyAlert}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeScenario.symptomSummary}
            </p>
          </div>

          {/* Apple-style macOS Diagnostic Terminal */}
          <div className="bg-[#0B0F14] border border-[#26303C] rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
            {/* Window Top Bar */}
            <div className="px-4 py-2.5 bg-[#151B23] border-b border-[#26303C] flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                <span className="ml-2 text-[11px] text-[#7D8590] font-bold">
                  sre-oncall@exit0-prod:~ telemetry --inspect
                </span>
              </div>
              <span className="text-[10px] text-[#00E676] font-bold uppercase tracking-wider">
                LIVE TERMINAL
              </span>
            </div>

            {/* Terminal Body with Telemetry Logs */}
            <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto bg-black/60">
              {activeScenario.telemetryLogs.map((log, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[#00E676] text-xs">
                    <span className="flex items-center space-x-1.5">
                      <span className="text-[#7D8590]">$</span>
                      <strong className="text-[#E6EDF3]">{log.command}</strong>
                    </span>
                    <button
                      onClick={() => handleCopyCommand(log.command, idx)}
                      className="p-1 text-[#7D8590] hover:text-[#E6EDF3] transition-colors cursor-pointer"
                      title="Copy command"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-[#00E676]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] sm:text-xs text-[#7D8590] bg-[#0B0F14]/80 p-3 rounded-lg border border-[#26303C] overflow-x-auto whitespace-pre font-mono leading-relaxed">
                    {log.output}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Triage Action Options (4 Apple-styled Interactive Cards) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Select Triage Hotfix Action</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                Choose the correct SRE mitigation
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {activeScenario.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const showSuccess = isSelected && !isEvaluating && option.isCorrect;
                const showError = isSelected && !isEvaluating && !option.isCorrect;

                return (
                  <button
                    key={option.id}
                    disabled={isEvaluating}
                    onClick={() => handleSelectOption(option)}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left flex items-start space-x-3.5 transition-all duration-150 cursor-pointer ${
                      showSuccess
                        ? "bg-[#00E676]/10 border-[#00E676] text-foreground shadow-[0_0_12px_rgba(0,230,118,0.2)]"
                        : showError
                        ? "bg-rose-500/10 border-rose-500 text-foreground"
                        : isSelected
                        ? "bg-muted border-foreground/50"
                        : "bg-card hover:bg-muted/50 border-border hover:border-foreground/20 text-foreground"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 mt-0.5 border ${
                        showSuccess
                          ? "bg-[#00E676] text-[#0B0F14] border-[#00E676]"
                          : showError
                          ? "bg-rose-500 text-white border-rose-500"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {option.id}
                    </span>
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-mono leading-relaxed">
                        {option.action}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIMULATED OUTCOME TERMINAL DISPLAY */}
          {chosenOption && !isEvaluating && (
            <div
              className={`p-4 sm:p-5 rounded-xl border space-y-4 animate-in fade-in slide-in-from-top-3 duration-200 ${
                chosenOption.isCorrect
                  ? "bg-[#00E676]/5 border-[#00E676]/30 shadow-lg"
                  : "bg-rose-500/5 border-rose-500/30"
              }`}
            >
              {/* Outcome Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {chosenOption.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00E676]" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  )}
                  <h4
                    className={`text-sm font-bold font-mono ${
                      chosenOption.isCorrect ? "text-[#00E676]" : "text-rose-400"
                    }`}
                  >
                    {chosenOption.isCorrect
                      ? "INCIDENT MITIGATED — SERVICE FULLY RESTORED"
                      : "TRIAGE FAILED — INCIDENT ESCALATED TO VP OF ENG"}
                  </h4>
                </div>
                {chosenOption.isCorrect && (
                  <button
                    onClick={handleNextIncident}
                    className="px-3 py-1.5 rounded-lg bg-[#00E676] text-[#0B0F14] font-mono font-bold text-xs flex items-center space-x-1.5 transition-all hover:opacity-90 shadow-md cursor-pointer"
                  >
                    <span>Next Incident</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Terminal Simulation Result */}
              <div className="p-3 bg-[#0B0F14] border border-[#26303C] rounded-lg font-mono text-xs text-[#E6EDF3] leading-relaxed whitespace-pre-wrap">
                {chosenOption.terminalResult}
              </div>

              {/* Triage Critique */}
              <div className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Analysis: </strong>
                {chosenOption.explanation}
              </div>

              {/* POST-MORTEM & ROOT CAUSE SECTION (Unlocked upon correct triage) */}
              {chosenOption.isCorrect && (
                <div className="pt-4 border-t border-[#00E676]/20 space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00E676] block">
                    📋 Root Cause & Architectural Prevention
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-card/80 border border-border space-y-1">
                      <span className="font-mono font-bold text-foreground block">
                        Root Cause (5-Whys):
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        {activeScenario.rootCause}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-card/80 border border-border space-y-1">
                      <span className="font-mono font-bold text-foreground block">
                        Prevention Policy / Rule:
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        {activeScenario.preventionRule}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#00C8FF]/10 border border-[#00C8FF]/30 text-xs font-mono space-y-1">
                    <span className="font-bold text-[#00C8FF] block">
                      💡 SRE Interview Talking Point:
                    </span>
                    <p className="text-foreground/90 leading-relaxed">
                      {activeScenario.interviewTakeaway}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
