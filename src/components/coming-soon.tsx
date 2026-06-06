export function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">{title}</h1>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border p-10 text-center">
        <div className="text-muted [&>svg]:size-9">{icon}</div>
        <p className="max-w-xs text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}
