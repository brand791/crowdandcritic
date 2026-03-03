'use client';

import { trackAffiliateClick } from '@/lib/analytics-client';

interface AffiliateLinkProps {
  href: string;
  children: React.ReactNode;
  className: string;
  platform: 'amazon' | 'justwatch' | 'imdb';
  movieTitle: string;
}

export function AffiliateLink({
  href,
  children,
  className,
  platform,
  movieTitle,
}: AffiliateLinkProps) {
  const handleClick = () => {
    trackAffiliateClick(platform, movieTitle);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
