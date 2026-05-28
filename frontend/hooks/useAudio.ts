// Fichier : frontend/hooks/useAudio.ts
"use client";

export function useAudio() {
  const speak = (text: string, isSlow: boolean = false) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // On stoppe les voix en cours pour éviter les chevauchements
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN"; // Force l'accent Mandarin officiel

    // Configuration de la vitesse (Vitesse Pro)
    utterance.rate = isSlow ? 0.55 : 0.9; // 0.55 = Très lent et décomposé, 0.9 = Naturel pédagogique

    window.speechSynthesis.speak(utterance);
  };

  return { speak };
}