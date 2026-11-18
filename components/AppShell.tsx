'use client';

import { usePathname } from 'next/navigation';
import TabBar from '@/components/TabBar';

// The chat is a focused, full-screen mode — no tab bar competing with the input.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const focused = pathname.startsWith('/chat/');

  return (
    <>
      <div className={focused ? '' : 'pb-[76px]'}>{children}</div>
      {!focused && <TabBar />}
    </>
  );
}
