'use client';

export type RoomVariant = 'room-day' | 'room-night' | 'room-sakura';

const PALETTE: Record<RoomVariant, { wallTop: string; wallBottom: string; floor: string; rug: string; accent: string }> = {
  'room-day': { wallTop: '#bdebf5', wallBottom: '#dcd9ff', floor: '#f8d9ec', rug: '#ffe9f5', accent: '#fff2b9' },
  'room-night': { wallTop: '#3b3a66', wallBottom: '#5d5595', floor: '#8b7ab8', rug: '#a195cf', accent: '#fff2b9' },
  'room-sakura': { wallTop: '#ffe4f0', wallBottom: '#f8d9ec', floor: '#f6c6dd', rug: '#ffeaf4', accent: '#fff2b9' },
};

export default function Room({ variant = 'room-day', className = '' }: { variant?: RoomVariant; className?: string }) {
  const c = PALETTE[variant] ?? PALETTE['room-day'];
  const dark = '#25243d';

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      shapeRendering="crispEdges"
    >
      <defs>
        <linearGradient id={`wall-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.wallTop} />
          <stop offset="1" stopColor={c.wallBottom} />
        </linearGradient>
      </defs>

      <rect width="100" height="100" fill={`url(#wall-${variant})`} />
      <rect y="66" width="100" height="34" fill={c.floor} />
      <rect y="65" width="100" height="1.5" fill="#ffffff" opacity="0.5" />

      {/* window */}
      <g>
        <rect x="2" y="16" width="22" height="26" fill="#ffffff" opacity="0.65" />
        <rect x="2" y="16" width="22" height="26" fill="none" stroke={dark} strokeWidth="1.2" opacity="0.45" />
        <rect x="12.4" y="16" width="1.2" height="26" fill={dark} opacity="0.3" />
        <rect x="2" y="28.4" width="22" height="1.2" fill={dark} opacity="0.3" />
        <g fill="#ffffff" opacity="0.9">
          <rect x="4" y="20" width="6" height="2" />
          <rect x="5" y="18" width="4" height="2" />
          <rect x="15" y="33" width="7" height="2" />
          <rect x="16" y="31" width="4" height="2" />
        </g>
      </g>

      {/* plant */}
      <g>
        <rect x="6" y="56" width="10" height="9" fill={c.accent} />
        <rect x="6" y="56" width="10" height="2" fill="#ffffff" opacity="0.6" />
        <g fill="#8fd8a8">
          <rect x="10" y="46" width="2" height="10" />
          <rect x="7" y="48" width="3" height="2" />
          <rect x="6" y="50" width="3" height="2" />
          <rect x="12" y="44" width="3" height="2" />
          <rect x="13" y="46" width="3" height="2" />
          <rect x="7" y="52" width="3" height="2" />
        </g>
      </g>

      {/* shelf */}
      <g>
        <rect x="76" y="40" width="22" height="25" fill="#e8d7f7" opacity="0.9" />
        <rect x="76" y="40" width="22" height="1.5" fill={dark} opacity="0.25" />
        <rect x="76" y="52" width="22" height="1.5" fill={dark} opacity="0.25" />
        <g>
          <rect x="79" y="43" width="3" height="9" fill="#f49ac8" />
          <rect x="83" y="45" width="3" height="7" fill="#73cfe3" />
          <rect x="87" y="42" width="3" height="10" fill="#fff2b9" />
          <rect x="91" y="44" width="3" height="8" fill="#9b93f0" />
          <rect x="80" y="56" width="4" height="9" fill="#73cfe3" />
          <rect x="85" y="58" width="3" height="7" fill="#f49ac8" />
        </g>
      </g>

      {/* lamp */}
      <g>
        <rect x="60" y="34" width="12" height="8" fill={c.accent} />
        <rect x="61" y="33" width="10" height="2" fill="#fff8d8" />
        <rect x="65" y="42" width="2" height="12" fill={dark} opacity="0.45" />
        <rect x="62" y="54" width="8" height="2" fill={dark} opacity="0.45" />
      </g>

      {/* rug */}
      <ellipse cx="50" cy="84" rx="27" ry="8" fill={c.rug} />
      <ellipse cx="50" cy="84" rx="19" ry="5" fill="#ffffff" opacity="0.55" />

      {/* floating sparkles */}
      <g fill="#ffffff" opacity="0.85">
        <rect x="33" y="12" width="2" height="2" />
        <rect x="68" y="20" width="2" height="2" />
        <rect x="44" y="26" width="1.5" height="1.5" />
        <rect x="28" y="33" width="1.5" height="1.5" />
      </g>
      <g fill={c.accent}>
        <rect x="38" y="8" width="2.5" height="2.5" />
        <rect x="72" y="12" width="2.5" height="2.5" />
        <rect x="24" y="44" width="2" height="2" />
      </g>
    </svg>
  );
}
