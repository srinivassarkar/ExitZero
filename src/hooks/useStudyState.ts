import { useState, useEffect } from "react";

export type StudyStatus = "unseen" | "studying" | "mastered";

export interface SRSData {
  status: StudyStatus;
  interval: number;
  easeFactor: number;
  nextReview: string;
  reviewCount: number;
}

export interface LastViewed {
  techId: string;
  categoryId: number;
  questionId: number;
}

export function useStudyState(addToast: (msg: string, duration?: number) => void) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]); // Array of "techId-questionId"
  const [srsData, setSrsData] = useState<Record<string, SRSData>>({}); // Keys are "techId-questionId"
  const [lastViewed, setLastViewed] = useState<LastViewed>({
    techId: "docker",
    categoryId: 1,
    questionId: 1,
  });

  // Streak State
  const [streakCount, setStreakCount] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Timer Preferences
  const [timerMode, setTimerMode] = useState(false);
  const [timerDuration, setTimerDuration] = useState(90);
  const [timerAutoAdvance, setTimerAutoAdvance] = useState(true);

  // Sound & Haptics Toggles
  const [soundHapticsEnabled, setSoundHapticsEnabled] = useState(true);
  const [autoRevealEnabled, setAutoRevealEnabled] = useState(false);

  // Custom Notification Reminder Time & Exclusions
  const [notificationTime, setNotificationTime] = useState("21:00");
  const [difficultyExclusions, setDifficultyExclusions] = useState<string[]>([]);

  // Install State
  const [sessionCount, setSessionCount] = useState(0);
  const [installDismissed, setInstallDismissed] = useState(false);

  // Notification State
  const [notifPermission, setNotifPermission] = useState<"granted" | "denied" | "pending">("pending");

  useEffect(() => {
    try {
      // 1. Bookmarks
      const storedBookmarks = localStorage.getItem("exitzero_bookmarks");
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }

      // 2. SRS Data
      const storedSrs = localStorage.getItem("exitzero_srs_data");
      if (storedSrs) setSrsData(JSON.parse(storedSrs));

      // 3. Last Viewed
      const storedLast = localStorage.getItem("exitzero_last_viewed");
      if (storedLast) setLastViewed(JSON.parse(storedLast));

      // 4. Timer Settings
      const storedTimerMode = localStorage.getItem("exitzero_timer_mode");
      if (storedTimerMode) setTimerMode(JSON.parse(storedTimerMode));

      const storedDuration = localStorage.getItem("exitzero_timer_duration");
      if (storedDuration) setTimerDuration(JSON.parse(storedDuration));

      const storedAutoAdvance = localStorage.getItem("exitzero_timer_autoadvance");
      if (storedAutoAdvance !== null) setTimerAutoAdvance(JSON.parse(storedAutoAdvance));

      // 5. Dismissed Install Banner
      const storedDismissed = localStorage.getItem("exitzero_install_dismissed");
      if (storedDismissed) setInstallDismissed(JSON.parse(storedDismissed));

      // 6. Notification Permission Status
      const storedNotif = localStorage.getItem("exitzero_notif_permission");
      if (storedNotif) setNotifPermission(storedNotif as any);

      // 9. Sound & Haptics Toggle
      const storedSound = localStorage.getItem("exitzero_sound_haptics");
      if (storedSound !== null) setSoundHapticsEnabled(JSON.parse(storedSound));

      // 10. Auto-Reveal Answer Toggle
      const storedReveal = localStorage.getItem("exitzero_auto_reveal");
      if (storedReveal !== null) setAutoRevealEnabled(JSON.parse(storedReveal));

      // 11. Custom Notification Reminder Time
      const storedNotifTime = localStorage.getItem("exitzero_notification_time");
      if (storedNotifTime) setNotificationTime(storedNotifTime);

      // 12. Difficulty Exclusions
      const storedExclusions = localStorage.getItem("exitzero_difficulty_exclusions");
      if (storedExclusions) setDifficultyExclusions(JSON.parse(storedExclusions));

      // 7. Session Counter
      const storedSessions = localStorage.getItem("exitzero_session_count");
      const currentSessions = storedSessions ? parseInt(storedSessions, 10) + 1 : 1;
      setSessionCount(currentSessions);
      localStorage.setItem("exitzero_session_count", currentSessions.toString());

      // 8. Streak Validation (Only maintain active streak if studied today or yesterday)
      const storedStreak = localStorage.getItem("exitzero_streak_count");
      const storedLongest = localStorage.getItem("exitzero_longest_streak");
      const storedLastDate = localStorage.getItem("exitzero_last_study_date");

      let currentStreak = storedStreak ? parseInt(storedStreak, 10) : 0;
      let currentLongest = storedLongest ? parseInt(storedLongest, 10) : 0;

      const today = new Date().toLocaleDateString('en-CA');
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

      if (storedLastDate === today || storedLastDate === yesterday) {
        // Streak is currently alive (user studied today or yesterday)
      } else {
        // Streak broken: more than 1 day has passed without review
        if (currentStreak > 0) {
          addToast("Study streak reset. Answer questions today to start a new streak! 💪", 4);
        }
        currentStreak = 0;
        localStorage.setItem("exitzero_streak_count", "0");
      }

      setStreakCount(currentStreak);
      setLongestStreak(currentLongest);

      // Update daily active timestamp for reminders
      localStorage.setItem("exitzero_last_active", today);
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "UPDATE_LAST_ACTIVE",
          date: today,
        });
      }

    } catch (e) {
      console.error("Failed to load/process ExitZero local storage", e);
    }
    setIsHydrated(true);
  }, []);

  // Sync Bookmarks (compositeId is "techId-questionId")
  const toggleBookmark = (compositeId: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(compositeId)
        ? prev.filter((item) => item !== compositeId)
        : [...prev, compositeId];
      localStorage.setItem("exitzero_bookmarks", JSON.stringify(updated));
      return updated;
    });
  };

  // SM-2 Spaced Repetition review processor (compositeId is "techId-questionId")
  const processSRSReview = (compositeId: string, score: "Again" | "Good" | "Easy") => {
    setSrsData((prev) => {
      const current = prev[compositeId] || {
        status: "unseen" as StudyStatus,
        interval: 0,
        easeFactor: 2.5,
        nextReview: new Date().toISOString(),
        reviewCount: 0,
      };

      let interval = current.interval;
      let easeFactor = current.easeFactor;
      const reviewCount = current.reviewCount + 1;

      if (score === "Again") {
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
      } else {
        if (reviewCount === 1) {
          interval = score === "Easy" ? 4 : 1;
        } else if (reviewCount === 2) {
          interval = score === "Easy" ? 6 : 3;
        } else {
          if (score === "Good") {
            interval = Math.round(interval * easeFactor);
          } else if (score === "Easy") {
            interval = Math.round(interval * easeFactor * 1.5);
            easeFactor = Math.min(3.0, easeFactor + 0.15);
          }
        }
      }

      const nextReview = new Date(Date.now() + interval * 86400000).toISOString();

      let status: StudyStatus = "studying";
      if (interval > 7) {
        status = "mastered";
      } else {
        status = "studying";
      }

      const updated = {
        ...prev,
        [compositeId]: {
          status,
          interval,
          easeFactor,
          nextReview,
          reviewCount,
        },
      };

      localStorage.setItem("exitzero_srs_data", JSON.stringify(updated));
      return updated;
    });

    // Record and advance study streak upon actual card review
    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
    const storedLastDate = localStorage.getItem("exitzero_last_study_date");
    const storedStreak = localStorage.getItem("exitzero_streak_count");
    let currentStreak = storedStreak ? parseInt(storedStreak, 10) : 0;
    let currentLongest = localStorage.getItem("exitzero_longest_streak")
      ? parseInt(localStorage.getItem("exitzero_longest_streak")!, 10)
      : 0;

    if (storedLastDate === today) {
      // Already studied today - streak is actively maintained
    } else if (storedLastDate === yesterday) {
      // Continued streak from yesterday!
      currentStreak += 1;
      localStorage.setItem("exitzero_streak_count", currentStreak.toString());
      localStorage.setItem("exitzero_last_study_date", today);
      addToast(`🔥 Day streak extended to ${currentStreak} days!`, 3);
    } else {
      // First review ever or streak reset after gap
      currentStreak = 1;
      localStorage.setItem("exitzero_streak_count", "1");
      localStorage.setItem("exitzero_last_study_date", today);
      addToast("🔥 1-day study streak started!", 3);
    }

    if (currentStreak > currentLongest) {
      currentLongest = currentStreak;
      localStorage.setItem("exitzero_longest_streak", currentLongest.toString());
    }

    setStreakCount(currentStreak);
    setLongestStreak(currentLongest);

    localStorage.setItem("exitzero_last_study_date", today);
    localStorage.setItem("exitzero_last_active", today);
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "UPDATE_LAST_ACTIVE",
        date: today,
      });
    }
  };

  // Sync Last Viewed
  const updateLastViewed = (view: LastViewed) => {
    setLastViewed(view);
    localStorage.setItem("exitzero_last_viewed", JSON.stringify(view));
  };

  // Timer Configuration Setters
  const toggleTimerMode = () => {
    setTimerMode((prev) => {
      const updated = !prev;
      localStorage.setItem("exitzero_timer_mode", JSON.stringify(updated));
      return updated;
    });
  };

  const updateTimerDuration = (duration: number) => {
    setTimerDuration(duration);
    localStorage.setItem("exitzero_timer_duration", JSON.stringify(duration));
  };

  const toggleTimerAutoAdvance = () => {
    setTimerAutoAdvance((prev) => {
      const updated = !prev;
      localStorage.setItem("exitzero_timer_autoadvance", JSON.stringify(updated));
      return updated;
    });
  };

  // Dismiss Install Prompt Banner
  const dismissInstallPrompt = () => {
    setInstallDismissed(true);
    localStorage.setItem("exitzero_install_dismissed", "true");
  };

  // Update Notification Permission
  const updateNotifPermission = (status: "granted" | "denied" | "pending") => {
    setNotifPermission(status);
    localStorage.setItem("exitzero_notif_permission", status);
  };

  // Setters for Sound & Haptics, Auto-Reveal, Custom Time, and Exclusions
  const toggleSoundHaptics = () => {
    setSoundHapticsEnabled((prev) => {
      const updated = !prev;
      localStorage.setItem("exitzero_sound_haptics", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleAutoReveal = () => {
    setAutoRevealEnabled((prev) => {
      const updated = !prev;
      localStorage.setItem("exitzero_auto_reveal", JSON.stringify(updated));
      return updated;
    });
  };

  const updateNotificationTime = (time: string) => {
    setNotificationTime(time);
    localStorage.setItem("exitzero_notification_time", time);
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "UPDATE_NOTIF_TIME",
        time: time,
      });
    }
  };

  // Immediate test notification to verify reminders are functioning
  const sendTestNotification = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      addToast("Notifications are not supported by this browser", 3);
      return;
    }

    if (Notification.permission === "granted") {
      try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "TEST_NOTIFICATION" });
        } else {
          new Notification("ExitZero 💻 [Test Reminder]", {
            body: "✓ Daily study reminders are working properly!",
            icon: "/icon-192.png",
          });
        }
        addToast("✓ Test reminder sent! Check your notifications.", 4);
      } catch (e) {
        addToast("Test notification sent!", 3);
      }
    } else if (Notification.permission === "denied") {
      addToast("Notifications are blocked in your browser settings", 4);
    } else {
      Notification.requestPermission().then((perm) => {
        const status = perm === "default" ? "pending" : perm;
        updateNotifPermission(status);
        if (perm === "granted") {
          addToast("✓ Notifications enabled! Sending test reminder...", 3);
          try {
            new Notification("ExitZero 💻 [Test Reminder]", {
              body: "✓ Daily study reminders are now enabled!",
              icon: "/icon-192.png",
            });
          } catch (e) {}
        } else {
          addToast("Notification permission was not granted", 3);
        }
      });
    }
  };

  // Active client-side reminder heartbeat
  useEffect(() => {
    const checkReminder = () => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, "0");
      const currentMinute = now.getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;

      const savedTime = localStorage.getItem("exitzero_notification_time") || "21:00";
      const today = now.toLocaleDateString("en-CA");
      const lastStudyDate = localStorage.getItem("exitzero_last_study_date");
      const lastNotifiedDate = localStorage.getItem("exitzero_last_notified_date");

      if (currentTime >= savedTime && lastStudyDate !== today && lastNotifiedDate !== today) {
        localStorage.setItem("exitzero_last_notified_date", today);
        try {
          if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: "DAILY_REMINDER_TRIGGER",
            });
          } else {
            new Notification("ExitZero 💻", {
              body: "You haven't practiced your DevOps questions today. Keep your streak alive!",
              icon: "/icon-192.png",
              tag: "daily-study-reminder",
            });
          }
        } catch (e) {
          console.error("Failed to trigger reminder notification", e);
        }
      }
    };

    checkReminder();
    const timer = setInterval(checkReminder, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkReminder();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const toggleDifficultyExclusion = (difficulty: string) => {
    setDifficultyExclusions((prev) => {
      const updated = prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty];
      localStorage.setItem("exitzero_difficulty_exclusions", JSON.stringify(updated));
      return updated;
    });
  };

  // Derive progress mapping from SRS statuses (using string composite keys)
  const progress: Record<string, StudyStatus> = {};
  Object.entries(srsData).forEach(([key, data]) => {
    progress[key] = data.status;
  });

  return {
    isHydrated,
    bookmarks,
    srsData,
    progress,
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
  };
}
