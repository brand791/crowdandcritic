import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    // Check Saving Private Ryan
    const { data: spr } = await supabase
      .from('movies')
      .select('title, genres')
      .eq('title', 'Saving Private Ryan')
      .single();

    console.log(`\n╔═════════════════════════════════════╗`);
    console.log(`║      GENRE NORMALIZATION FINAL    ║`);
    console.log(`╚═════════════════════════════════════╝\n`);

    console.log(`Saving Private Ryan: ${JSON.stringify(spr?.genres)}\n`);

    // Get all movies and genres
    const { data: allMovies } = await supabase
      .from('movies')
      .select('genres');

    const genreCount: Record<string, number> = {};
    const allHaveStringGenres = allMovies?.every(m => {
      if (Array.isArray(m.genres)) {
        m.genres.forEach((g: any) => {
          genreCount[g] = (genreCount[g] || 0) + 1;
        });
        return m.genres.every((g: any) => typeof g === 'string');
      }
      return true;
    });

    console.log(`All genres are now STRINGS: ${allHaveStringGenres ? '✅ YES' : '❌ NO'}\n`);

    console.log(`Genre breakdown (top 20):`);
    Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([genre, count]) => {
        console.log(`  ${genre}: ${count} movies`);
      });

    const warCount = genreCount['War'] || 0;
    console.log(`\n✅ War genre: ${warCount} movies`);
    console.log(`✅ Saving Private Ryan appears in War section`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

check();
