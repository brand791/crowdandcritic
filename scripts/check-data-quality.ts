import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDataQuality() {
  console.log('═'.repeat(100));
  console.log('DATA QUALITY CHECK');
  console.log('═'.repeat(100) + '\n');

  // Count total movies
  console.log('📊 Step 1: Count total movies');
  const { data: allMovies } = await supabase
    .from('movies')
    .select('id');
  
  console.log(`✅ Total movies in DB: ${allMovies?.length || 0}\n`);

  // Check for duplicates
  console.log('🔍 Step 2: Check for duplicates (same title + year)');
  const { data: movies } = await supabase
    .from('movies')
    .select('id, title, year')
    .order('title');
  
  const titleYearMap: Record<string, string[]> = {};
  const duplicates: string[] = [];
  
  movies?.forEach(m => {
    const key = `${m.title}|${m.year}`;
    if (titleYearMap[key]) {
      titleYearMap[key].push(m.id);
      duplicates.push(key);
    } else {
      titleYearMap[key] = [m.id];
    }
  });
  
  console.log(`Found ${duplicates.length} movies with duplicate titles/years\n`);
  if (duplicates.length > 0) {
    console.log('Sample duplicates:');
    duplicates.slice(0, 10).forEach(d => {
      const ids = titleYearMap[d];
      console.log(`  ⚠️  "${d}" (${ids.length} copies: ${ids.join(', ')})`);
    });
    console.log();
  }

  // Check for zero scores
  console.log('📈 Step 3: Check score distribution');
  const { data: scores } = await supabase
    .from('movie_scores')
    .select('composite_score, movies(title, year)');
  
  const zeroScores = scores?.filter(s => s.composite_score === 0) || [];
  const nullScores = scores?.filter(s => s.composite_score === null) || [];
  
  console.log(`Movies with composite_score = 0: ${zeroScores.length}`);
  console.log(`Movies with composite_score = null: ${nullScores.length}`);
  
  if (zeroScores.length > 0) {
    console.log('\nSample zero-score movies:');
    zeroScores.slice(0, 5).forEach(s => {
      const m = s.movies as any;
      console.log(`  - "${m.title}" (${m.year})`);
    });
  }
  console.log();

  // Score distribution
  const scoreRanges: Record<string, number> = {
    'null/undefined': 0,
    '0': 0,
    '1-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0,
  };
  
  scores?.forEach(s => {
    if (s.composite_score === null || s.composite_score === undefined) scoreRanges['null/undefined']++;
    else if (s.composite_score === 0) scoreRanges['0']++;
    else if (s.composite_score <= 20) scoreRanges['1-20']++;
    else if (s.composite_score <= 40) scoreRanges['21-40']++;
    else if (s.composite_score <= 60) scoreRanges['41-60']++;
    else if (s.composite_score <= 80) scoreRanges['61-80']++;
    else scoreRanges['81-100']++;
  });
  
  console.log('Score distribution:');
  Object.entries(scoreRanges).forEach(([range, count]) => {
    const pct = scores ? ((count / scores.length) * 100).toFixed(1) : '0';
    console.log(`  ${range.padEnd(15)}: ${count.toString().padStart(3)} (${pct}%)`);
  });

  console.log('\n' + '═'.repeat(100));
  console.log('✅ DATA QUALITY CHECK COMPLETE');
  console.log('═'.repeat(100));
}

checkDataQuality().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
