import { MovieWithScore } from './supabase';

// TMDB Genre ID to Name mapping
const GENRE_NAMES: { [key: number]: string } = {
  12: 'Adventure',
  14: 'Fantasy',
  16: 'Animation',
  18: 'Drama',
  27: 'Horror',
  28: 'Action',
  35: 'Comedy',
  36: 'History',
  37: 'Western',
  53: 'Thriller',
  80: 'Crime',
  99: 'Documentary',
  878: 'Science Fiction',
  9648: 'Mystery',
  10402: 'Music',
  10749: 'Romance',
  10751: 'Family',
  10752: 'War',
  10770: 'TV Movie',
};

function getGenreName(genreId: number | string): string {
  const id = typeof genreId === 'string' ? parseInt(genreId, 10) : genreId;
  return GENRE_NAMES[id] || `Genre ${id}`;
}

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
  const VISIBILITY_THRESHOLD = 25000; // IMDb vote count threshold (lowered to 25K for more hidden gems)

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

/**
 * Get genre leaderboards - top N movies per genre
 */
export function getGenreLeaderboards(movies: MovieWithScore[], topPerGenre = 20) {
  const genres: { [key: string]: MovieWithScore[] } = {};

  // Group by genre
  movies.forEach(movie => {
    if (!movie.genres || movie.genres.length === 0) return;
    
    movie.genres.forEach(genreId => {
      const genreName = getGenreName(genreId);
      if (!genres[genreName]) {
        genres[genreName] = [];
      }
      genres[genreName].push(movie);
    });
  });

  // Sort each genre by score and take top N
  const result: { [key: string]: MovieWithScore[] } = {};
  Object.entries(genres)
    .sort((a, b) => a[0].localeCompare(b[0])) // Sort genres alphabetically
    .forEach(([genre, genreMovies]) => {
      result[genre] = genreMovies
        .sort((a, b) => (b.movie_scores?.[0]?.composite_score ?? 0) - (a.movie_scores?.[0]?.composite_score ?? 0))
        .slice(0, topPerGenre);
    });

  return result;
}

/**
 * Get director scorecards with average rating
 */
export interface DirectorStats {
  name: string;
  movieCount: number;
  averageScore: number;
  movies: MovieWithScore[];
}

export function getDirectorScores(movies: MovieWithScore[]): DirectorStats[] {
  const directors: { [key: string]: MovieWithScore[] } = {};

  // Group by director
  movies.forEach(movie => {
    if (!movie.director) return;
    if (!directors[movie.director]) {
      directors[movie.director] = [];
    }
    directors[movie.director].push(movie);
  });

  // Calculate stats for each director
  const stats: DirectorStats[] = Object.entries(directors).map(([name, directorMovies]) => {
    const scores = directorMovies
      .map(m => m.movie_scores?.[0]?.composite_score ?? 0)
      .filter(s => s > 0);

    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      name,
      movieCount: directorMovies.length,
      averageScore,
      movies: directorMovies.sort((a, b) => (b.movie_scores?.[0]?.composite_score ?? 0) - (a.movie_scores?.[0]?.composite_score ?? 0)),
    };
  });

  // Sort by movie count (descending), then by average score as tiebreaker
  return stats.sort((a, b) => {
    // Primary sort: movie count (most movies first)
    if (a.movieCount !== b.movieCount) {
      return b.movieCount - a.movieCount;
    }
    // Tiebreaker: average score (highest average first)
    return b.averageScore - a.averageScore;
  });
}
