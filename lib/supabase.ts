import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching our DB schema
export interface Movie {
  id: string;
  title: string;
  year: number;
  imdb_id: string | null;
  tmdb_id: number | null;
  poster_url: string | null;
  genres: string[] | null;
  director: string | null;
  runtime_minutes: number | null;
  plot: string | null;
  created_at: string;
}

export interface MovieScore {
  id: string;
  movie_id: string;
  rt_tomatometer: number | null;
  metacritic_score: number | null;
  imdb_rating: number | null;
  rt_audience: number | null;
  metacritic_user: number | null;
  imdb_votes: number | null;
  canon_appearances: number;
  critic_score: number | null;
  audience_score: number | null;
  canon_score: number | null;
  longevity_bonus: number | null;
  popularity_weight: number | null;
  composite_score: number | null;
  updated_at: string;
}

export interface CanonList {
  id: string;
  movie_id: string;
  list_name: string;
  rank_on_list: number | null;
}

export interface MovieWithScore extends Movie {
  movie_scores: MovieScore[];
  canon_lists: CanonList[];
}

export async function getTopMovies(limit = 100): Promise<MovieWithScore[]> {
  // Fetch more than the limit to ensure we have enough scored movies after filtering
  const { data, error } = await supabase
    .from('movies')
    .select(`
      *,
      movie_scores (*),
      canon_lists (*)
    `)
    .not('movie_scores', 'is', null)
    .limit(limit * 2); // Fetch 2x to account for any anomalies

  if (error) {
    console.error('Error fetching movies:', error);
    return [];
  }

  // Normalize movie_scores to always be an array, then sort by composite score
  const normalized = (data as MovieWithScore[]).map((m) => ({
    ...m,
    movie_scores: m.movie_scores
      ? Array.isArray(m.movie_scores)
        ? m.movie_scores
        : [m.movie_scores]
      : [],
  }));

  // Sort by composite score descending, then by title for movies with same score
  const sorted = normalized.sort((a, b) => {
    const scoreA = (a.movie_scores as MovieScore[])?.[0]?.composite_score ?? 0;
    const scoreB = (b.movie_scores as MovieScore[])?.[0]?.composite_score ?? 0;
    if (Math.abs(scoreB - scoreA) > 0.01) {
      return scoreB - scoreA;
    }
    return a.title.localeCompare(b.title);
  });

  // Return exactly `limit` movies
  return sorted.slice(0, limit);
}

export async function getMovieById(id: string): Promise<MovieWithScore | null> {
  const { data, error } = await supabase
    .from('movies')
    .select(`
      *,
      movie_scores (*),
      canon_lists (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching movie:', error);
    return null;
  }

  const movie = data as MovieWithScore;
  return {
    ...movie,
    movie_scores: movie.movie_scores
      ? Array.isArray(movie.movie_scores)
        ? movie.movie_scores
        : [movie.movie_scores]
      : [],
  };
}
