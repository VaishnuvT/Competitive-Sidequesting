import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-8 sm:px-6">
      <header className="sticky top-0 z-20 mt-3 flex items-center justify-between rounded-2xl border border-orange-200/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur">
        <Link href="/" className="font-display text-lg text-slate-900">
          Sidequest UT
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/onboarding"
            className="rounded-full border border-orange-200 px-3 py-1.5 text-slate-700 transition hover:border-orange-300 hover:text-slate-900"
          >
            Preferences
          </Link>
          <Link
            href="/journal"
            className="rounded-full bg-orange-500 px-3 py-1.5 font-medium text-white transition hover:bg-orange-600"
          >
            Journal
          </Link>
        </nav>
      </header>
      <main className="flex-1 py-6">{children}</main>
    </div>
  );
}
