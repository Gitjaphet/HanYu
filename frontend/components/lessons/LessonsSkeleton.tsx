/** Squelette de la page Leçons : la mise en page apparaît tout de suite, le contenu se remplit ensuite. */
function Block({ className }: { className: string }) {
  return <span className={`block rounded-xl bg-tint animate-pulse ${className}`} />;
}

export function LessonsSkeleton() {
  return (
    <div className="flex flex-col gap-5 md:gap-6" aria-busy="true" aria-label="Chargement des leçons">
      <div className="flex flex-col gap-2">
        <Block className="h-8 w-40" />
        <Block className="h-4 w-72 max-w-full" />
      </div>
      <Block className="h-14 md:h-[68px] w-full rounded-2xl" />
      {[4, 3].map((rows, i) => (
        <div key={i} className="rounded-3xl bg-card p-4 md:p-6 flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Block className="h-3 w-16" />
              <Block className="h-6 w-40" />
            </div>
            <Block className="h-2 w-24 md:w-56 self-end" />
          </div>
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="flex items-center gap-4">
              <Block className="h-8 w-8 rounded-full" />
              <Block className="h-12 w-12 md:h-14 md:w-14 rounded-2xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Block className="h-4 w-48 max-w-full" />
                <Block className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
