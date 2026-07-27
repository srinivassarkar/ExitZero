# ExitZero 💻

> **`$ exit 0` — Interview prep for engineers.**

A DevOps interview prep PWA covering Docker, Kubernetes, AWS, Terraform, Jenkins, and DevOps fundamentals. Study on any device, install it as a mobile app, and use it offline.

[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-22c55e?style=flat-square&logo=github)](https://srinivassarkar.github.io/ExitZero)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![PWA](https://img.shields.io/badge/PWA-Ready-2563eb?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-f1f5f9?style=flat-square)

---

## What is ExitZero?

ExitZero is a progressive web app built for DevOps and cloud engineers preparing for technical interviews. `exit 0` in bash means success — no errors, clean run. That's the goal.

600+ curated questions across 6 topics, organized by category and difficulty. Mark questions as Studying or Mastered, track your progress, and install the app on your phone for offline access during your commute or before an interview.

---

## Topics Covered

| Subject | Questions |
|---|---|
| 🐳 Docker | 100 |
| ☸️ Kubernetes | 100 |
| ☁️ AWS | 100 |
| 🌍 Terraform | 100 |
| 🔧 Jenkins | 180 |
| ⚙️ DevOps | 145 |

---

## Features

- **Study Mode** — Browse questions by topic and category, reveal answers on demand
- **Progress Tracking** — Mark each question as Unmarked / Studying / Mastered
- **Difficulty Levels** — Easy, Medium, and Hard questions per topic
- **Offline Ready** — Full PWA with service worker caching, works without internet
- **Installable** — Add to home screen on Android and iOS, works like a native app
- **Persistent Progress** — All study state saved locally, survives refresh and reinstall
- **Search** — Find any question across all topics instantly
- **Bookmarks** — Save questions to review later

---

## Tech Stack

- **Framework** — Next.js 15 (static export)
- **Styling** — Tailwind CSS
- **Deployment** — GitHub Pages via GitHub Actions
- **PWA** — Service worker, web app manifest, offline cache
- **Data** — Static JSON question bank, no backend required

---

## Running Locally

```bash
git clone https://github.com/srinivassarkar/ExitZero.git
cd ExitZero
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Build for production:**

```bash
npm run build
```

Static output goes to `/out` — ready to deploy anywhere.

---

## Project Structure

```
ExitZero/
├── .github/workflows/    # GitHub Actions CI/CD
├── public/               # Static assets, icons, manifest
├── src/                  # Next.js app source (contains src/data/ static question banks)
├── next.config.ts
└── package.json
```

---

## Deployment

The app is automatically deployed to GitHub Pages on every push to `main` via GitHub Actions. The workflow builds the Next.js static export and pushes to the `gh-pages` branch.

---

## Contributing

Questions, corrections, or new topics — PRs are welcome.

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: your change"`
4. Push and open a PR

---

## License

MIT — free to use, fork, and build on.

---

<p align="center">Built by <a href="https://github.com/srinivassarkar">srinivassarkar</a> &nbsp;·&nbsp; <code>$ exit 0</code></p>
