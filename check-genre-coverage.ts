import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Check Saving Private Ryan
    console.log(`=== CHECKING SAVING PRIVATE RYAN ===\n`);
    const { data: spr } = await supabase
      .from('movies')
      .select('id, title, year, genres')
      .eq('title', 'Saving Private Ryan')
      .single();

    if (spr) {
      console.log(`Title: ${spr.title} (${spr.year})`);
      console.log(`Genres stored: ${JSON.stringify(spr.genres)}`);
      console.log(`Genre count: ${Array.isArray(spr.genres) ? spr.genres.length : 0}`);
    }

    // Check all movies without genres
    const { data: allMovies } = await supabase
      .from('movies')
      .select('id, title, year, genres');

    const withoutGenres = allMovies?.filter(m => !m.genres || (Array.isArray(m.genres) && m.genres.length === 0)) || [];
    const withGenres = allMovies?.filter(m => Array.isArray(m.genres) && m.genres.length > 0) || [];

    console.log(`\n=== GENRE COVERAGE ANALYSIS ===\n`);
    console.log(`Total movies: ${allMovies?.length}`);
    console.log(`With genres: ${withGenres.length}`);
    console.log(`Without genres: ${withoutGenres.length} (${((withoutGenres.length / (allMovies?.length || 1)) * 100).toFixed(1)}%)\n`);

    if (withoutGenres.length > 0) {
      console.log(`Sample movies missing genres:`);
      withoutGenres.slice(0, 15).forEach(m => {
        console.log(`  - ${m.title} (${m.year})`);
      });
    }

    // Check genre distribution
    const genreCount: Record<string, number> = {};
    withGenres.forEach(m => {
      if (Array.isArray(m.genres)) {
        m.genres.forEach(g => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
      }
    });

    console.log(`\n=== GENRE DISTRIBUTION ===\n`);
    Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([genre, count]) => {
        console.log(`  ${genre}: ${count} movies`);
      });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
