// Fichier : frontend/hooks/useLesson.ts
"use client";

import { useState } from "react";

export function useLesson(questions: any[] = []) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentIdx];
  const progress = questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;

  const selectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const verifyAnswer = () => {
    if (!selectedOption || !currentQuestion) return;
    
    const correct = selectedOption === currentQuestion.translation;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (!correct) {
      setHearts((prev) => Math.max(0, prev - 1));
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    // Si on arrive à la dernière question ou si on n'a plus de vie
    if (currentIdx + 1 >= questions.length || hearts <= 0) {
      setIsFinished(true);
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  return {
    currentQuestion,
    progress,
    selectedOption,
    isAnswered,
    isCorrect,
    hearts,
    isFinished,
    selectOption,
    verifyAnswer,
    nextQuestion,
  };
}