export function SectionHeading({
  title,
  subtitle,
  eyebrow
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">{eyebrow}</p> : null}
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="subtle-copy text-base">{subtitle}</p> : null}
    </div>
  );
}
