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

      // 8. Streak Logic
      const storedStreak = localStorage.getItem("exitzero_streak_count");
      const storedLongest = localStorage.getItem("exitzero_longest_streak");
      const storedLastDate = localStorage.getItem("exitzero_last_study_date");

      let currentStreak = storedStreak ? parseInt(storedStreak, 10) : 0;
      let currentLongest = storedLongest ? parseInt(storedLongest, 10) : 0;

      const today = new Date().toLocaleDateString('en-CA');
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

      if (storedLastDate === today) {
        // Already active today, do nothing
      } else if (storedLastDate === yesterday) {
        // Continued streak
        currentStreak += 1;
        localStorage.setItem("exitzero_streak_count", currentStreak.toString());
        localStorage.setItem("exitzero_last_study_date", today);
      } else {
        // Streak broke or first time
        if (storedLastDate !== null) {
          currentStreak = 1;
          localStorage.setItem("exitzero_streak_count", "1");
          localStorage.setItem("exitzero_last_study_date", today);
          addToast("Streak reset. Start again today 💪", 4);
        } else {
          currentStreak = 1;
          localStorage.setItem("exitzero_streak_count", "1");
          localStorage.setItem("exitzero_last_study_date", today);
        }
      }

      if (currentStreak > currentLongest) {
        currentLongest = currentStreak;
        localStorage.setItem("exitzero_longest_streak", currentLongest.toString());
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
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date().toISOString(),
        reviewCount: 0,
      };

      let interval = current.interval;
      let easeFactor = current.easeFactor;

      if (score === "Again") {
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
      } else if (score === "Good") {
        interval = Math.round(interval * easeFactor);
      } else if (score === "Easy") {
        interval = Math.round(interval * easeFactor * 1.3);
        easeFactor += 0.1;
      }

      const reviewCount = current.reviewCount + 1;
      const nextReview = new Date(Date.now() + interval * 86400000).toISOString();

      let status: StudyStatus = "studying";
      if (interval <= 1) {
        status = "studying";
      } else if (interval > 7) {
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

    // Update study date and send to service worker
    const today = new Date().toLocaleDateString('en-CA');
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
    toggleDifficultyExclusion,
  };
}
