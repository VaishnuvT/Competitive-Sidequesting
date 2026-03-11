type EmptyStateProps = {
  title: string;
  description: string;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
};

export function EmptyState({ title, description, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <div className="card-surface space-y-4 p-6 text-center">
      <h2 className="text-2xl text-slate-900">{title}</h2>
      <p className="subtle-copy">{description}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {primaryAction}
        {secondaryAction}
      </div>
    </div>
  );
}
