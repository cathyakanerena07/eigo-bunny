import type { Metadata, Viewport } from 'next';
import { DotGothic16 } from 'next/font/google';
import AppShell from '@/components/AppShell';
import './globals.css';

const dot = DotGothic16({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-dot' });

export const metadata: Metadata = {
  title: 'Eigo Bunny',
  description: "Let's grow together. 英語で話すほど、うさぎが育つ。",
  appleWebApp: { capable: true, title: 'Eigo Bunny', statusBarStyle: 'default' },
  icons: { apple: '/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  themeColor: '#dcd9ff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={dot.variable}>
      <body className="min-h-dvh antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
