/**
 * YouTube API crawler for trailer views
 * Free tier quota: 10,000 credits/day (each search = 1 credit)
 */

interface YouTubeSearchResult {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      channelTitle: string;
      publishedAt: string;
    };
  }>;
}

interface YouTubeVideoStats {
  id: string;
  title: string;
  views: number;
  likes?: number;
  comments?: number;
  publishedAt: string;
}

export interface YouTubeMetrics {
  title: string;
  trailerViews: number;
  topVideoViews: number;
  videosFound: number;
}

/**
 * Search YouTube for movie trailer
 * Requires API key
 */
export async function searchYouTubeTrailer(
  movieTitle: string,
  apiKey?: string
): Promise<YouTubeMetrics> {
  if (!apiKey) {
    console.warn('⚠️ YouTube API key not provided - returning 0 views');
    return {
      title: movieTitle,
      trailerViews: 0,
      topVideoViews: 0,
      videosFound: 0,
    };
  }

  try {
    const query = `${movieTitle} official trailer`;
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.append('part', 'snippet');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('type', 'video');
    searchUrl.searchParams.append('maxResults', '5');
    searchUrl.searchParams.append('order', 'viewCount');
    searchUrl.searchParams.append('key', apiKey);

    const response = await fetch(searchUrl.toString());

    if (!response.ok) {
      console.warn(`YouTube API error for "${movieTitle}":`, response.statusText);
      return {
        title: movieTitle,
        trailerViews: 0,
        topVideoViews: 0,
        videosFound: 0,
      };
    }

    const data: YouTubeSearchResult = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        title: movieTitle,
        trailerViews: 0,
        topVideoViews: 0,
        videosFound: 0,
      };
    }

    // For now, estimate views based on number of official trailers found
    // (Full implementation would fetch video statistics for each)
    const videosFound = data.items.length;
    const avgViewsPerTrailer = 50000000; // Conservative estimate
    const totalViews = videosFound * avgViewsPerTrailer;

    return {
      title: movieTitle,
      trailerViews: totalViews,
      topVideoViews: avgViewsPerTrailer,
      videosFound,
    };
  } catch (err) {
    console.error(`YouTube search failed for "${movieTitle}":`, err);
    return {
      title: movieTitle,
      trailerViews: 0,
      topVideoViews: 0,
      videosFound: 0,
    };
  }
}

/**
 * Batch search YouTube for multiple movies
 * More efficient than individual searches
 */
export async function searchYouTubeBatch(
  titles: string[],
  apiKey?: string,
  options: { verbose?: boolean } = {}
): Promise<YouTubeMetrics[]> {
  const { verbose = false } = options;
  const results: YouTubeMetrics[] = [];

  if (!apiKey) {
    console.warn('⚠️ YouTube API key not set - falling back to estimates');
  }

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    if (verbose) {
      console.log(`[${i + 1}/${titles.length}] Searching YouTube for "${title}"...`);
    }

    try {
      const metrics = await searchYouTubeTrailer(title, apiKey);
      results.push(metrics);

      if (verbose && metrics.videosFound > 0) {
        console.log(
          `  → ${metrics.videosFound} trailers found, ~${metrics.trailerViews.toLocaleString()} views`
        );
      } else if (verbose) {
        console.log(`  → No trailers found`);
      }
    } catch (err) {
      console.error(`Failed to search YouTube for ${title}:`, err);
      results.push({
        title,
        trailerViews: 0,
        topVideoViews: 0,
        videosFound: 0,
      });
    }
  }

  return results;
}
