"use client";

import React, { useEffect, useState } from "react";
import { Terminal, ShieldAlert, Cpu, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

export function IncidentLabsView() {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mockLogs = [
      "INITIALIZING INCIDENT QUIZ CORE...",
      "LOADING MULTIPLE-CHOICE OUTAGE DATABASE... OK",
      "SCORING METRICS MAPPER ENGINE... OK",
      "STATUS: INCIDENT MCQ LABS COMING SOON - BUILD v0.9.5-ALPHA",
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < mockLogs.length) {
        setTerminalLogs((prev) => [...prev, `[SYSTEM] ${mockLogs[currentLogIndex]}`]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
      }
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col space-y-6 bg-background animate-in fade-in duration-300">
      {/* Status Alert Panel */}
      <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl md:text-2xl font-bold text-foreground font-mono">
                Incident Labs MCQ
              </h2>
              <span className="text-[9px] font-mono font-bold text-amber-500 border border-amber-500/30 bg-amber-500/10 rounded px-1.5 py-0.5 animate-pulse shrink-0">
                COMING SOON
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Test your system debugging skills through real-world multiple-choice outage scenarios. Analyze server metrics, query logs, traceroutes, and configuration files to identify root causes and deploy correct hotfixes.
            </p>
          </div>
        </div>
      </div>

      {/* Terminal log panel */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-xs text-slate-300">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-900 select-none">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#22c55e]" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              incident_quiz_core.sh
            </span>
          </div>
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 space-y-2 min-h-[180px] leading-relaxed bg-black/40">
          {terminalLogs.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-[#22c55e]/90">
              <span className="text-slate-500 shrink-0 select-none">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
          {mounted && terminalLogs.length === 4 && (
            <div className="flex items-start space-x-2 text-amber-500 animate-pulse mt-4">
              <span className="text-slate-500 shrink-0 select-none">&gt;</span>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-bold">
                INCIDENT LABS MCQ SIMULATOR — CURRENTLY UNDER DEV
              </span>
            </div>
          )}
        </div>
      </div>

      {/* MCQ Feature list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl flex items-start space-x-3">
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg border border-rose-500/20 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
              Outage Post-Mortems
            </h4>
            <p className="text-xs text-muted-foreground leading-normal">
              Read real incident logs and choose correct answers to troubleshoot server memory leaks, connection pools exhaustion, or stale DNS caching.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-start space-x-3">
          <div className="p-2 bg-[#22c55e]/10 text-[#22c55e] rounded-lg border border-[#22c55e]/20 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground font-mono uppercase tracking-wider">
              Mitigation Checklists
            </h4>
            <p className="text-xs text-muted-foreground leading-normal">
              Choose the correct sequence of recovery steps: failover database endpoints, scale up replica sets, or roll back deployment commits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
