/**
 * Client-side analytics for tracking affiliate clicks and user interactions
 */

export function trackAffiliateClick(platform: 'amazon' | 'justwatch' | 'imdb', movieTitle: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'affiliate_click', {
      platform,
      movie: movieTitle,
      timestamp: new Date().toISOString(),
    });
  }
}

export function trackPageView(pageName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      page_path: window.location.pathname,
    });
  }
}

// Extend window type to include gtag
declare global {
  interface Window {
    gtag: any;
  }
}
