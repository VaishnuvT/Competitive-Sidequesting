export function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700">
      {children}
    </span>
  );
}
