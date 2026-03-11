import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyze() {
  try {
    // Get all movies with scores 50-60 (lowest tier)
    console.log(`=== LOWEST SCORING FILMS (50-60 range) ===\n`);
    
    const { data: lowScores } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(title, year)')
      .gte('composite_score', 50)
      .lte('composite_score', 60)
      .order('composite_score', { ascending: true });

    console.log(`Found: ${lowScores?.length} films in 50-60 range\n`);
    
    lowScores?.slice(0, 30).forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

    if ((lowScores?.length || 0) > 30) {
      console.log(`  ... and ${(lowScores?.length || 0) - 30} more`);
    }

    // Count by year
    const byYear: Record<number, number> = {};
    lowScores?.forEach((m: any) => {
      const year = (m.movies as any)?.year;
      byYear[year] = (byYear[year] || 0) + 1;
    });

    console.log(`\n=== BREAKDOWN BY YEAR ===`);
    Object.keys(byYear).sort((a, b) => parseInt(b) - parseInt(a)).slice(0, 15).forEach(year => {
      console.log(`  ${year}: ${byYear[parseInt(year)]}`);
    });

    // Candidates for removal (modern blockbusters scoring 50-55)
    const candidates = lowScores?.filter((m: any) => {
      const year = (m.movies as any)?.year;
      return m.composite_score <= 55 && year >= 2010;
    }) || [];

    console.log(`\n=== CANDIDATES FOR REMOVAL (modern films, score ≤55) ===`);
    console.log(`Total: ${candidates.length}\n`);
    candidates.slice(0, 15).forEach((m: any) => {
      const mov = Array.isArray(m.movies) ? m.movies[0] : m.movies;
      console.log(`  ${mov?.title} (${mov?.year}): ${m.composite_score}`);
    });

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

analyze();
