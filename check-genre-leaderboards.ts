import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Get all movies with genres
    const { data: movies } = await supabase
      .from('movies')
      .select('id, title, year, genres, poster_url, director, movie_scores(composite_score)')
      .not('genres', 'is', null);

    if (!movies) {
      console.log('No movies found');
      process.exit(0);
    }

    console.log(`=== GENRE LEADERBOARDS ANALYSIS ===\n`);
    console.log(`Total movies: ${movies.length}\n`);

    // Group by genre
    const genres: { [key: string]: any[] } = {};

    movies.forEach(movie => {
      if (!Array.isArray(movie.genres) || movie.genres.length === 0) return;

      movie.genres.forEach((genreId: any) => {
        const genreName = typeof genreId === 'string' ? genreId : genreId.toString();
        
        if (!genres[genreName]) {
          genres[genreName] = [];
        }
        genres[genreName].push(movie);
      });
    });

    console.log(`Total genres: ${Object.keys(genres).length}\n`);

    // Sort by movie count
    Object.entries(genres)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([genre, genreMovies]) => {
        console.log(`${genre}: ${genreMovies.length} movies`);
      });

    // Check for issues
    console.log(`\n=== POTENTIAL ISSUES ===\n`);
    
    let emptyGenres = 0;
    Object.entries(genres).forEach(([genre, movies]) => {
      if (movies.length === 0) {
        console.log(`❌ ${genre} has 0 movies`);
        emptyGenres++;
      }
    });

    if (emptyGenres === 0) {
      console.log(`✅ All genres have movies`);
    }

    // Check if movies are properly sorted
    console.log(`\n=== TOP 5 MOVIES BY GENRE (sample: Drama) ===\n`);
    const dramaMovies = genres['Drama'] || [];
    dramaMovies
      .sort((a, b) => {
        const scoreA = (a.movie_scores as any)?.[0]?.composite_score || 0;
        const scoreB = (b.movie_scores as any)?.[0]?.composite_score || 0;
        return scoreB - scoreA;
      })
      .slice(0, 5)
      .forEach((m, idx) => {
        const score = (m.movie_scores as any)?.[0]?.composite_score || 0;
        console.log(`${idx + 1}. ${m.title} (${m.year}): ${score}`);
      });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
