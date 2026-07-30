"use client";

import React from "react";
import { BookOpen, Cpu, ShieldCheck, CheckSquare, ExternalLink } from "lucide-react";

export function RunbooksView() {
  const mockRunbooks = [
    {
      title: "Kubernetes Cluster Control Plane Upgrades",
      difficulty: "Hard",
      category: "K8s Operations",
      description: "Step-by-step procedures to safely upgrade control plane nodes (kube-apiserver, kube-controller-manager) with zero service downtime.",
      steps: [
        "Audit existing API version usage with deprecation checkers.",
        "Upgrade kubeadm and control plane on the primary node.",
        "Drain and upgrade worker nodes sequentially.",
        "Validate service endpoints and pod distribution budgets."
      ]
    },
    {
      title: "Private Docker Registry Setup & TLS Authentication",
      difficulty: "Medium",
      category: "Docker Security",
      description: "Provision a private registry instance backed by self-signed or Let's Encrypt certificates, secured with basic user credentials.",
      steps: [
        "Generate TLS certificate keys and configure reverse proxy.",
        "Run registry:2 container with volume mappings.",
        "Configure Docker daemon insecures registry registries.",
        "Authenticate and test push/pull image cycles."
      ]
    },
    {
      title: "AWS IAM Policy Audit & Privilege Hardening",
      difficulty: "Medium",
      category: "AWS IAM",
      description: "Perform an audit of active wildcard (*) policies across IAM roles and apply the principle of least privilege using Access Analyzer logs.",
      steps: [
        "Scan active credentials using Access Analyzer.",
        "Identify unused actions and wildcard resources.",
        "Generate micro-scoped role policies.",
        "Deploy policy updates via CloudFormation/Terraform dry-runs."
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col space-y-6 bg-background animate-in fade-in duration-300">
      {/* Header section */}
      <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563eb]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-[#2563eb]/10 text-[#2563eb] rounded-lg border border-[#2563eb]/20 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground font-mono">
              Operational Runbooks
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              Standard operating procedures (SOPs), infrastructure configuration guides, and step-by-step checklists to deploy, secure, and validate DevOps architectures.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Runbooks */}
      <div className="grid grid-cols-1 gap-4">
        {mockRunbooks.map((rb, idx) => (
          <div
            key={idx}
            className="p-5 bg-card border border-border rounded-xl hover:border-[#2563eb] transition-all flex flex-col space-y-3.5 group relative"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] font-mono text-[#2563eb] font-semibold uppercase tracking-wider">
                {rb.category}
              </span>
              <span
                className={`px-2 py-0.5 border rounded text-[9px] uppercase font-bold tracking-wide bg-transparent ${
                  rb.difficulty === "Easy"
                    ? "border-[#22c55e] text-[#22c55e]"
                    : "border-amber-500 text-amber-500"
                }`}
              >
                {rb.difficulty}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground group-hover:text-[#2563eb] transition-colors leading-snug">
                {rb.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {rb.description}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 pt-3 border-t border-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block font-mono">
                Procedure Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rb.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start space-x-2 text-xs text-foreground">
                    <CheckSquare className="w-3.5 h-3.5 text-[#22c55e] mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Open / Edit Link */}
            <div className="pt-2 flex justify-end">
              <button
                className="text-[10px] font-bold font-mono text-muted-foreground hover:text-[#22c55e] flex items-center space-x-1 transition-colors cursor-pointer"
                onClick={() => alert("Runbook editor coming soon. Prepare your content to update this view!")}
              >
                <span>Open Runbook</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
