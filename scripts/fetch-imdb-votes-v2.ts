/**
 * Fetch IMDb vote counts from OMDB for all scored movies
 * Run with: npx ts-node scripts/fetch-imdb-votes-v2.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const omdbApiKey = process.env.OMDB_API_KEY || '';

if (!omdbApiKey) {
  console.error('❌ OMDB_API_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const OMDB_BASE_URL = 'http://www.omdbapi.com';

async function getOMDBVotes(title: string, year: number): Promise<number | null> {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}/?apikey=${omdbApiKey}&t=${encodeURIComponent(title)}&y=${year}&type=movie`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.Response === 'False' || !data.imdbVotes) return null;
    
    const votes = parseInt(data.imdbVotes.replace(/,/g, ''), 10);
    return isNaN(votes) ? null : votes;
  } catch {
    return null;
  }
}

async function fetchIMDbVotes() {
  console.log('═'.repeat(100));
  console.log('FETCHING IMDB VOTE COUNTS (v2)');
  console.log('═'.repeat(100) + '\n');

  // Get all movies with scores
  console.log('📊 Fetching movies...');
  const { data: allMovies } = await supabase
    .from('movies')
    .select('id, title, year')
    .order('year', { ascending: false })
    .limit(1000);

  if (!allMovies) {
    console.error('❌ Error fetching movies');
    process.exit(1);
  }

  // Get which ones have scores
  const { data: scoredIds } = await supabase
    .from('movie_scores')
    .select('movie_id');

  const scoredSet = new Set((scoredIds || []).map((s: any) => s.movie_id));
  const movieList = allMovies.filter((m: any) => scoredSet.has(m.id));

  console.log(`✅ Found ${movieList.length} movies with scores\n`);

  if (movieList.length === 0) {
    console.log('No movies to process');
    process.exit(0);
  }

  // Fetch vote counts
  console.log('🎬 Fetching vote counts from OMDB...\n');

  let updatedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < movieList.length; i++) {
    const movie = movieList[i];
    const pct = ((i + 1) / movieList.length * 100).toFixed(1);
    process.stdout.write(`[${pct}%] ${movie.title} (${movie.year})...\r`);

    // Get vote count
    const votes = await getOMDBVotes(movie.title, movie.year);

    if (votes === null) {
      failedCount++;
      await new Promise(r => setTimeout(r, 300));
      continue;
    }

    // Update database
    const { error } = await supabase
      .from('movie_scores')
      .update({ imdb_votes: votes })
      .eq('movie_id', movie.id);

    if (!error) {
      updatedCount++;
    }

    await new Promise(r => setTimeout(r, 300)); // OMDB rate limit
  }

  console.log(`\n\n✅ COMPLETE!`);
  console.log(`   Updated: ${updatedCount} movies with vote counts`);
  console.log(`   Failed: ${failedCount} (OMDB data not available)`);
  console.log(`\n📝 Threshold changed to 25K votes for hidden gems.\n`);
}

fetchIMDbVotes().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
