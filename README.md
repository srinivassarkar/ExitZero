<p align="center">
  <img src="./public/banner.png" alt="ExitZero Banner" width="100%">
</p>

# ExitZero 💻

> **`$ exit 0` — Premium DevOps Learning Platform & Operational Playbooks.**

ExitZero is a developer-native, high-performance study console and troubleshooting reference for DevOps engineers. Designed to feel like GitHub, VS Code, and Warp Terminal.

[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-00E676?style=flat-square&logo=github)](https://srinivassarkar.github.io/ExitZero)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-00C8FF?style=flat-square&logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Ready-00E676?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-f1f5f9?style=flat-square)

---

## Workspaces

ExitZero is structured into three clean, developer-native modules:

### 1. 🗂️ Interview Prep
- **Spaced Repetition (SM-2)**: Smart review queues sorted by recall strength and study state.
- **6 Curated Topics**: Docker, Kubernetes, AWS, Terraform, Jenkins, and DevOps (600+ questions).
- **Study Customizations**: Auto-reveal answers, difficulty gating exclusions (Easy/Medium/Hard), and auto-advance timers.

### 2. 📓 Operational Runbooks
- **On-Call Playbooks**: Diagnostic troubleshooting references for Linux, Git, Networking, Docker, Kubernetes, and Terraform.
- **Interactive Console**: Dual-pane command browser with copy-to-clipboard audio/haptic clicks, syntax schemas, and self-test flashcards.
- **Diagnostics Logs**: Chronological thinking process logs, expected terminal output strings, and real-world outage post-mortems.

### 3. 🛡️ Incident Labs
- **Outage Quiz**: Snappy, multiple-choice incident sandbox. Analyze live metrics, query traces, and select recovery hotfixes on a virtual terminal.

---

## Engineering Features

- **Audio Synthesis Engine**: Zero-dependency Web Audio synthesizer. Generates pure chime and click tones dynamically without loading external MP3 files.
- **Native Haptic Pulses**: Mobile-responsive haptic vibrations on question reviews, code copies, and answer reveals.
- **Offline PWA Engine**: Custom Service Worker caching lifecycle with standalone offline support.
- **State Persistence**: Secure, client-only local storage state tracking. No tracking or database logins.

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/srinivassarkar/ExitZero.git
cd ExitZero

# Install packages
npm install

# Run dev server
npm run dev

# Compile static release export
npm run build
```

Static output compiles to `/out` — optimized for zero-latency hosting.

---

## Design Specifications
- **Typography**: **Inter** (Body text & readouts) & **JetBrains Mono** (System headers & console logs).
- **Theme**: High-contrast, dark-first workbench palette (`#0B0F14` Background, `#151B23` Surface, `#00E676` Brand green, `#26303C` Borders).
- **UI Elements**: Flat minimal cards (12px rounded), high-contrast hover states, and thin progress indicators.

---

<p align="center">Built by <a href="https://github.com/srinivassarkar">srinivassarkar</a> &nbsp;·&nbsp; <code>$ exit 0</code></p>
