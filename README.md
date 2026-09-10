<p align="center">
  <img src="./public/banner.png" alt="ExitZero Banner" width="100%">
</p>

# ExitZero 💻

> **`$ exit 0` — Premium DevOps Study Console & Operational Runbooks.**

ExitZero is a developer-native, high-performance study engine and troubleshooting catalog built for DevOps and Site Reliability Engineers. Styled to feel like GitHub, VS Code, and Warp Terminal.

[![Live Site](https://img.shields.io/badge/Deployed-GitHub%20Pages-00E676?style=flat-square&logo=github)](https://srinivassarkar.github.io/ExitZero)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-00C8FF?style=flat-square&logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Ready-00E676?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-f1f5f9?style=flat-square)

---

## Workspaces

ExitZero is structured into three dedicated workspaces accessible via the sidebar or channel switcher (`T`):

### 1. 🗂️ Interview Prep
* **SM-2 Spaced Repetition**: Adaptive review scheduling based on recall difficulty (`Again`, `Good`, `Easy`) with customizable auto-advance.
* **6 Domains (600+ Questions)**: Comprehensive coverage of Docker, Kubernetes, AWS, Terraform, Jenkins, and Linux/DevOps.
* **Granular Scoping**: Practice individual submodules (e.g., K8s Networking, AWS IAM) or entire domains in an unconstrained queue.
* **Mobile Card Gestures**: Swipe card Left (Next) or Right (Prev) with smooth physics and tactile haptic feedback.
* **Live Queue Counter**: Real-time position tracking (`1 / 100`) directly on the question card.

### 2. 📓 Operational Runbooks
* **6 On-Call Triage Playbooks**:
  * 🐧 **Linux**: Kernel panics, OOM killer, disk/inode exhaustion, zombie reaping.
  * 🔀 **Git**: Reflog forensics, detached HEAD, dangling commits, merge conflict recovery.
  * 🌐 **Network**: DNS failures, socket exhaustion, iptables/nftables, TCP RST triage.
  * 🐳 **Docker**: Daemon hangs, rootfs corruption, bridge exhaustion, cgroup limits.
  * ☸️ **Kubernetes**: CrashLoopBackOff, etcd split-brain, pending pods, webhook timeouts.
  * 📄 **Terraform**: State locks, drift detection, state corruption rollback, untracked imports.
* **Interactive Checklist Console**: Step-by-step triage commands, expected outputs, copy-paste snippets, and checkable diagnostic steps with audio cues and saved progress.

### 3. 🛡️ Incident Labs
* **Real-World Outage Simulator**: 10 production disaster scenarios across K8s, DNS, Kafka, PostgreSQL, Redis, and Linux subsystems.
* **Diagnostic Terminal**: Run simulated commands (`dig`, `kubectl describe`, `dmesg`, `ss`) to inspect real-time outputs and error logs.
* **Live Telemetry HUD**: System metrics display tracking latency spikes, error rate percentages, and CPU/memory saturation.
* **Root Cause Remediation**: Interactive multi-choice troubleshooting with instant validation, detailed post-mortem retrospectives, and mitigation runbooks.

---

## App Flow

```
[ Topic Title / Press 'T' ] ──> Channel Selector (Modal / Mobile Bottom-Sheet)
                                  ├── Target Domain (Docker, K8s, AWS, Jenkins, Linux)
                                  │     ├── Practice Entire Domain
                                  │     └── Specific Subtopic Module
                                  ├── Operational Runbooks (Linux, Git, K8s, Docker, Network, TF)
                                  ├── Incident Labs (10 Interactive Outage Scenarios)
                                  ├── Master Queue (All 600+ Questions)
                                  └── Bookmarked Questions

[ Study Console ] ──────────────> Question Card (Desktop Nav or Mobile Swipe ◄ / ►)
                                  ├── Show/Hide Answer (Syntax highlighted code & terminal blocks)
                                  ├── SM-2 Review (Again / Good / Easy) ──> Auto-advances
                                  ├── Timer Mode (60s–180s countdown with auto-reveal)
                                  └── Bookmark Toggle (Saved for fast offline review)

[ Incident Labs Sandbox ] ──────> Outage Incident Workspace
                                  ├── Scenario Brief & Impact Level (P1 / P2 / P3)
                                  ├── Diagnostic CLI Sandbox (Run commands & inspect terminal outputs)
                                  ├── Live Telemetry HUD (Latency, error rate, resource graphs)
                                  └── RCA Remediation (Select fix & review post-mortem analysis)

[ Telemetry & Controls ] ───────> Header / Settings Popover
                                  ├── Streak Tracker (Consecutive study days + best streak)
                                  ├── Daily Study Reminder (Custom notification schedule + test alert)
                                  ├── Difficulty Exclusions (Filter Easy / Medium / Hard)
                                  └── Audio & Haptics Toggle, Theme Switcher (Dark / Light)
```

---

## Key Features & Advantages

* **⚡ Offline-First PWA**: Zero network dependency after initial load. Complete question banks, runbooks, and incident labs operate seamlessly offline or on air-gapped machines.
* **📱 Mobile-First Ergonomics**:
  * **Touch Card Swipes**: Swipe Left for Next question, Right for Previous with haptic feedback.
  * **Bottom-Sheet Drawer**: Native mobile sheet with drag handle and swipe-to-dismiss for quick channel switching.
  * **Overscroll Containment**: Suppresses accidental pull-to-refresh browser reloads during study sessions.
* **🛡️ Incident Labs Outage Engine**: Hands-on triage sandbox replicating high-stakes on-call outages with simulated terminal forensics and post-mortem analysis.
* **🔒 100% Client-Side Privacy**: Zero cloud backend, tracking, or account sign-ups. All SRS ratings, runbook progress, bookmarks, and streaks remain in local browser storage.
* **🔊 Synthesized Audio & Haptics**: Procedural audio generated on the fly via Web Audio API (zero audio file downloads) accompanied by tactile haptic pulses.
* **⌨️ Keyboard-Driven Navigation**:
  * `Space` / `Enter`: Reveal Answer
  * `1` / `2` / `3`: Rate Card (`Again` / `Good` / `Easy`)
  * `←` / `→`: Previous / Next Question
  * `T`: Open Channel Selector Modal
  * `/`: Global Search (Fuzzy search powered by Fuse.js)
  * `Esc`: Close Modals / Return to Console
* **🔔 Smart Study Reminders**: Service Worker push notifications and background heartbeat keep study habits consistent without external notification servers.

---

## Local Development

```bash
# Clone & install
git clone https://github.com/srinivassarkar/ExitZero.git
cd ExitZero
npm install

# Start development server
npm run dev

# Compile static release export (compiles to /out)
npm run build
```

---

## Tech Stack
* **Framework**: Next.js 15 (Static Export / Turbopack)
* **Styling**: Tailwind CSS v4 & Lucide Icons
* **Search**: Fuse.js (Client-side fuzzy search)
* **Audio**: Native Web Audio Synthesizer
* **Typography**: Inter & JetBrains Mono

---

<p align="center">Built by <a href="https://github.com/srinivassarkar">srinivassarkar</a> &nbsp;·&nbsp; <code>$ exit 0</code></p>
