/** Trois chiffres clés : série de jours, XP et étoiles. */
export function StatTiles({ streak, xp, stars }: { streak: number; xp: number; stars: number }) {
  const tiles = [
    { value: streak, label: streak > 1 ? "jours de suite" : "jour de suite", color: "text-warning" },
    { value: xp, label: "XP", color: "text-primary" },
    { value: stars, label: stars > 1 ? "étoiles" : "étoile", color: "text-text" },
  ];
  return (
    <section aria-label="Mes statistiques" className="grid grid-cols-3 gap-2.5 rounded-3xl bg-card p-3">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl bg-background px-2 py-3 flex flex-col items-center gap-0.5 text-center">
          <span className={`text-xl font-extrabold ${t.color}`}>{t.value}</span>
          <span className="text-xs font-bold text-text-muted">{t.label}</span>
        </div>
      ))}
    </section>
  );
}
