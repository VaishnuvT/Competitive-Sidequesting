export function PageContainer({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-3xl ${className}`.trim()}>{children}</div>;
}
