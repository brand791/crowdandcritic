import { MovieWithScore } from './supabase';

/**
 * Calculate controversy index - how much critics and audiences disagree
 * Positive = audiences like it more, Negative = critics like it more
 */
export function getControversyScore(movie: MovieWithScore): number {
  const score = movie.movie_scores?.[0];
  if (!score || score.rt_tomatometer == null || score.imdb_rating == null) {
    return 0;
  }

  // RT is 0-100, IMDb is already 0-100
  const rtScore = score.rt_tomatometer;
  const imdbScore = score.imdb_rating;

  // Difference: positive = audience likes more, negative = critics like more
  return imdbScore - rtScore;
}

/**
 * Get movies where critics and audiences most disagree
 */
export function getControversyMovies(movies: MovieWithScore[]) {
  return movies
    .filter(m => {
      const score = m.movie_scores?.[0];
      return score && score.rt_tomatometer != null && score.imdb_rating != null;
    })
    .map(m => ({
      movie: m,
      controversy: getControversyScore(m),
    }))
    .sort((a, b) => Math.abs(b.controversy) - Math.abs(a.controversy))
    .slice(0, 50);
}

/**
 * Identify hidden gems - high score, low visibility (vote count)
 */
export function getHiddenGems(movies: MovieWithScore[], minScore = 80) {
  const VISIBILITY_THRESHOLD = 50000; // IMDb vote count threshold

  return movies
    .filter(m => {
      const score = m.movie_scores?.[0];
      return (
        score &&
        score.composite_score &&
        score.composite_score >= minScore &&
        score.imdb_votes &&
        score.imdb_votes < VISIBILITY_THRESHOLD
      );
    })
    .sort((a, b) => (b.movie_scores?.[0]?.composite_score ?? 0) - (a.movie_scores?.[0]?.composite_score ?? 0));
}

/**
 * Group movies by decade and get top N per decade
 */
export function getDecadeRankings(movies: MovieWithScore[], topPerDecade = 10) {
  const decades: { [key: string]: MovieWithScore[] } = {};

  // Group by decade
  movies.forEach(movie => {
    if (!movie.year) return;
    const decade = Math.floor(movie.year / 10) * 10;
    const decadeKey = `${decade}s`;

    if (!decades[decadeKey]) {
      decades[decadeKey] = [];
    }
    decades[decadeKey].push(movie);
  });

  // Sort each decade by score and take top N
  const result: { [key: string]: MovieWithScore[] } = {};
  Object.entries(decades).forEach(([decade, decadeMovies]) => {
    result[decade] = decadeMovies
      .sort((a, b) => (b.movie_scores?.[0]?.composite_score ?? 0) - (a.movie_scores?.[0]?.composite_score ?? 0))
      .slice(0, topPerDecade);
  });

  return result;
}
