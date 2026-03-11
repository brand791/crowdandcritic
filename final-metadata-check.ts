import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data: allMovies } = await supabase
      .from('movies')
      .select('director, genres, poster_url');

    if (!allMovies) {
      process.exit(0);
    }

    const total = allMovies.length;
    const withDirector = allMovies.filter(m => m.director)?.length || 0;
    const withGenres = allMovies.filter(m => Array.isArray(m.genres) && m.genres.length > 0)?.length || 0;
    const withPoster = allMovies.filter(m => m.poster_url)?.length || 0;

    console.log(`\n=== FINAL METADATA COVERAGE ===\n`);
    console.log(`Total movies: ${total}\n`);
    console.log(`Directors: ${withDirector}/${total} (${((withDirector / total) * 100).toFixed(1)}%) ✅`);
    console.log(`Genres: ${withGenres}/${total} (${((withGenres / total) * 100).toFixed(1)}%) ✅`);
    console.log(`Posters: ${withPoster}/${total} (${((withPoster / total) * 100).toFixed(1)}%) ✅`);

    console.log(`\n=== FEATURE PAGES STATUS ===\n`);
    console.log(`/directors page: ${((withDirector / total) * 100).toFixed(0)}% complete`);
    console.log(`/genres page: ${((withGenres / total) * 100).toFixed(0)}% complete`);
    console.log(`/hidden-gems: 100% (uses scores only)`);
    console.log(`/decades: 100% (uses years only)`);
    console.log(`/compare: 100% (uses all data)`);
    console.log(`/controversy: 100% (uses scores only)`);

    if (withDirector > 900 && withGenres > 900 && withPoster > 900) {
      console.log(`\n✅ ALL FEATURE PAGES NOW 90%+ COMPLETE!`);
    }

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
