"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { QuestionViewer } from "@/components/QuestionViewer";
import { SearchDialog } from "@/components/SearchDialog";
import { SavedView } from "@/components/SavedView";
import { RunbooksView } from "@/components/RunbooksView";
import { IncidentLabsView } from "@/components/IncidentLabsView";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { InstallBanner } from "@/components/InstallBanner";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { ChannelSelector, runbooksList } from "@/components/ChannelSelector";
import { rawData, technologies, Question, Category, allQuestions } from "@/data";
import { useStudyState, StudyStatus } from "@/hooks/useStudyState";
import { playSoundEffect, triggerHapticFeedback } from "@/utils/audio";

interface ToastItem {
  id: string;
  message: string;
  duration: number;
}

export default function Home() {
  // Toast Queue State
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, duration = 3) => {
    setToasts((prev) => {
      // Prevent duplicate active toasts
      if (prev.some((t) => t.message === message)) return prev;
      return [...prev, { id: Math.random().toString(), message, duration }];
    });
  };

  // Auto-dismiss toast queue
  useEffect(() => {
    if (toasts.length === 0) return;
    const activeToast = toasts[0];
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== activeToast.id));
    }, activeToast.duration * 1000);
    return () => clearTimeout(timer);
  }, [toasts]);

  // Load study state hook
  const {
    isHydrated,
    bookmarks,
    srsData,
    lastViewed,
    streakCount,
    longestStreak,
    timerMode,
    timerDuration,
    timerAutoAdvance,
    sessionCount,
    installDismissed,
    notifPermission,
    soundHapticsEnabled,
    autoRevealEnabled,
    notificationTime,
    difficultyExclusions,
    toggleBookmark,
    processSRSReview,
    updateLastViewed,
    toggleTimerMode,
    updateTimerDuration,
    toggleTimerAutoAdvance,
    dismissInstallPrompt,
    updateNotifPermission,
    toggleSoundHaptics,
    toggleAutoReveal,
    updateNotificationTime,
    sendTestNotification,
    toggleDifficultyExclusion,
    progress,
  } = useStudyState(addToast);

  // App navigation state
  const [activeTechId, setActiveTechId] = useState("docker");
  const [activeCategoryId, setActiveCategoryId] = useState(1);
  const [activeQuestionId, setActiveQuestionId] = useState(1);
  const [isStudyingSaved, setIsStudyingSaved] = useState(false);
  const [activeRunbookTool, setActiveRunbookTool] = useState("linux");

  // Queue state
  const [activeQueue, setActiveQueue] = useState<Question[]>([]);
  const [activeQueueIndex, setActiveQueueIndex] = useState(0);

  // Modals state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isChannelSelectorOpen, setIsChannelSelectorOpen] = useState(false);
  const [celebrationSubject, setCelebrationSubject] = useState<string | null>(null);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);

  // Keyboard shortcut listener for Channel Selector [$ target --profile]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setIsChannelSelectorOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // PWA install event
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Capture beforeinstallprompt
  useEffect(() => {
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    setIsMobile(/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  // Listen for sw cache completion message
  useEffect(() => {
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "CACHE_COMPLETED") {
        const toastShown = localStorage.getItem("exitzero_cached_toast_shown");
        if (!toastShown) {
          addToast("✓ App cached — works offline now", 3);
          localStorage.setItem("exitzero_cached_toast_shown", "true");
        }
      }
    };
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSWMessage);
    }
    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      }
    };
  }, []);

  // Sync state once local storage hydration finishes
  useEffect(() => {
    if (isHydrated) {
      // Check if they were studying bookmarks last
      if (lastViewed.techId === "saved_study") {
        setIsStudyingSaved(true);
        setActiveTechId("saved");
      } else {
        setIsStudyingSaved(false);
        setActiveTechId(lastViewed.techId);
        setActiveCategoryId(lastViewed.categoryId);
      }
      setActiveQuestionId(lastViewed.questionId);
    }
  }, [isHydrated, lastViewed.techId, lastViewed.categoryId, lastViewed.questionId]);

  // Build the Spaced Repetition queue
  useEffect(() => {
    if (!isHydrated) return;

    let baseQuestions: Question[] = [];

    if (isStudyingSaved) {
      // Queue is just bookmarked questions
      baseQuestions = allQuestions.filter((q) => bookmarks.includes(`${q.technologyId}-${q.id}`));
    } else if (activeTechId === "saved") {
      // In Saved List View, don't build active study queue yet
      setActiveQueue([]);
      return;
    } else if (activeTechId === "all") {
      // All questions across all DevOps domains
      baseQuestions = allQuestions;
    } else {
      // Normal technology flow
      const tech = rawData[activeTechId];
      if (tech) {
        if (activeCategoryId === -1) {
          // Flatten all categories
          baseQuestions = tech.categories.flatMap((c) => c.questions);
        } else {
          const category = tech.categories.find((c) => c.id === activeCategoryId);
          if (category) {
            baseQuestions = category.questions;
          }
        }
      }
    }

    // Filter base questions by difficulty exclusions
    if (difficultyExclusions && difficultyExclusions.length > 0) {
      baseQuestions = baseQuestions.filter((q) => !difficultyExclusions.includes(q.difficulty));
    }

    if (baseQuestions.length === 0) {
      setActiveQueue([]);
      return;
    }

    // Sort according to SM-2 spaced repetition queue order
    const today = new Date();
    const overdue: { q: Question; nextReview: Date }[] = [];
    const unseen: Question[] = [];
    const future: { q: Question; nextReview: Date }[] = [];

    baseQuestions.forEach((q) => {
      const qTechId = isStudyingSaved ? (q as any).technologyId : activeTechId;
      const record = srsData[`${qTechId}-${q.id}`];
      if (!record || record.status === "unseen") {
        unseen.push(q);
      } else {
        const nextDate = new Date(record.nextReview);
        if (nextDate <= today) {
          overdue.push({ q, nextReview: nextDate });
        } else {
          future.push({ q, nextReview: nextDate });
        }
      }
    });

    // Sort overdue: oldest first
    overdue.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
    // Sort future: closest first
    future.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());

    const srsSorted = [
      ...overdue.map((item) => item.q),
      ...unseen.slice(0, 10),
      ...future.map((item) => item.q),
    ];

    setActiveQueue(srsSorted);

    // Find active question index in the new queue
    const idx = srsSorted.findIndex((q) => q.id === activeQuestionId);
    if (idx !== -1) {
      setActiveQueueIndex(idx);
    } else {
      setActiveQueueIndex(0);
      if (srsSorted.length > 0) {
        setActiveQuestionId(srsSorted[0].id);
      }
    }
  }, [isHydrated, activeTechId, activeCategoryId, isStudyingSaved, srsData, bookmarks]);

  // Update active question when index changes
  useEffect(() => {
    if (activeQueue.length > 0 && activeQueue[activeQueueIndex]) {
      const activeQ = activeQueue[activeQueueIndex];
      if (activeQ.id !== activeQuestionId) {
        setActiveQuestionId(activeQ.id);
        updateLastViewed({
          techId: isStudyingSaved ? "saved_study" : activeTechId,
          categoryId: activeCategoryId,
          questionId: activeQ.id,
        });
      }
    }
  }, [activeQueueIndex, activeQueue]);

  // Evaluate Mastery Ring 80% Celebration Overlay
  useEffect(() => {
    if (!isHydrated || activeTechId === "saved" || isStudyingSaved) return;

    const tech = rawData[activeTechId];
    if (!tech) return;

    let total = 0;
    let mastered = 0;

    tech.categories.forEach((cat) => {
      cat.questions.forEach((q) => {
        total++;
        if (progress[`${activeTechId}-${q.id}`] === "mastered") {
          mastered++;
        }
      });
    });

    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;

    if (percent >= 80) {
      const celebratedKey = `exitzero_celebrated_${activeTechId}`;
      const hasCelebrated = localStorage.getItem(celebratedKey);
      if (!hasCelebrated) {
        setCelebrationSubject(tech.technology);
        localStorage.setItem(celebratedKey, "true");
      }
    }
  }, [isHydrated, activeTechId, progress]);

  // Evaluate Notification Sheet
  useEffect(() => {
    if (isHydrated && sessionCount >= 2 && notifPermission === "pending") {
      const timer = setTimeout(() => {
        setShowNotifPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, sessionCount, notifPermission]);

  // Hotkeys (arrows for navigation, / to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        isSearchOpen ||
        celebrationSubject ||
        showNotifPrompt
      ) {
        return;
      }

      if (e.key === "/" || (e.ctrlKey && e.key === "k")) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRandom();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        const activeQ = activeQueue[activeQueueIndex];
        if (activeQ) {
          const qTechId = isStudyingSaved ? (activeQ as any).technologyId : activeTechId;
          toggleBookmark(`${qTechId}-${activeQ.id}`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handlePrev = () => {
    if (activeQueue.length <= 1) return;
    setActiveQueueIndex((prev) => (prev - 1 + activeQueue.length) % activeQueue.length);
  };

  const handleNext = () => {
    if (activeQueue.length <= 1) return;
    setActiveQueueIndex((prev) => (prev + 1) % activeQueue.length);
  };

  const handleRandom = () => {
    if (activeQueue.length <= 1) return;
    let rand = activeQueueIndex;
    while (rand === activeQueueIndex) {
      rand = Math.floor(Math.random() * activeQueue.length);
    }
    setActiveQueueIndex(rand);
  };

  const handleToggleFavorite = () => {
    toggleBookmark(currentQuestionCompositeId);
    if (soundHapticsEnabled) {
      playSoundEffect("click");
      triggerHapticFeedback("light");
    }
  };

  const handleSRSReview = (score: "Again" | "Good" | "Easy") => {
    processSRSReview(currentQuestionCompositeId, score);
    if (soundHapticsEnabled) {
      if (score === "Again") {
        playSoundEffect("warning");
        triggerHapticFeedback("heavy");
      } else {
        playSoundEffect("success");
        triggerHapticFeedback("medium");
      }
    }
    // Snappy auto-advance UX: Flip to next question after 800ms
    if (activeQueue.length > 1) {
      setTimeout(() => {
        handleNext();
      }, 800);
    }
  };

  const handleSelectQuestion = (techId: string, categoryId: number, questionId: number) => {
    setIsStudyingSaved(false);
    setActiveTechId(techId);
    setActiveCategoryId(categoryId);
    setActiveQuestionId(questionId);
    updateLastViewed({ techId, categoryId, questionId });
  };

  const handleSelectChannel = (
    type: "tech" | "all" | "saved" | "runbooks" | "incident_labs",
    techId?: string,
    categoryId: number = -1,
    runbookKey?: string
  ) => {
    setIsChannelSelectorOpen(false);

    if (type === "all") {
      setIsStudyingSaved(false);
      setActiveTechId("all");
      setActiveCategoryId(-1);
      const firstQ = allQuestions[0];
      if (firstQ) setActiveQuestionId(firstQ.id);
      addToast("Switched channel to ALL DevOps questions", 2);
    } else if (type === "saved") {
      setIsStudyingSaved(true);
      setActiveTechId("saved");
      addToast("Switched channel to Saved Bookmarks", 2);
    } else if (type === "runbooks") {
      setIsStudyingSaved(false);
      setActiveTechId("runbooks");
      setActiveCategoryId(-1);
      setActiveQuestionId(-1);
      if (runbookKey) {
        setActiveRunbookTool(runbookKey);
        const rb = runbooksList.find((r) => r.key === runbookKey);
        if (rb) addToast(`Opened Runbook: ${rb.name}`, 2);
      }
    } else if (type === "incident_labs") {
      setIsStudyingSaved(false);
      setActiveTechId("incident_labs");
      setActiveCategoryId(-1);
      setActiveQuestionId(-1);
      addToast("Opened Incident Labs sandbox", 2);
    } else if (type === "tech" && techId) {
      setIsStudyingSaved(false);
      setActiveTechId(techId);
      setActiveCategoryId(categoryId);
      const tech = rawData[techId];
      if (tech) {
        if (categoryId === -1) {
          const firstQ = tech.categories[0]?.questions[0];
          if (firstQ) setActiveQuestionId(firstQ.id);
          addToast(`Switched channel to ${tech.technology} (All Modules)`, 2);
        } else {
          const cat = tech.categories.find((c) => c.id === categoryId);
          const firstQ = cat?.questions[0];
          if (firstQ) setActiveQuestionId(firstQ.id);
          if (cat) addToast(`Switched channel to ${cat.title}`, 2);
        }
      }
    }
  };

  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        dismissInstallPrompt();
        addToast("✓ ExitZero installed successfully", 3);
      }
      setDeferredPrompt(null);
    } else {
      addToast("To install ExitZero: Tap the Share button and select 'Add to Home Screen' 📲", 5);
      dismissInstallPrompt();
    }
  };

  const handleRequestNotifPermission = async () => {
    setShowNotifPrompt(false);
    if (!("Notification" in window)) {
      updateNotifPermission("denied");
      addToast("Notifications are not supported by this browser", 3);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      const status = permission === "default" ? "pending" : permission;
      updateNotifPermission(status);
      if (permission === "granted") {
        addToast("✓ Daily reminder scheduled at 9:00 PM", 3);
      }
    } catch (e) {
      console.error("Failed to request notification permission", e);
      updateNotifPermission("denied");
    }
  };

  const activeTech = rawData[activeTechId];
  const activeCategory = activeTech?.categories.find((c) => c.id === activeCategoryId) || activeTech?.categories[0];
  const activeQuestion = activeQueue[activeQueueIndex];

  const currentQuestionTechId = activeQuestion
    ? (isStudyingSaved || activeTechId === "all" ? (activeQuestion as any).technologyId : activeTechId)
    : "";
  const currentQuestionCompositeId = activeQuestion
    ? `${currentQuestionTechId}-${activeQuestion.id}`
    : "";

  // Standalone mode check
  const isStandalone = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
  const showInstallBanner = isMobile && !installDismissed && !isStandalone;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTechId={isStudyingSaved ? "saved_study" : activeTechId}
        setActiveTechId={(id) => {
          if (id === "saved") {
            setIsStudyingSaved(false);
            setActiveTechId("saved");
          } else {
            setIsStudyingSaved(false);
            setActiveTechId(id);
          }
          setIsSidebarOpen(false);
        }}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={(id) => {
          setIsStudyingSaved(false);
          setActiveCategoryId(id);
        }}
        setActiveQuestionId={setActiveQuestionId}
        progress={progress}
        bookmarks={bookmarks}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeRunbookTool={activeRunbookTool}
        setActiveRunbookTool={setActiveRunbookTool}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onSearchOpen={() => setIsSearchOpen(true)}
          onOpenChannelSelector={() => setIsChannelSelectorOpen(true)}
          activeTechName={
            isStudyingSaved
              ? "Study Session"
              : activeTechId === "saved"
              ? "Bookmarks"
              : activeTechId === "all"
              ? "All DevOps"
              : activeTechId === "runbooks"
              ? "Runbooks"
              : activeTechId === "incident_labs"
              ? "Incident Labs"
              : technologies.find((t) => t.id === activeTechId)?.name || ""
          }
          activeCategoryName={
            isStudyingSaved
              ? "Saved Bookmarks"
              : activeTechId === "saved"
              ? "Saved Questions List"
              : activeTechId === "all"
              ? "All Questions Queue"
              : activeTechId === "runbooks"
              ? runbooksList.find((r) => r.key === activeRunbookTool)?.name || "Operational Procedures"
              : activeTechId === "incident_labs"
              ? "Troubleshooting Sandbox"
              : activeCategoryId === -1
              ? "All Modules"
              : activeCategory?.title || ""
          }
          streakCount={streakCount}
          longestStreak={longestStreak}
          timerMode={timerMode}
          onToggleTimerMode={toggleTimerMode}
          timerDuration={timerDuration}
          onUpdateTimerDuration={updateTimerDuration}
          timerAutoAdvance={timerAutoAdvance}
          onToggleTimerAutoAdvance={toggleTimerAutoAdvance}
          soundHapticsEnabled={soundHapticsEnabled}
          onToggleSoundHaptics={toggleSoundHaptics}
          autoRevealEnabled={autoRevealEnabled}
          onToggleAutoReveal={toggleAutoReveal}
          notificationTime={notificationTime}
          onUpdateNotificationTime={updateNotificationTime}
          difficultyExclusions={difficultyExclusions}
          onToggleDifficultyExclusion={toggleDifficultyExclusion}
          notifPermission={notifPermission}
          onSendTestNotification={sendTestNotification}
          onRequestNotifPermission={handleRequestNotifPermission}
        />

        {/* Content routing view */}
        {activeTechId === "saved" && !isStudyingSaved ? (
          <SavedView
            bookmarks={bookmarks}
            onSelectQuestion={handleSelectQuestion}
            onStartStudy={() => {
              setIsStudyingSaved(true);
            }}
          />
        ) : activeTechId === "runbooks" ? (
          <RunbooksView
            soundHapticsEnabled={soundHapticsEnabled}
            activeTool={activeRunbookTool}
            setActiveTool={setActiveRunbookTool}
          />
        ) : activeTechId === "incident_labs" ? (
          <IncidentLabsView />
        ) : activeQuestion ? (
          <QuestionViewer
            question={activeQuestion}
            isFavorite={bookmarks.includes(currentQuestionCompositeId)}
            srsData={srsData}
            timerMode={timerMode}
            timerDuration={timerDuration}
            timerAutoAdvance={timerAutoAdvance}
            autoRevealEnabled={autoRevealEnabled}
            soundHapticsEnabled={soundHapticsEnabled}
            onToggleFavorite={handleToggleFavorite}
            onSRSReview={handleSRSReview}
            onPrev={handlePrev}
            onNext={handleNext}
            onRandom={handleRandom}
            addToast={addToast}
            isScopedSession={isStudyingSaved}
            techId={currentQuestionTechId}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-2">
            <span className="text-3xl font-light select-none font-mono">exit 1</span>
            <p className="font-mono text-xs">No questions loaded in this subject.</p>
          </div>
        )}
      </div>

      {/* Celebration Modal Overlay */}
      {celebrationSubject && (
        <CelebrationOverlay
          subjectName={celebrationSubject}
          onDismiss={() => setCelebrationSubject(null)}
        />
      )}

      {/* Notification Consent Prompt Modal */}
      {showNotifPrompt && (
        <NotificationPrompt
          onAccept={handleRequestNotifPermission}
          onDecline={() => {
            setShowNotifPrompt(false);
            updateNotifPermission("denied");
            addToast("Daily study reminders deactivated", 3);
          }}
        />
      )}

      {/* PWA Install Suggestion Banner */}
      {showInstallBanner && (
        <InstallBanner
          onInstall={handlePWAInstall}
          onDismiss={() => {
            dismissInstallPrompt();
            addToast("Install suggestion dismissed", 3);
          }}
        />
      )}

      {/* Global Queued Toast Rendering */}
      {toasts.length > 0 && (
        <div
          key={toasts[0].id}
          className="fixed bottom-4 right-4 z-[9999] bg-card text-[#22c55e] border border-border border-l-3 border-l-[#22c55e] rounded-lg px-4 py-3 shadow-2xl font-mono text-xs font-bold animate-in slide-in-from-right-10 duration-300 select-none flex items-center space-x-2"
        >
          <span>{toasts[0].message}</span>
        </div>
      )}

      {/* Search dialog command palette */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectQuestion={handleSelectQuestion}
      />

      {/* Target Profile / Channel Selector Modal */}
      <ChannelSelector
        isOpen={isChannelSelectorOpen}
        onClose={() => setIsChannelSelectorOpen(false)}
        activeTechId={activeTechId}
        activeCategoryId={activeCategoryId}
        activeRunbookTool={activeRunbookTool}
        onSelectChannel={handleSelectChannel}
        progress={progress}
        bookmarks={bookmarks}
      />
    </div>
  );
}
