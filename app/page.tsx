import { getTopMovies, MovieWithScore } from '@/lib/supabase';
import MovieListClient from './components/MovieListClient';

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function HomePage() {
  const movies = await getTopMovies(100);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-[#111] border border-[#222] text-xs text-[#f5a623]">
          <span>🏆</span>
          <span>Critic + Audience + Canon — Combined</span>
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
          We combine critic scores, audience ratings, canonical list appearances, longevity, and
          cultural impact into one honest composite score.
        </p>

        {/* Score legend */}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-[#555]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span>Critic 35%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <span>Audience 35%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
            <span>Canon 15%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span>Popularity 10%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span>Longevity +0-5</span>
          </div>
        </div>
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
          <h2 className="text-2xl font-bold text-white mb-6">How we rank films</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-[#666] leading-relaxed">
            <div className="p-5 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <div className="text-2xl mb-3">🍅</div>
              <h3 className="text-white font-semibold mb-2">Critic Score (35%)</h3>
              <p>Average of Rotten Tomatoes Tomatometer and Metacritic score, normalized to 0–100.</p>
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <div className="text-2xl mb-3">👥</div>
              <h3 className="text-white font-semibold mb-2">Audience Score (35%)</h3>
              <p>Average of IMDb rating (×10), RT Audience Score, and Metacritic User Score.</p>
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="text-white font-semibold mb-2">Canon Score (15%)</h3>
              <p>
                Appearances on prestigious &quot;greatest ever&quot; lists: AFI Top 100, Sight &amp; Sound,
                Empire 100, TSPDT, and more.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <div className="text-2xl mb-3">📢</div>
              <h3 className="text-white font-semibold mb-2">Popularity (10%)</h3>
              <p>
                Cultural impact measured through Reddit discussions and social engagement. Popular films that spark ongoing conversation get a bigger boost.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#111] border border-[#1a1a1a]">
              <div className="text-2xl mb-3">⏳</div>
              <h3 className="text-white font-semibold mb-2">Longevity Bonus (0–5 flat)</h3>
              <p>
                Older films that remain highly rated receive a 0-5 point bonus on top. A classic from 1941 staying highly ranked is more remarkable than a recent release.
              </p>
            </div>
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
