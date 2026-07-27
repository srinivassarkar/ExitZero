"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { QuestionViewer } from "@/components/QuestionViewer";
import { SearchDialog } from "@/components/SearchDialog";
import { rawData, technologies, Question, Category } from "@/data";
import { useStudyState, StudyStatus } from "@/hooks/useStudyState";

export default function Home() {
  const {
    isHydrated,
    favorites,
    progress,
    lastViewed,
    toggleFavorite,
    setQuestionStatus,
    updateLastViewed,
  } = useStudyState();

  const [activeTechId, setActiveTechId] = useState("docker");
  const [activeCategoryId, setActiveCategoryId] = useState(1);
  const [activeQuestionId, setActiveQuestionId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync state once hydration from localStorage completes
  useEffect(() => {
    if (isHydrated) {
      setActiveTechId(lastViewed.techId);
      setActiveCategoryId(lastViewed.categoryId);
      setActiveQuestionId(lastViewed.questionId);
    }
  }, [isHydrated, lastViewed.techId, lastViewed.categoryId, lastViewed.questionId]);

  // Handle hotkeys (arrows for navigation, / to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in search or input fields
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        isSearchOpen
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
        toggleFavorite(activeQuestionId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const activeTech = rawData[activeTechId];
  if (!activeTech) return null;

  const activeCategory = activeTech.categories.find((c) => c.id === activeCategoryId) || activeTech.categories[0];
  const activeQuestion = activeCategory?.questions.find((q) => q.id === activeQuestionId) || activeCategory?.questions[0];

  const handleSelectQuestion = (techId: string, categoryId: number, questionId: number) => {
    setActiveTechId(techId);
    setActiveCategoryId(categoryId);
    setActiveQuestionId(questionId);
    updateLastViewed({ techId, categoryId, questionId });
  };

  const getQuestionList = (): { category: Category; questions: Question[] }[] => {
    return activeTech.categories.map((c) => ({
      category: c,
      questions: c.questions,
    }));
  };

  const handlePrev = () => {
    const categories = activeTech.categories;
    let currentCatIdx = categories.findIndex((c) => c.id === activeCategoryId);
    if (currentCatIdx === -1) currentCatIdx = 0;

    const currentQuestions = categories[currentCatIdx].questions;
    const currentQuesIdx = currentQuestions.findIndex((q) => q.id === activeQuestionId);

    if (currentQuesIdx > 0) {
      // Previous question in same category
      const nextQ = currentQuestions[currentQuesIdx - 1];
      setActiveQuestionId(nextQ.id);
      updateLastViewed({
        techId: activeTechId,
        categoryId: activeCategoryId,
        questionId: nextQ.id,
      });
    } else {
      // Go to last question of previous category
      const prevCatIdx = (currentCatIdx - 1 + categories.length) % categories.length;
      const prevCat = categories[prevCatIdx];
      if (prevCat && prevCat.questions.length > 0) {
        const nextQ = prevCat.questions[prevCat.questions.length - 1];
        setActiveCategoryId(prevCat.id);
        setActiveQuestionId(nextQ.id);
        updateLastViewed({
          techId: activeTechId,
          categoryId: prevCat.id,
          questionId: nextQ.id,
        });
      }
    }
  };

  const handleNext = () => {
    const categories = activeTech.categories;
    let currentCatIdx = categories.findIndex((c) => c.id === activeCategoryId);
    if (currentCatIdx === -1) currentCatIdx = 0;

    const currentQuestions = categories[currentCatIdx].questions;
    const currentQuesIdx = currentQuestions.findIndex((q) => q.id === activeQuestionId);

    if (currentQuesIdx < currentQuestions.length - 1) {
      // Next question in same category
      const nextQ = currentQuestions[currentQuesIdx + 1];
      setActiveQuestionId(nextQ.id);
      updateLastViewed({
        techId: activeTechId,
        categoryId: activeCategoryId,
        questionId: nextQ.id,
      });
    } else {
      // Go to first question of next category
      const nextCatIdx = (currentCatIdx + 1) % categories.length;
      const nextCat = categories[nextCatIdx];
      if (nextCat && nextCat.questions.length > 0) {
        const nextQ = nextCat.questions[0];
        setActiveCategoryId(nextCat.id);
        setActiveQuestionId(nextQ.id);
        updateLastViewed({
          techId: activeTechId,
          categoryId: nextCat.id,
          questionId: nextQ.id,
        });
      }
    }
  };

  const handleRandom = () => {
    const allTechQuestions: { categoryId: number; question: Question }[] = [];
    activeTech.categories.forEach((cat) => {
      cat.questions.forEach((q) => {
        allTechQuestions.push({ categoryId: cat.id, question: q });
      });
    });

    if (allTechQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * allTechQuestions.length);
      const chosen = allTechQuestions[randomIndex];
      setActiveCategoryId(chosen.categoryId);
      setActiveQuestionId(chosen.question.id);
      updateLastViewed({
        techId: activeTechId,
        categoryId: chosen.categoryId,
        questionId: chosen.question.id,
      });
    }
  };

  // Calculate total questions progress for this subject
  const getTechProgress = () => {
    let total = 0;
    let mastered = 0;
    activeTech.categories.forEach((cat) => {
      cat.questions.forEach((q) => {
        total++;
        if (progress[q.id] === "mastered") {
          mastered++;
        }
      });
    });
    return { total, mastered };
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Panel */}
      <Sidebar
        activeTechId={activeTechId}
        setActiveTechId={(id) => {
          setActiveTechId(id);
          setIsSidebarOpen(false);
        }}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={setActiveCategoryId}
        setActiveQuestionId={setActiveQuestionId}
        progress={progress}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background h-screen">
        <Header
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onSearchOpen={() => setIsSearchOpen(true)}
          activeTechName={technologies.find((t) => t.id === activeTechId)?.name || ""}
          activeCategoryName={activeCategory?.title || ""}
          totalProgress={getTechProgress()}
        />

        {activeQuestion ? (
          <QuestionViewer
            question={activeQuestion}
            isFavorite={favorites.includes(activeQuestion.id)}
            status={progress[activeQuestion.id] || "unseen"}
            onToggleFavorite={() => toggleFavorite(activeQuestion.id)}
            onStatusChange={(status: StudyStatus) => setQuestionStatus(activeQuestion.id, status)}
            onPrev={handlePrev}
            onNext={handleNext}
            onRandom={handleRandom}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No questions found.
          </div>
        )}
      </div>

      {/* Fuzzy Search Command Palette Overlay */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectQuestion={handleSelectQuestion}
      />
    </div>
  );
}
