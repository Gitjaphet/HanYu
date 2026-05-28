"use client";

import { Trophy, Hammer, Crown } from "lucide-react";

export default function LeaderboardPage() {
  // Fausses données pour montrer un aperçu de ce qui arrive
  const mockPlayers = [
    { rank: 1, name: "Joueur Mystère", xp: "???", color: "text-yellow-500", bg: "bg-yellow-100", border: "border-yellow-200" },
    { rank: 2, name: "Joueur Mystère", xp: "???", color: "text-gray-400", bg: "bg-gray-100", border: "border-gray-200" },
    { rank: 3, name: "Joueur Mystère", xp: "???", color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
      
      {/* ── En-tête "En construction" ── */}
      <div className="flex flex-col items-center text-center mb-10 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        
        {/* Icône animée */}
        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
          <Trophy size={64} className="text-yellow-400 opacity-40" />
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md animate-bounce">
            <Hammer size={24} className="text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-text mb-3">
          Classement 🚧
        </h1>
        <p className="text-text-muted font-medium text-base sm:text-lg max-w-md">
          Cette page est en pleine construction ! <br className="hidden sm:block" />
          Bientôt, les meilleurs joueurs s'afficheront ici selon leur score et leur niveau.
        </p>
      </div>

      {/* ── Aperçu du futur classement (Flouté/Grisé) ── */}
      <div className="opacity-50 select-none pointer-events-none grayscale-[50%]">
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 ml-2">
          Aperçu du Top 3
        </h2>
        
        <div className="flex flex-col gap-3">
          {mockPlayers.map((player) => (
            <div 
              key={player.rank} 
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 bg-card ${player.border}`}
            >
              {/* Badge de rang */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${player.bg} ${player.color}`}>
                {player.rank === 1 ? <Crown size={24} /> : `#${player.rank}`}
              </div>
              
              {/* Infos Joueur */}
              <div className="flex-1">
                <p className="font-bold text-text text-lg">{player.name}</p>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                  Bientôt dévoilé
                </p>
              </div>
              
              {/* XP */}
              <div className="text-right">
                <p className={`font-black text-xl ${player.color}`}>{player.xp}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">XP</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Faux bouton "Voir plus" */}
        <div className="mt-4 text-center">
          <div className="inline-block px-6 py-3 rounded-xl bg-border/50 text-text-muted font-bold text-sm">
            Chargement des autres joueurs...
          </div>
        </div>
      </div>
      
    </div>
  );
}