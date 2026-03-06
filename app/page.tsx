import { getTopMovies, MovieWithScore } from '@/lib/supabase';
import MovieListClient from './components/MovieListClient';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function HomePage() {
  const movies = await getTopMovies(1000); // Fetch up to 1000 scored movies

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-[#111] border border-[#222] text-xs text-[#f5a623]">
          <span>🎬</span>
          <span>Critics + Audiences — Balanced</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          The{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #f5a623 0%, #f7b84b 50%, #d4881c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            definitive
          </span>{' '}
          movie ranking
        </h1>
        <p className="text-[#666] text-lg max-w-2xl mx-auto leading-relaxed">
          Rotten Tomatoes vs. IMDb. 50/50. No complexity. Just what critics think and what audiences voted for.
        </p>

        {/* Score legend */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-[#555] flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span>Rotten Tomatoes 50%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f5a623]" />
            <span>IMDb 50%</span>
          </div>
        </div>
      </div>

      {/* Feature Links - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <a
          href="/controversy"
          className="group p-5 rounded-xl bg-[#111] border border-[#222] hover:border-[#f5a623] transition-all hover:bg-[#0a0a0a]"
        >
          <div className="text-2xl mb-2">🔥</div>
          <h3 className="font-semibold text-white mb-1 group-hover:text-[#f5a623]">Controversy Index</h3>
          <p className="text-xs text-[#666]">Where critics and audiences disagree most</p>
        </a>
        <a
          href="/hidden-gems"
          className="group p-5 rounded-xl bg-[#111] border border-[#222] hover:border-[#f5a623] transition-all hover:bg-[#0a0a0a]"
        >
          <div className="text-2xl mb-2">💎</div>
          <h3 className="font-semibold text-white mb-1 group-hover:text-[#f5a623]">Hidden Gems</h3>
          <p className="text-xs text-[#666]">High-quality films nobody's heard of</p>
        </a>
        <a
          href="/decades"
          className="group p-5 rounded-xl bg-[#111] border border-[#222] hover:border-[#f5a623] transition-all hover:bg-[#0a0a0a]"
        >
          <div className="text-2xl mb-2">📅</div>
          <h3 className="font-semibold text-white mb-1 group-hover:text-[#f5a623]">Decades</h3>
          <p className="text-xs text-[#666]">Best films from each era</p>
        </a>
      </div>

      {/* Feature Links - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <a
          href="/genres"
          className="group p-5 rounded-xl bg-[#111] border border-[#222] hover:border-[#f5a623] transition-all hover:bg-[#0a0a0a]"
        >
          <div className="text-2xl mb-2">🎬</div>
          <h3 className="font-semibold text-white mb-1 group-hover:text-[#f5a623]">Genre Leaderboards</h3>
          <p className="text-xs text-[#666]">Top 20 films in each genre</p>
        </a>
        <a
          href="/directors"
          className="group p-5 rounded-xl bg-[#111] border border-[#222] hover:border-[#f5a623] transition-all hover:bg-[#0a0a0a]"
        >
          <div className="text-2xl mb-2">👤</div>
          <h3 className="font-semibold text-white mb-1 group-hover:text-[#f5a623]">Directors</h3>
          <p className="text-xs text-[#666]">Filmmakers ranked by average score</p>
        </a>
        <a
          href="/compare"
          className="group p-5 rounded-xl bg-[#111] border border-[#222] hover:border-[#f5a623] transition-all hover:bg-[#0a0a0a]"
        >
          <div className="text-2xl mb-2">⚖️</div>
          <h3 className="font-semibold text-white mb-1 group-hover:text-[#f5a623]">Head-to-Head</h3>
          <p className="text-xs text-[#666]">Compare any two movies</p>
        </a>
      </div>

      {/* Movie List */}
      {movies.length === 0 ? (
        <EmptyState />
      ) : (
        <MovieListClient movies={movies} />
      )}

      {/* About section */}
      <section id="about" className="mt-20 pt-12 border-t border-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">The formula</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[#666] leading-relaxed">
            <div className="p-5 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <div className="text-2xl mb-3">🍅</div>
              <h3 className="text-white font-semibold mb-2">Rotten Tomatoes (50%)</h3>
              <p>What professional critics think. Tomatometer score from reviews.</p>
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <div className="text-2xl mb-3">👥</div>
              <h3 className="text-white font-semibold mb-2">IMDb (50%)</h3>
              <p>What audiences think. Average rating from millions of viewers.</p>
            </div>
          </div>
          <div className="mt-8 p-6 rounded-xl bg-[#111] border border-[#1a1a1a] text-center">
            <p className="text-[#666] text-sm mb-3">Final Score</p>
            <p className="text-[#f5a623] font-mono font-semibold text-lg">(RT × 0.50) + (IMDb × 0.50) = Rank</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 text-[#444]">
      <div className="text-5xl mb-4">🎬</div>
      <h2 className="text-xl font-semibold text-[#666] mb-2">No movies yet</h2>
      <p className="text-sm max-w-sm mx-auto">
        Run the seed script to populate the database:{' '}
        <code className="bg-[#111] px-1.5 py-0.5 rounded text-[#f5a623]">npm run seed</code>
      </p>
    </div>
  );
}
