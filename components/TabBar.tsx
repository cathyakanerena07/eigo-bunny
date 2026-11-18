'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'ホーム', icon: 'home' },
  { href: '/lesson', label: 'レッスン', icon: 'book' },
  { href: '/growth', label: '成長記録', icon: 'chart' },
  { href: '/shop', label: 'ショップ', icon: 'bag' },
  { href: '/settings', label: '設定', icon: 'gear' },
] as const;

const PATHS: Record<string, string> = {
  home: 'M12 3 3 11h2.5v9h5v-5h3v5h5v-9H21z',
  book: 'M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zm16 0h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z',
  chart: 'M4 20V10h4v10zm6 0V4h4v16zm6 0v-7h4v7z',
  bag: 'M6 8h12l1 12H5zM9 8a3 3 0 0 1 6 0',
  gear: 'M12 8.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5m9 3.5-2.1-.6-.5-1.3 1-1.9-1.6-1.6-1.9 1-1.3-.5L13.9 3h-2.2l-.6 2.1-1.3.5-1.9-1-1.6 1.6 1 1.9-.5 1.3L4.7 11v2.2l2.1.6.5 1.3-1 1.9 1.6 1.6 1.9-1 1.3.5.6 2.1h2.2l.6-2.1 1.3-.5 1.9 1 1.6-1.6-1-1.9.5-1.3L21 13.9z',
};

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch">
        {TABS.map((t) => {
          const active = t.href === '/' ? pathname === '/' : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} className="flex flex-col items-center gap-0.5 py-2">
                <svg
                  viewBox="0 0 24 24"
                  className={`size-6 ${active ? 'text-pink-deep' : 'text-ink-soft'}`}
                  fill={t.icon === 'bag' || t.icon === 'book' ? 'none' : 'currentColor'}
                  stroke={t.icon === 'bag' || t.icon === 'book' ? 'currentColor' : 'none'}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d={PATHS[t.icon]} />
                </svg>
                <span className={`pixel text-[10px] ${active ? 'text-pink-deep' : 'text-ink-soft'}`}>{t.label}</span>
                {active && <span className="mt-0.5 h-0.5 w-5 rounded-full bg-pink-deep" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
