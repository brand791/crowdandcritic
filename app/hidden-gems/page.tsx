import Link from 'next/link';
import Image from 'next/image';
import { getTopMovies } from '@/lib/supabase';
import { getHiddenGems } from '@/lib/analytics';

export const metadata = {
  title: 'Hidden Gems — CrowdAndCritic',
  description: 'High-quality movies with surprisingly low viewership. Discover the movies everyone should see.',
};

export default async function HiddenGemsPage() {
  const movies = await getTopMovies(1000);
  const hiddenGems = getHiddenGems(movies, 80);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link href="/" className="text-sm text-[#555] hover:text-[#f5a623] transition-colors">
          ← Back to Rankings
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Hidden Gems</h1>
        <p className="text-[#666] text-lg max-w-2xl">
          High-scoring films that flew under the radar. These movies deserve more attention.
        </p>
      </div>

      {/* Info Box */}
      <div className="mb-8 p-5 rounded-lg bg-[#111] border border-[#222] text-sm text-[#666]">
        <p>
          <span className="text-[#f5a623] font-semibold">Criteria:</span> Score 80+, but fewer than 100,000 IMDb votes.
          These are quality films that haven't reached mainstream audiences yet.
        </p>
      </div>

      {/* Movies Grid */}
      {hiddenGems.length === 0 ? (
        <div className="text-center py-12 text-[#555]">
          <p>No hidden gems found with current filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hiddenGems.map((movie, index) => {
            const score = movie.movie_scores?.[0];
            const composite = score?.composite_score ?? 0;
            const votes = score?.imdb_votes ?? 0;

            const posterUrl = movie.poster_url || '/placeholder-poster.svg';

            return (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="group flex items-center gap-4 px-4 py-3 rounded-lg border border-transparent hover:border-[#2a2a2a] hover:bg-[#111] transition-all"
              >
                {/* Rank */}
                <div className="w-8 text-right">
                  <span className="font-bold text-[#888] text-sm">{index + 1}</span>
                </div>

                {/* Poster */}
                <div className="relative shrink-0 w-10 h-14 rounded overflow-hidden bg-[#1a1a1a]">
                  <Image
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                    fill
                    className="object-cover group-hover:opacity-90 transition-opacity"
                    sizes="40px"
                    unoptimized={posterUrl.includes('m.media-amazon.com')}
                  />
                </div>

                {/* Title + Meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#e8e8e8] group-hover:text-white truncate text-sm sm:text-base">
                      {movie.title}
                    </h3>
                    <span className="text-xs text-[#555] shrink-0">{movie.year}</span>
                  </div>
                  {movie.director && (
                    <p className="text-xs text-[#666] truncate mt-0.5">{movie.director}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 shrink-0 text-xs text-right">
                  <div>
                    <span className="text-[#f5a623] font-semibold block">{composite.toFixed(1)}</span>
                    <p className="text-[#555] text-[10px]">Score</p>
                  </div>
                  <div>
                    <span className="text-[#888] font-semibold block">{(votes / 1000).toFixed(0)}K</span>
                    <p className="text-[#555] text-[10px]">Votes</p>
                  </div>
                </div>

                {/* Gem Badge */}
                <div className="shrink-0 text-2xl">💎</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
