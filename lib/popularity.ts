/**
 * Popularity scoring module
 * Combines Reddit mentions and YouTube trailer views into a 0-5 score
 */

export interface PopularityData {
  movie_id: string;
  title: string;
  reddit_mentions: number;
  reddit_score: number; // 0-5
  youtube_views: number;
  youtube_score: number; // 0-5
  popularity_score: number; // 0-5 weighted average
}

/**
 * Calculate Reddit engagement score (0-5)
 * Based on number of mentions/posts in /r/movies
 * Uses logarithmic scale to handle outliers
 */
export function calculateRedditScore(mentions: number): number {
  if (mentions === 0) return 0;
  // Log scale: log(mentions) / log(10000) * 5
  // This gives: 1 mention = 0.75, 10 = 1.5, 100 = 2.25, 1000 = 3.0, 10000+ = 5.0
  const score = (Math.log(mentions + 1) / Math.log(10000)) * 5;
  return Math.min(Math.round(score * 100) / 100, 5);
}

/**
 * Calculate YouTube engagement score (0-5)
 * Based on trailer view counts
 * Uses logarithmic scale
 */
export function calculateYouTubeScore(views: number): number {
  if (views === 0) return 0;
  // Log scale: log(views) / log(100M) * 5
  // This gives: 1M = 1.67, 10M = 2.5, 100M = 3.33, 1B+ = 5.0
  const score = (Math.log(views + 1) / Math.log(100000000)) * 5;
  return Math.min(Math.round(score * 100) / 100, 5);
}

/**
 * Calculate combined popularity score
 * Weighted: Reddit 60%, YouTube 40%
 * (Reddit discussions more meaningful than raw view counts)
 */
export function calculatePopularityScore(
  redditMentions: number,
  youtubeViews: number
): number {
  const redditScore = calculateRedditScore(redditMentions);
  const youtubeScore = calculateYouTubeScore(youtubeViews);

  // Weight: Reddit 60% (more authentic engagement), YouTube 40% (reach metric)
  const combined = redditScore * 0.6 + youtubeScore * 0.4;
  return Math.round(combined * 100) / 100;
}

/**
 * Format popularity data for logging
 */
export function formatPopularityDebug(data: PopularityData): string {
  return `
${data.title}:
  Reddit: ${data.reddit_mentions} mentions → ${data.reddit_score}/5
  YouTube: ${data.youtube_views.toLocaleString()} views → ${data.youtube_score}/5
  Final Score: ${data.popularity_score}/5
  `.trim();
}
