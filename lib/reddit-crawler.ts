/**
 * Reddit API crawler for movie mentions
 * Uses public Reddit API (no OAuth required)
 * Rate limit: ~1 request per 2 seconds
 */

interface RedditPost {
  title: string;
  ups: number;
  downs: number;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

export interface RedditMetrics {
  title: string;
  mentions: number;
  totalEngagement: number;
  topPostScore: number;
}

/**
 * Search Reddit for movie mentions
 * Returns count of posts and engagement metrics
 */
export async function searchReddit(movieTitle: string): Promise<RedditMetrics> {
  // Clean title for search (remove year, special chars)
  const searchQuery = movieTitle
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '+') // Replace spaces with +
    .substring(0, 100); // Limit length

  const subreddits = ['movies', 'TrueFilm', 'flicks'];
  let totalMentions = 0;
  let totalEngagement = 0;
  let topPostScore = 0;

  for (const subreddit of subreddits) {
    try {
      const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${searchQuery}&type=link&sort=relevance&limit=25&t=year`;

      // Use AbortController for timeout (standard fetch doesn't support timeout option)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CrowdAndCritic/1.0 (brand791)',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Reddit API returned ${response.status} for ${subreddit}`);
        continue;
      }

      const data: RedditResponse = await response.json();

      if (data?.data?.children) {
        const posts = data.data.children.map((c) => c.data);

        // Count mentions and engagement
        totalMentions += posts.length;
        const engagement = posts.reduce((sum, post) => sum + (post.ups || 0), 0);
        totalEngagement += engagement;
        const maxScore = Math.max(...posts.map((p) => p.ups || 0));
        topPostScore = Math.max(topPostScore, maxScore);
      }

      // Respect rate limit
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (err) {
      console.warn(`Error searching Reddit/${subreddit} for "${movieTitle}":`, err);
    }
  }

  return {
    title: movieTitle,
    mentions: totalMentions,
    totalEngagement,
    topPostScore,
  };
}

/**
 * Batch search Reddit for multiple movies
 * Respects rate limits by spacing requests
 */
export async function searchRedditBatch(
  titles: string[],
  options: { delayMs?: number; verbose?: boolean } = {}
): Promise<RedditMetrics[]> {
  const { delayMs = 2000, verbose = false } = options;
  const results: RedditMetrics[] = [];

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    if (verbose) {
      console.log(`[${i + 1}/${titles.length}] Searching Reddit for "${title}"...`);
    }

    try {
      const metrics = await searchReddit(title);
      results.push(metrics);

      if (verbose) {
        console.log(`  → ${metrics.mentions} mentions, ${metrics.totalEngagement} total upvotes`);
      }

      // Add delay between searches (except last one)
      if (i < titles.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (err) {
      console.error(`Failed to search for ${title}:`, err);
      results.push({
        title,
        mentions: 0,
        totalEngagement: 0,
        topPostScore: 0,
      });
    }
  }

  return results;
}
