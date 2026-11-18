import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'eigo-call — 英語の電話れんしゅう',
    short_name: 'eigo-call',
    description: '相棒と英語で通話して、会議で戦える英語力をつける',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4effb',
    theme_color: '#f4effb',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
