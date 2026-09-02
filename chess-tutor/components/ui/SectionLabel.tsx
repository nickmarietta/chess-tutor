export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[0.6rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
      {children}
    </div>
  );
}
