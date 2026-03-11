import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rlnkmresgszqiyaamcfp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsbmttcmVzZ3N6cWl5YWFtY2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU3MzAsImV4cCI6MjA4NzUyMTczMH0.FXrZdsvzqIsgebOyblp9RqFSFhDtOH7ohp3iON_3z1Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function stats() {
  try {
    const { data: all } = await supabase
      .from('movie_scores')
      .select('composite_score, movies(year)');

    console.log(`\n=== THE DEFINITIVE 1000 GREATEST FILMS OF ALL TIME ===\n`);
    console.log(`Total movies: ${all?.length}\n`);

    // Score stats
    const sorted = (all || []).sort((a, b) => (a.composite_score || 0) - (b.composite_score || 0));
    console.log(`Score range: ${sorted[0]?.composite_score} to ${sorted[sorted.length - 1]?.composite_score}`);

    // Count by score bracket
    const brackets = {
      '90+': 0,
      '85-89': 0,
      '80-84': 0,
      '75-79': 0,
      '70-74': 0,
      '65-69': 0,
      '60-64': 0,
      '55-59': 0,
      '50-54': 0,
    };

    all?.forEach(m => {
      const score = m.composite_score || 0;
      if (score >= 90) brackets['90+']++;
      else if (score >= 85) brackets['85-89']++;
      else if (score >= 80) brackets['80-84']++;
      else if (score >= 75) brackets['75-79']++;
      else if (score >= 70) brackets['70-74']++;
      else if (score >= 65) brackets['65-69']++;
      else if (score >= 60) brackets['60-64']++;
      else if (score >= 55) brackets['55-59']++;
      else brackets['50-54']++;
    });

    console.log(`\nScore distribution:`);
    Object.entries(brackets).forEach(([bracket, count]) => {
      const pct = ((count / (all?.length || 1)) * 100).toFixed(1);
      console.log(`  ${bracket}: ${count} (${pct}%)`);
    });

    // Era distribution
    const eras: Record<string, number> = {};
    all?.forEach(m => {
      const year = (m.movies as any)?.year;
      if (year) {
        const era = Math.floor(year / 10) * 10;
        eras[era] = (eras[era] || 0) + 1;
      }
    });

    console.log(`\nCoverage by decade:`);
    Object.keys(eras).sort((a, b) => parseInt(b) - parseInt(a)).slice(0, 15).forEach(era => {
      console.log(`  ${era}s: ${eras[parseInt(era)]}`);
    });

    console.log(`\n✅ The world's greatest films are ranked at www.crowdandcritic.com`);

  } catch (err) {
    console.error('Exception:', err);
  }
  
  process.exit(0);
}

stats();
