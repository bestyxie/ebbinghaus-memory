export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold">Ebbinghaus Memory</h1>
        <p className="text-slate-600 max-w-md">
          Spaced repetition flashcard app using the SM-2 algorithm.
          Manage your tags in the sidebar.
        </p>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <span className="text-sm text-slate-400">
          Built with Next.js 15, Prisma, and Tailwind CSS 4
        </span>
      </footer>
    </div>
  );
}
