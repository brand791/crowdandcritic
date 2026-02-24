import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://crowdandcritic.com'),
  title: 'CrowdAndCritic — The Definitive Movie Ranking',
  description:
    'The most comprehensive movie ranking, combining critic scores, audience ratings, and canonical list appearances into one composite score.',
  openGraph: {
    title: 'CrowdAndCritic',
    description: 'The definitive movie ranking combining critics, audiences, and canon.',
    type: 'website',
    url: 'https://crowdandcritic.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CrowdAndCritic',
    description: 'The definitive movie ranking.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0a] text-[#e8e8e8] antialiased">
        <nav className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <a href="/" className="flex items-center gap-2 group">
                <span className="text-[#f5a623] text-xl">🎬</span>
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-[#f5a623] transition-colors">
                  CrowdAndCritic
                </span>
              </a>
              <div className="flex items-center gap-6 text-sm text-[#888]">
                <a href="/" className="hover:text-[#f5a623] transition-colors">Rankings</a>
                <a href="#about" className="hover:text-[#f5a623] transition-colors">About</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="mt-20 border-t border-[#1a1a1a] py-10 text-center text-sm text-[#555]">
          <div className="mx-auto max-w-7xl px-4">
            <p className="mb-2">
              <span className="text-[#f5a623] font-semibold">CrowdAndCritic</span> — The definitive movie ranking
            </p>
            <p>Scores sourced from Rotten Tomatoes, Metacritic, IMDb, and canonical film lists.</p>
            <p className="mt-3 text-xs text-[#333]">
              © {new Date().getFullYear()} CrowdAndCritic. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
