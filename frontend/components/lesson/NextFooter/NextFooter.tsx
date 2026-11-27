// components/lesson/NextFooter/NextFooter.tsx — bouton du bas « suivant » des exercices au micro
import type { RepeatPhase } from "@/hooks/useRepeatAfterMe";

export function NextFooter({ phase, label, onNext }: { phase: RepeatPhase; label: string; onNext: () => void }) {
  return (
    <div className="border-t border-border bg-card px-3 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-3 sm:px-4 sm:pb-6 sm:pt-4">
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={onNext}
          disabled={phase === "listening"}
          className={`w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted sm:py-4 sm:text-base ${
            phase === "success" ? "bg-success" : "bg-secondary"
          }`}
        >
          {label}
        </button>
      </div>
    </div>
  );
}
