export default function StatPill({
  label,
  value,
  ratio,
  tone = 'pink',
}: {
  label: string;
  value: string;
  ratio?: number;
  tone?: 'pink' | 'sky' | 'lavender';
}) {
  const bar = tone === 'sky' ? 'bg-sky-deep' : tone === 'lavender' ? 'bg-lavender-deep' : 'bg-pink-deep';
  return (
    <div className="rounded-2xl border border-line bg-card px-3 py-2.5 text-center">
      <p className="pixel text-base tabular-nums">{value}</p>
      <p className="pixel mt-0.5 text-[10px] text-ink-soft">{label}</p>
      {ratio !== undefined && (
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(100, ratio * 100)}%` }} />
        </div>
      )}
    </div>
  );
}
