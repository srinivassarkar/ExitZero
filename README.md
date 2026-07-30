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

ExitZero is organized into three clean, developer-native modules:

### 1. 🗂️ Interview Prep
* **Spaced Repetition (SM-2)**: Smart review queues sorted by recall strength and study state.
* **6 Curated Topics**: Docker, Kubernetes, AWS, Terraform, Jenkins, and DevOps (600+ questions).
* **Telemetry**: Auto-reveal answers, difficulty exclusions, progress bars, and custom reminders.

### 2. 📓 Operational Runbooks
* **On-Call Playbooks**: Diagnostic troubleshooting playbooks for Linux, Git, Networking, Docker, Kubernetes, and Terraform.
* **Interactive Explorer**: Dual-pane command browser with copy-to-clipboard audio/haptic click chimes, syntax maps, and review cards.
* **Diagnostics Flow**: Ordered thinking process logs, expected terminal output blocks, and real-world incident post-mortems.

### 3. 🛡️ Incident Labs
* **SRE Outage Quiz**: Interactive simulated multiple-choice incident sandbox to run commands and isolate failures in a virtual terminal.

---

## Features & Advantages (Pros)

### ⚡ Lightning-Fast Recall
* **The Pro**: Built around the standard SM-2 algorithm, ensuring you review difficult topics right when you need to, maximizing study efficiency.
* **Snappy Auto-Advance**: The card queue automatically slides to the next question `800ms` after you record a difficulty score, keeping your study momentum flowing.

### 🔊 Dynamic Asset-less Audio & Haptics
* **The Pro**: ExitZero features a custom **Web Audio synthesizer** that generates click ticks and chime waves dynamically in code. The entire app has zero external MP3 asset loads, keeping bundle size microscopic.
* **Interactive Haptics**: Gives physical vibration pulses on copies, bookmark toggles, and answer reveals.

### 📶 Offline-First PWA
* **The Pro**: Built-in service worker caching means you can load and use all playbooks, checklists, and question banks deep in the subway, during a commute, or on-site without any internet connection.

### 🔒 Local Privacy & Zero Backend
* **The Pro**: Your study streak, bookmarks, and SM-2 tracking files reside entirely in your browser's local storage. There are no tracking scripts, database queries, latency, or sign-ups.

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/srinivassarkar/ExitZero.git
cd ExitZero

# Install packages
npm install

# Start local server
npm run dev

# Compile static release export
npm run build
```

Static output compiles to `/out` — optimized for zero-latency hosting.

---

## Theme Specifications
* **Typography**: **Inter** (Body text) & **JetBrains Mono** (System headers & console logs).
* **Theme**: Premium dark-first workbench palette (`#0B0F14` Background, `#151B23` Surface, `#00E676` Brand green, `#26303C` Borders). Includes a **GitHub Light / Xcode Light** mode fallback.
* **UI Elements**: Flat minimal cards (12px rounded), high-contrast hover states, visual scrollbars, and dynamic directory breadcrumbs.

---

<p align="center">Built by <a href="https://github.com/srinivassarkar">srinivassarkar</a> &nbsp;·&nbsp; <code>$ exit 0</code></p>
