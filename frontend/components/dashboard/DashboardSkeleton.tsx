function Block({ className }: { className: string }) {
  return <span className={`block bg-tint animate-pulse ${className}`} />;
}

/** Squelette du tableau de bord, affiché pendant le tout premier chargement. */
export function DashboardSkeleton() {
  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_300px] gap-6" aria-busy="true" aria-label="Chargement">
      <div className="flex flex-col gap-6">
        <Block className="h-4 w-48 rounded-lg" />
        <Block className="h-48 w-full rounded-3xl" />
        <div className="grid md:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <Block key={i} className="h-36 rounded-3xl" />)}
        </div>
      </div>
      <div className="mt-6 xl:mt-0 flex flex-col gap-4">
        <Block className="h-24 rounded-3xl" />
        <Block className="h-72 rounded-3xl" />
      </div>
    </div>
  );
}
