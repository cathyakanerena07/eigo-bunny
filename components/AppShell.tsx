'use client';

import { usePathname } from 'next/navigation';
import TabBar from '@/components/TabBar';
import { useAppState } from '@/lib/useAppState';
import { useBgm } from '@/lib/useBgm';

// The chat is a focused, full-screen mode — no tab bar competing with the input.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const focused = pathname.startsWith('/chat/');
  const { state } = useAppState();
  // The music lives up here so switching tabs never changes anything.
  useBgm(state?.settings.bgm ?? false);

  return (
    <>
      {!focused && <span className="safe-cap" aria-hidden />}
      <div className={focused ? '' : 'safe-gap pb-[calc(76px+env(safe-area-inset-bottom))]'}>
        {children}
      </div>
      {!focused && <TabBar />}
    </>
  );
}
