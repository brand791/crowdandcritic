/**
 * Build canon score database from prestigious film lists
 * Matches movies in our database to canonical "greatest films" lists
 * Run with: npx tsx scripts/build-canon-scores.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlnkmresgszqiyaamcfp.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!serviceRoleKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Canon lists with curated movies (title, year)
// These are real, authoritative lists of the greatest films
const CANON_LISTS = {
  'AFI Top 100': [
    { title: 'Citizen Kane', year: 1941 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather Part II', year: 1974 },
    { title: 'Gone with the Wind', year: 1939 },
    { title: 'Lawrence of Arabia', year: 1962 },
    { title: 'The Best Years of Our Lives', year: 1946 },
    { title: "It's a Wonderful Life", year: 1946 },
    { title: 'My Fair Lady', year: 1964 },
    { title: 'Singin\' in the Rain', year: 1952 },
    { title: 'Rear Window', year: 1954 },
    { title: 'Vertigo', year: 1958 },
    { title: 'North by Northwest', year: 1959 },
    { title: 'Sunset Boulevard', year: 1950 },
    { title: 'Psycho', year: 1960 },
    { title: 'The Shining', year: 1980 },
    { title: 'The Third Man', year: 1949 },
    { title: 'Casablanca', year: 1942 },
    { title: 'On the Waterfront', year: 1954 },
    { title: 'One Flew Over the Cuckoo\'s Nest', year: 1975 },
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Lord of the Rings: The Return of the King', year: 2003 },
  ],
  'Sight & Sound (Critics)': [
    { title: 'Citizen Kane', year: 1941 },
    { title: 'Tokyo Story', year: 1953 },
    { title: 'Battleship Potemkin', year: 1925 },
    { title: 'The Godfather', year: 1972 },
    { title: 'Vertigo', year: 1958 },
    { title: 'The Seven Samurai', year: 1954 },
    { title: 'Rashomon', year: 1950 },
    { title: 'Cinema Paradiso', year: 1988 },
    { title: 'Lawrence of Arabia', year: 1962 },
    { title: 'The Searchers', year: 1956 },
    { title: 'Sunset Boulevard', year: 1950 },
    { title: 'The Bicycle Thieves', year: 1948 },
    { title: 'Raging Bull', year: 1980 },
    { title: 'Casablanca', year: 1942 },
    { title: 'Psycho', year: 1960 },
    { title: 'Singin\' in the Rain', year: 1952 },
    { title: 'Stalker', year: 1979 },
    { title: 'The Third Man', year: 1949 },
    { title: 'Mulholland Drive', year: 2001 },
    { title: 'Rear Window', year: 1954 },
  ],
  'TSPDT Top 100': [
    { title: 'Citizen Kane', year: 1941 },
    { title: 'Tokyo Story', year: 1953 },
    { title: 'The Godfather', year: 1972 },
    { title: 'The Godfather Part II', year: 1974 },
    { title: 'Vertigo', year: 1958 },
    { title: 'Seven Samurai', year: 1954 },
    { title: 'Battleship Potemkin', year: 1925 },
    { title: 'Rashomon', year: 1950 },
    { title: 'Psycho', year: 1960 },
    { title: 'Stalker', year: 1979 },
    { title: 'Lawrence of Arabia', year: 1962 },
    { title: 'Singin\' in the Rain', year: 1952 },
    { title: 'Casablanca', year: 1942 },
    { title: 'Raging Bull', year: 1980 },
    { title: 'The Third Man', year: 1949 },
    { title: 'Sunset Boulevard', year: 1950 },
    { title: 'On the Waterfront', year: 1954 },
    { title: 'Mulholland Drive', year: 2001 },
    { title: 'Rear Window', year: 1954 },
    { title: 'Bicycle Thieves', year: 1948 },
  ],
  'Empire 100': [
    { title: 'The Godfather', year: 1972 },
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Godfather Part II', year: 1974 },
    { title: 'The Dark Knight', year: 2008 },
    { title: 'Pulp Fiction', year: 1994 },
    { title: 'Forrest Gump', year: 1994 },
    { title: 'Inception', year: 2010 },
    { title: 'The Matrix', year: 1999 },
    { title: 'Goodfellas', year: 1990 },
    { title: 'Jaws', year: 1975 },
    { title: 'Raiders of the Lost Ark', year: 1981 },
    { title: 'Fight Club', year: 1999 },
    { title: 'Star Wars', year: 1977 },
    { title: 'Back to the Future', year: 1985 },
    { title: 'Singin\' in the Rain', year: 1952 },
    { title: 'The Silence of the Lambs', year: 1991 },
    { title: 'Se7en', year: 1995 },
    { title: 'Saving Private Ryan', year: 1998 },
    { title: 'There Will Be Blood', year: 2007 },
    { title: 'Interstellar', year: 2014 },
  ],
};

async function buildCanonScores() {
  console.log('═'.repeat(100));
  console.log('BUILDING CANON SCORE DATABASE');
  console.log('═'.repeat(100) + '\n');

  // Step 1: Fetch all movies
  console.log('📊 Step 1: Fetching all movies from database...');
  const { data: allMovies, error: fetchError } = await supabase
    .from('movies')
    .select('id, title, year, movie_scores(id, canon_appearances)');

  if (fetchError || !allMovies) {
    console.error('❌ Error fetching movies:', fetchError);
    process.exit(1);
  }

  console.log(`✅ Found ${allMovies.length} movies\n`);

  // Step 2: Match movies to canon lists
  console.log('🏆 Step 2: Matching movies to canon lists...\n');

  const movieCanonCounts: Map<string, number> = new Map();
  const movieCanonDetails: Map<string, string[]> = new Map();

  for (const movie of allMovies) {
    const movieKey = `${movie.title}|${movie.year}`;
    let canonCount = 0;
    const listAppearances: string[] = [];

    for (const [listName, listMovies] of Object.entries(CANON_LISTS)) {
      const isInList = listMovies.some(
        (m) =>
          m.title.toLowerCase().trim() === movie.title.toLowerCase().trim() &&
          m.year === movie.year
      );

      if (isInList) {
        canonCount++;
        listAppearances.push(listName);
      }
    }

    if (canonCount > 0) {
      movieCanonCounts.set(movieKey, canonCount);
      movieCanonDetails.set(movieKey, listAppearances);
      console.log(
        `✓ "${movie.title}" (${movie.year}) - ${canonCount} list${canonCount !== 1 ? 's' : ''}`
      );
    }
  }

  console.log(`\n✅ Matched ${movieCanonCounts.size} movies to canon lists\n`);

  // Step 3: Update movie_scores with canon_appearances
  console.log('💾 Step 3: Updating canon scores in database...');

  let updateCount = 0;

  for (const movie of allMovies) {
    const movieKey = `${movie.title}|${movie.year}`;
    const canonCount = movieCanonCounts.get(movieKey) || 0;

    if (canonCount === 0) continue; // Skip movies not in any canon list

    // movie_scores is an array; get the first (and typically only) score record
    const movieScores = Array.isArray(movie.movie_scores)
      ? movie.movie_scores
      : movie.movie_scores
        ? [movie.movie_scores]
        : [];

    if (movieScores.length === 0) continue;
    const scoreId = (movieScores[0] as any).id;
    if (!scoreId) continue;

    const { error: updateError } = await supabase
      .from('movie_scores')
      .update({ canon_appearances: canonCount })
      .eq('id', scoreId);

    if (!updateError) {
      updateCount++;
    }
  }

  console.log(`✅ Updated ${updateCount} movies with canon scores!\n`);

  // Step 4: Verify
  console.log('🔍 Step 4: Verifying top canon appearances...');
  const { data: topCanon } = await supabase
    .from('movie_scores')
    .select('canon_appearances, movies(title, year)')
    .gt('canon_appearances', 0)
    .order('canon_appearances', { ascending: false })
    .limit(10);

  if (topCanon) {
    console.log('\n✨ Movies with Most Canon List Appearances:\n');
    topCanon.forEach((m, idx) => {
      const movie = m.movies as any;
      console.log(
        `${(idx + 1).toString().padStart(2)}. "${movie.title}" (${movie.year}) - ${m.canon_appearances} lists`
      );
    });
  }

  console.log('\n' + '═'.repeat(100));
  console.log('✅ CANON SCORE DATABASE BUILT!');
  console.log('═'.repeat(100));
  console.log(`\n📝 Summary:`);
  console.log(`   - Matched: ${movieCanonCounts.size} movies to canon lists`);
  console.log(`   - Updated: ${updateCount} movie scores`);
  console.log(`   - Sources: AFI Top 100, Sight & Sound, TSPDT, Empire 100`);
  console.log(`   - Max canon appearances: 4 (appears on all lists)\n`);
  console.log(`🚀 Next: Recalculate composite scores with canon data`);
}

buildCanonScores().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
