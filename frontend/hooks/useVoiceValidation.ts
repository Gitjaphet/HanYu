// Fichier : frontend/hooks/useVoiceValidation.ts
"use client";

import { useState } from "react";

export function useVoiceValidation() {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

  const startListening = (expectedHanzi: string, onResult: (isCorrect: boolean) => void) => {
    // Vérification de la compatibilité du navigateur
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur. Passez sur Chrome ou Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN"; // Écoute spécifiquement le chinois mandarin
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setRecognizedText("");
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setRecognizedText(resultText);

      // Nettoyage des espaces et de la ponctuation pour la comparaison
      const cleanResult = resultText.replace(/[\s，。！？]/g, "");
      const cleanExpected = expectedHanzi.replace(/[\s，。！？]/g, "");

      // Validation IA : Est-ce que l'élève a bien prononcé ?
      onResult(cleanResult === cleanExpected);
    };

    recognition.start();
  };

  return { isListening, recognizedText, startListening };
}