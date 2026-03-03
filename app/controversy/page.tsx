import Link from 'next/link';
import Image from 'next/image';
import { getTopMovies } from '@/lib/supabase';
import { getControversyMovies } from '@/lib/analytics';

export const metadata = {
  title: 'Controversy Index — CrowdAndCritic',
  description: 'Movies where critics and audiences most disagree.',
};

export default async function ControversyPage() {
  const movies = await getTopMovies(409);
  const controversyMovies = getControversyMovies(movies);

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
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Controversy Index</h1>
        <p className="text-[#666] text-lg max-w-2xl">
          Movies where critics and audiences most disagree. Find the biggest critic bait, audience favorites,
          and polarizing films.
        </p>
      </div>

      {/* Legend */}
      <div className="mb-8 p-5 rounded-lg bg-[#111] border border-[#222] text-sm text-[#666]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-[#f5a623] font-semibold">🍅 Critics Love It</span>
            <p className="text-xs text-[#555] mt-1">RT much higher than IMDb — critics rate it higher</p>
          </div>
          <div>
            <span className="text-[#f5a623] font-semibold">👥 Audiences Love It</span>
            <p className="text-xs text-[#555] mt-1">IMDb much higher than RT — audiences rate it higher</p>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="space-y-2">
        {controversyMovies.map(({ movie, controversy }, index) => {
          const score = movie.movie_scores?.[0];
          const rt = score?.rt_tomatometer ?? 0;
          const imdb = score?.imdb_rating ?? 0;
          const isCriticFav = controversy < -5;
          const isAudienceFav = controversy > 5;

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

              {/* Title + Controversy Badge */}
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

              {/* Scores */}
              <div className="hidden sm:flex items-center gap-6 shrink-0 text-xs">
                <div className="text-center">
                  <span className="text-[#ef4444] font-semibold">{rt.toFixed(0)}%</span>
                  <p className="text-[#555] text-[10px]">RT</p>
                </div>
                <div className="text-center">
                  <span className="text-[#f5a623] font-semibold">{imdb.toFixed(1)}</span>
                  <p className="text-[#555] text-[10px]">IMDb</p>
                </div>
              </div>

              {/* Controversy Indicator */}
              <div className="shrink-0 text-center">
                <div
                  className={`px-2 py-1 rounded text-[10px] font-semibold ${
                    isCriticFav
                      ? 'bg-[#ef4444] bg-opacity-20 text-[#ef4444]'
                      : isAudienceFav
                      ? 'bg-[#3b82f6] bg-opacity-20 text-[#3b82f6]'
                      : 'bg-[#555] bg-opacity-20 text-[#888]'
                  }`}
                >
                  {isCriticFav && '🍅'}
                  {isAudienceFav && '👥'}
                  {!isCriticFav && !isAudienceFav && '↔️'}
                </div>
                <span className="text-[10px] text-[#555] mt-1 block">{Math.abs(controversy).toFixed(1)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
