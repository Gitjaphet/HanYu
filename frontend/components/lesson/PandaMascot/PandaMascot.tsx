"use client";

import styles from "./PandaMascot.module.css";

export type PandaState = "idle" | "speaking" | "listening" | "success" | "fail";

interface Props {
  state: PandaState;
  word?: string; // mot affiché dans la bulle quand speaking
}

export default function PandaMascot({ state, word }: Props) {
  const isSpeaking  = state === "speaking";
  const isListening = state === "listening";
  const isSuccess   = state === "success";
  const isFail      = state === "fail";

  const pandaClass = [
    styles.panda,
    isSpeaking  ? styles.speaking  : "",
    isListening ? styles.listening : "",
    isSuccess   ? styles.success   : "",
    isFail      ? styles.fail      : "",
  ].join(" ");

  return (
    <div className={styles.wrapper}>

      {/* Bulle de dialogue */}
      {isSpeaking && (
        <div className={styles.bubble}>
          <div className={styles.bubbleIcon}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="white">
              <polygon points="1,1 7,4 1,7"/>
            </svg>
          </div>
          {word
            ? <span className={styles.bubbleWord}>{word}</span>
            : <span className="text-text-muted">répète !</span>
          }
        </div>
      )}

      {/* SVG Panda */}
      <svg
        width="88"
        height="104"
        viewBox="0 0 44 52"
        className={pandaClass}
        aria-label="Panda mascotte"
      >
        {/* Corps */}
        <ellipse cx="22" cy="42" rx="14" ry="9"  fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="0.5"/>

        {/* Bras */}
        <ellipse cx="8"  cy="40" rx="4.5" ry="7" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="0.5"
          transform="rotate(-18,8,40)"/>
        <ellipse cx="36" cy="40" rx="4.5" ry="7" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="0.5"
          transform="rotate(18,36,40)"/>

        {/* Tête */}
        <ellipse cx="22" cy="21" rx="13" ry="12" fill="#f5f5f5" stroke="#e0e0e0" strokeWidth="0.5"/>

        {/* Oreilles */}
        <ellipse cx="10" cy="11" rx="6"  ry="6"  fill="#1a1a1a"/>
        <ellipse cx="34" cy="11" rx="6"  ry="6"  fill="#1a1a1a"/>
        <ellipse cx="10" cy="11" rx="3.2" ry="3.2" fill="#f5f5f5"/>
        <ellipse cx="34" cy="11" rx="3.2" ry="3.2" fill="#f5f5f5"/>

        {/* Taches yeux */}
        <ellipse cx="15" cy="20" rx="5" ry="4.5" fill="#1a1a1a"/>
        <ellipse cx="29" cy="20" rx="5" ry="4.5" fill="#1a1a1a"/>

        {/* Yeux */}
        {isSuccess ? (
          <>
            {/* Yeux en arc = heureux */}
            <path d="M 12 20 Q 15 16.5 18 20" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M 26 20 Q 29 16.5 32 20" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          </>
        ) : (
          <>
            <ellipse cx="15" cy="20" rx="2.5" ry="2.5" fill="white"/>
            <ellipse cx="29" cy="20" rx="2.5" ry="2.5" fill="white"/>
            <ellipse cx="15.9" cy="19.2" rx="1.2" ry="1.2" fill="#111"/>
            <ellipse cx="29.9" cy="19.2" rx="1.2" ry="1.2" fill="#111"/>
            {/* Reflets */}
            <ellipse cx="16.6" cy="18.6" rx="0.55" ry="0.55" fill="white"/>
            <ellipse cx="30.6" cy="18.6" rx="0.55" ry="0.55" fill="white"/>
          </>
        )}

        {/* Joues */}
        <ellipse cx="11" cy="25" rx="3.5" ry="2.2" fill="#f9a8d4" opacity="0.55"/>
        <ellipse cx="33" cy="25" rx="3.5" ry="2.2" fill="#f9a8d4" opacity="0.55"/>

        {/* Bouche */}
        {isSpeaking ? (
          <path
            className={styles.mouthTalk}
            d="M 15 26 Q 22 27 29 26"
            fill="none" stroke="#888" strokeWidth="1.4" strokeLinecap="round"
          />
        ) : isSuccess ? (
          <path d="M 15 26 Q 22 33 29 26"
            fill="none" stroke="#3B6D11" strokeWidth="1.6" strokeLinecap="round"/>
        ) : isFail ? (
          <path d="M 15 28 Q 22 23 29 28"
            fill="none" stroke="#888" strokeWidth="1.4" strokeLinecap="round"/>
        ) : (
          <path d="M 15 26 Q 22 29 29 26"
            fill="none" stroke="#888" strokeWidth="1.4" strokeLinecap="round"/>
        )}

        {/* Ondes sonores (speaking) */}
        {isSpeaking && (
          <>
            <circle cx="38" cy="20" r="3"   fill="none" stroke="#3b82f6" strokeWidth="1.1" className={styles.wave1}/>
            <circle cx="38" cy="20" r="5.5" fill="none" stroke="#3b82f6" strokeWidth="0.8" className={styles.wave2}/>
            <circle cx="38" cy="20" r="8"   fill="none" stroke="#3b82f6" strokeWidth="0.5" className={styles.wave3}/>
          </>
        )}

        {/* Étoiles (success) */}
        {isSuccess && (
          <>
            <text x="1"  y="10" fontSize="7" className={styles.star1}>⭐</text>
            <text x="32" y="9"  fontSize="7" className={styles.star2}>⭐</text>
          </>
        )}

        {/* Point d'interrogation (fail) */}
        {isFail && (
          <text x="34" y="10" fontSize="9" fill="#EF9F27" fontWeight="bold">?</text>
        )}

        {/* Micro icon (listening) */}
        {isListening && (
          <circle cx="38" cy="20" r="4" fill="#a855f7" opacity="0.25"
            style={{ animation: "wavePulse 1s ease-in-out infinite" }}/>
        )}
      </svg>
    </div>
  );
}