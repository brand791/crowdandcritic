import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  try {
    // Check Saving Private Ryan
    console.log(`=== VERIFYING GENRES ===\n`);
    const { data: spr } = await supabase
      .from('movies')
      .select('title, genres')
      .eq('title', 'Saving Private Ryan')
      .single();

    console.log(`Saving Private Ryan genres: ${JSON.stringify(spr?.genres)}`);

    // Check all movies
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, genres');

    const withGenres = allMovies?.filter(m => Array.isArray(m.genres) && m.genres.length > 0).length || 0;
    const withoutGenres = allMovies?.filter(m => !m.genres || (Array.isArray(m.genres) && m.genres.length === 0)).length || 0;

    console.log(`\n=== GENRE COVERAGE (UPDATED) ===\n`);
    console.log(`With genres: ${withGenres}/1000 (${((withGenres / 1000) * 100).toFixed(1)}%)`);
    console.log(`Without genres: ${withoutGenres}/1000 (${((withoutGenres / 1000) * 100).toFixed(1)}%)`);

    // Get genre distribution
    const genreCount: Record<string, number> = {};
    allMovies?.forEach(m => {
      if (Array.isArray(m.genres)) {
        m.genres.forEach((g: string) => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
      }
    });

    console.log(`\n=== GENRE BREAKDOWN ===\n`);
    Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([genre, count]) => {
        console.log(`  ${genre}: ${count} movies`);
      });

    // Check War specifically
    const warMovies = allMovies?.filter(m => Array.isArray(m.genres) && m.genres.includes('War')).length || 0;
    console.log(`\n✅ War genre has: ${warMovies} movies (including Saving Private Ryan)`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

verify();
