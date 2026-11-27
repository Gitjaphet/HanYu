// app/(app)/leaderboard/page.tsx — le classement des élèves par XP
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, RefreshCw, Star, Trophy, UserPlus } from "lucide-react";
import { fetchLeaderboard, medalTone, myExtraRow, type Leaderboard, type LeaderboardEntry } from "@/lib/leaderboard";
import { useUserStore } from "@/store/userStore";

type State = { board: Leaderboard | null; error: string | null; key: string | null };

export default function LeaderboardPage() {
  const userId = useUserStore((s) => s.user?.id ?? null);
  const status = useUserStore((s) => s.status);
  const [reload, setReload] = useState(0);
  const [state, setState] = useState<State>({ board: null, error: null, key: null });

  // Recharger quand on se connecte ou se déconnecte (ma place change), ou sur « Réessayer »
  const key = `${userId}-${reload}`;
  useEffect(() => {
    if (status === "loading") return;
    let active = true;
    fetchLeaderboard()
      .then((board) => active && setState({ board, error: null, key }))
      .catch((e: Error) => active && setState({ board: null, error: e.message, key }));
    return () => {
      active = false;
    };
  }, [key, status]);

  const loading = state.key !== key;
  const extra = state.board ? myExtraRow(state.board) : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-warning-soft text-warning">
          <Trophy size={28} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-black text-text sm:text-3xl">Classement</h1>
          <p className="text-sm font-medium text-text-muted">
            Les élèves qui ont gagné le plus d&apos;XP{state.board && state.board.total > 0 ? ` · ${state.board.total} classé${state.board.total > 1 ? "s" : ""}` : ""}.
          </p>
        </div>
      </header>

      {loading ? (
        <ListSkeleton />
      ) : state.error ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center" role="alert">
          <p className="font-bold text-text-muted">Impossible de charger le classement pour le moment.</p>
          <button type="button" onClick={() => setReload((r) => r + 1)}
            className="flex items-center gap-2 rounded-full bg-tint px-5 py-2.5 text-sm font-extrabold text-primary transition hover:brightness-95">
            <RefreshCw size={16} aria-hidden="true" /> Réessayer
          </button>
        </div>
      ) : state.board && state.board.top.length > 0 ? (
        <ol className="flex flex-col gap-2" aria-label="Classement">
          {state.board.top.map((e) => <Row key={`${e.rank}-${e.pseudo}`} entry={e} />)}
          {extra && (
            <>
              <li aria-hidden="true" className="py-1 text-center font-black tracking-widest text-text-muted">· · ·</li>
              <Row entry={extra} />
            </>
          )}
        </ol>
      ) : (
        <p className="rounded-2xl border border-border bg-card p-6 text-center font-bold text-text-muted">
          Personne n&apos;est encore classé : termine une leçon pour prendre la première place !
        </p>
      )}

      {!loading && !state.error && (
        userId === null ? (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">Crée un compte pour apparaître dans le classement.</p>
            <Link href="/register"
              className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-primary-dark">
              <UserPlus size={16} aria-hidden="true" /> Créer un compte
            </Link>
          </div>
        ) : (
          !state.board?.me && (
            <p className="text-center text-sm font-medium text-text-muted">
              Tu n&apos;es pas encore classé : termine ta première leçon pour gagner des XP.
            </p>
          )
        )
      )}
    </div>
  );
}

function Row({ entry }: { entry: LeaderboardEntry }) {
  return (
    <li aria-current={entry.isMe ? "true" : undefined}
      className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition sm:gap-4 sm:p-4 ${
        entry.isMe ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black ${medalTone(entry.rank)}`}
        aria-label={`${entry.rank}${entry.rank === 1 ? "er" : "e"}`}>
        {entry.rank === 1 ? <Crown size={20} aria-hidden="true" /> : entry.rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-text">
          {entry.pseudo}
          {entry.isMe && <span className="ml-2 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Toi</span>}
        </p>
        <p className="flex items-center gap-2 text-xs font-semibold text-text-muted">
          {entry.lessons} leçon{entry.lessons > 1 ? "s" : ""}
          <span className="flex items-center gap-0.5">
            <Star size={12} className="fill-warning text-warning" aria-hidden="true" /> {entry.stars}
          </span>
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-black tabular-nums text-primary sm:text-xl">{entry.xp}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">XP</p>
      </div>
    </li>
  );
}

function ListSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2" aria-busy="true" aria-label="Chargement du classement">
      {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-[72px] rounded-2xl bg-card" />)}
    </div>
  );
}
