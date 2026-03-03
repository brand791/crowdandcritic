import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * v4 Scoring Formula
 * Score = (Rotten Tomatoes × 0.50) + (IMDb × 0.50)
 * 
 * Both scores normalized to 0-100 scale
 * Skips movies with missing either score
 */
async function applyV4Scoring(): Promise<void> {
  console.log('📊 Applying v4 Scoring Formula (50% RT + 50% IMDb)...\n');

  // Get all movies with their scores
  const { data: movies, error: fetchError } = await supabase
    .from('movies')
    .select(`
      id,
      title,
      year,
      movie_scores (
        imdb_rating,
        rt_tomatometer
      )
    `)
    .order('created_at', { ascending: false });

  if (fetchError || !movies) {
    console.error('Error fetching movies:', fetchError);
    return;
  }

  console.log(`Found ${movies.length} movies\n`);

  let scoredCount = 0;
  let skippedCount = 0;
  const updates: Array<{ id: string; composite_score: number }> = [];

  for (const movie of movies) {
    // Handle both array and object returns from Supabase
    const scores = Array.isArray(movie.movie_scores)
      ? movie.movie_scores[0]
      : movie.movie_scores;

    // Skip if missing either score (Option B)
    if (!scores || scores.imdb_rating == null || scores.rt_tomatometer == null) {
      console.log(`⏭️  ${movie.title} (${movie.year}) - Missing score`);
      skippedCount++;
      continue;
    }

    const imdb = scores.imdb_rating;
    const rt = scores.rt_tomatometer;

    // v4 Formula: 50% RT + 50% IMDb
    const compositeScore = (rt * 0.5) + (imdb * 0.5);

    updates.push({
      id: movie.id,
      composite_score: Math.round(compositeScore * 10) / 10, // Round to 1 decimal
    });

    console.log(
      `✅ ${movie.title} (${movie.year}) - RT: ${rt}, IMDb: ${imdb.toFixed(1)} → v4: ${compositeScore.toFixed(1)}`
    );
    scoredCount++;
  }

  // Batch update scores
  if (updates.length > 0) {
    console.log(`\n💾 Updating ${updates.length} movies in database...\n`);

    const { error: updateError } = await supabase
      .from('movie_scores')
      .upsert(
        updates.map(u => ({
          movie_id: u.id,
          composite_score: u.composite_score,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'movie_id' }
      );

    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`   Scored: ${scoredCount} movies`);
  console.log(`   Skipped: ${skippedCount} movies (missing scores)`);
  if (scoredCount > 0) {
    console.log(`   Coverage: ${((scoredCount / (scoredCount + skippedCount)) * 100).toFixed(1)}%`);
  }
}

applyV4Scoring().catch(console.error);
