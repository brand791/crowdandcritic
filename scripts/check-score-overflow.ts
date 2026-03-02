import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkOverflow() {
  console.log('Checking for score overflow...\n');

  const { data: scores } = await supabase
    .from('movie_scores')
    .select('composite_score, critic_score, audience_score, canon_score, popularity_weight, longevity_bonus, movies(title, year)')
    .order('composite_score', { ascending: false })
    .limit(20);

  console.log('Top 20 scores:\n');
  console.log('Rank  Title                          Year  Critic  Audience Canon  Pop    Longevity Composite');
  console.log('─'.repeat(100));

  scores?.forEach((s, i) => {
    const m = s.movies as any;
    const title = `${m.title} (${m.year})`.substring(0, 32).padEnd(32);
    console.log(
      `${(i+1).toString().padEnd(4)} ${title} ${s.critic_score?.toFixed(1).padStart(5)} ${s.audience_score?.toFixed(1).padStart(8)} ${s.canon_score?.toFixed(1).padStart(5)} ${s.popularity_weight?.toFixed(1).padStart(5)} ${s.longevity_bonus?.toFixed(1).padStart(9)} ${s.composite_score?.toFixed(1).padStart(10)}`
    );
  });

  // Check for > 100
  const { data: overflowScores } = await supabase
    .from('movie_scores')
    .select('composite_score, movies(title, year)')
    .gt('composite_score', 100);

  console.log(`\n\nMovies with composite_score > 100: ${overflowScores?.length || 0}`);
  if (overflowScores && overflowScores.length > 0) {
    overflowScores.slice(0, 10).forEach(s => {
      const m = s.movies as any;
      console.log(`  - "${m.title}" (${m.year}): ${s.composite_score}`);
    });
  }
}

checkOverflow().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
