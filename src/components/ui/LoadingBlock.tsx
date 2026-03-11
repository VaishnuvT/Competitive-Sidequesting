export function LoadingBlock({ label = "Loading sidequests..." }: { label?: string }) {
  return (
    <div className="card-surface space-y-3 p-5">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div className="h-3 w-2/3 animate-pulse rounded bg-orange-100" />
      <div className="h-3 w-full animate-pulse rounded bg-orange-100" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-orange-100" />
    </div>
  );
}
