import { useState, useEffect } from "react";

export type StudyStatus = "unseen" | "studying" | "mastered";

export interface LastViewed {
  techId: string;
  categoryId: number;
  questionId: number;
}

export function useStudyState() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [progress, setProgress] = useState<Record<number, StudyStatus>>({});
  const [lastViewed, setLastViewed] = useState<LastViewed>({
    techId: "docker",
    categoryId: 1,
    questionId: 1,
  });

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem("study_favs");
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedProgress = localStorage.getItem("study_progress");
      if (storedProgress) setProgress(JSON.parse(storedProgress));

      const storedLast = localStorage.getItem("study_last_viewed");
      if (storedLast) setLastViewed(JSON.parse(storedLast));
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }
    setIsHydrated(true);
  }, []);

  // Sync favorites to local storage
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      localStorage.setItem("study_favs", JSON.stringify(updated));
      return updated;
    });
  };

  // Sync progress to local storage
  const setQuestionStatus = (id: number, status: StudyStatus) => {
    setProgress((prev) => {
      const updated = { ...prev, [id]: status };
      localStorage.setItem("study_progress", JSON.stringify(updated));
      return updated;
    });
  };

  // Sync last viewed to local storage
  const updateLastViewed = (view: LastViewed) => {
    setLastViewed(view);
    localStorage.setItem("study_last_viewed", JSON.stringify(view));
  };

  return {
    isHydrated,
    favorites,
    progress,
    lastViewed,
    toggleFavorite,
    setQuestionStatus,
    updateLastViewed,
  };
}
