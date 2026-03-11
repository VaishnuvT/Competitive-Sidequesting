export function QuestChecklist({ checklist }: { checklist: string[] | undefined }) {
  if (!checklist || checklist.length === 0) {
    return (
      <div className="card-surface p-5">
        <h2 className="text-xl text-slate-900">Tiny mission checklist</h2>
        <p className="mt-2 text-sm text-slate-600">This one is intentionally open-ended. Go do it your way.</p>
      </div>
    );
  }

  return (
    <div className="card-surface p-5">
      <h2 className="text-xl text-slate-900">Tiny mission checklist</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {checklist.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
