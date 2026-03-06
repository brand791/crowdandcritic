import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoverage() {
  console.log('🔍 Checking coverage criteria...\n');

  // Get all movies with their scores
  const { data: all, error: allError } = await supabase
    .from('movies')
    .select(`
      id,
      title,
      year,
      movie_scores (
        composite_score,
        imdb_rating,
        rt_tomatometer
      )
    `)
    .order('title');

  if (allError) {
    console.error('Error fetching movies:', allError);
    return;
  }

  const movies: any[] = all || [];
  console.log(`Total movies in DB: ${movies.length}\n`);

  // Find movies that SHOULD be included by our criteria
  let shouldIncludeImdb70 = 0;
  let shouldIncludeRT80 = 0;
  let actuallyIncluded = 0;
  const missingImdb70: any[] = [];
  const missingRT80: any[] = [];

  movies.forEach((m: any) => {
    const scores = Array.isArray(m.movie_scores) ? m.movie_scores[0] : m.movie_scores;
    if (!scores) return;

    const imdbRating = scores.imdb_rating;
    const rtScore = scores.rt_tomatometer;
    const hasComposite = scores.composite_score !== null;

    // Check IMDb 7.0+
    if (imdbRating !== null && imdbRating >= 7.0) {
      shouldIncludeImdb70++;
      if (!hasComposite) {
        missingImdb70.push({ title: m.title, year: m.year, imdb: imdbRating });
      }
    }

    // Check RT 80%+
    if (rtScore !== null && rtScore >= 80) {
      shouldIncludeRT80++;
      if (!hasComposite) {
        missingRT80.push({ title: m.title, year: m.year, rt: rtScore });
      }
    }

    if (hasComposite) {
      actuallyIncluded++;
    }
  });

  console.log(`📊 COVERAGE ANALYSIS\n`);
  console.log(`Movies that SHOULD be included (IMDb 7.0+): ${shouldIncludeImdb70}`);
  console.log(`Movies that SHOULD be included (RT 80%+): ${shouldIncludeRT80}`);
  console.log(`Movies ACTUALLY included (have composite score): ${actuallyIncluded}\n`);

  if (missingImdb70.length > 0) {
    console.log(`⚠️  MISSING: IMDb 7.0+ but no composite score (${missingImdb70.length} movies)`);
    missingImdb70.slice(0, 10).forEach((m: any) => {
      console.log(`   - ${m.title} (${m.year}): IMDb ${m.imdb}`);
    });
    if (missingImdb70.length > 10) console.log(`   ... and ${missingImdb70.length - 10} more`);
  }

  if (missingRT80.length > 0) {
    console.log(`\n⚠️  MISSING: RT 80%+ but no composite score (${missingRT80.length} movies)`);
    missingRT80.slice(0, 10).forEach((m: any) => {
      console.log(`   - ${m.title} (${m.year}): RT ${m.rt}%`);
    });
    if (missingRT80.length > 10) console.log(`   ... and ${missingRT80.length - 10} more`);
  }

  // Combined analysis
  const combined = new Set([
    ...missingImdb70.map(m => `${m.title}(${m.year})`),
    ...missingRT80.map(m => `${m.title}(${m.year})`)
  ]);
  
  console.log(`\n📈 SUMMARY`);
  console.log(`Coverage: ${actuallyIncluded} / ${shouldIncludeImdb70 + shouldIncludeRT80} = ${((actuallyIncluded / (shouldIncludeImdb70 + shouldIncludeRT80)) * 100).toFixed(1)}%`);
  console.log(`Total gaps: ${combined.size} unique movies`);
}

checkCoverage();
