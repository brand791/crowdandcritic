import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMovieById, getTopMovies } from '@/lib/supabase';
import { ScoreBreakdown } from '@/app/components/RankingBar';
import { AffiliateLink } from '@/app/components/AffiliateLink';

interface MoviePageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const movies = await getTopMovies(100);
  return movies.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: MoviePageProps) {
  const movie = await getMovieById(params.id);
  if (!movie) return { title: 'Movie Not Found' };
  return {
    title: `${movie.title} (${movie.year}) — CrowdAndCritic`,
    description: movie.plot ?? `See the composite score for ${movie.title} on CrowdAndCritic.`,
  };
}

function ScoreBadge({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 rounded-xl bg-[#111] border border-[#1a1a1a] min-w-[90px]">
      <span className="text-2xl font-bold tabular-nums" style={{ color: color ?? '#f5a623' }}>
        {value}
      </span>
      <span className="text-xs text-[#888] mt-1">{label}</span>
      {sub && <span className="text-[10px] text-[#555] mt-0.5">{sub}</span>}
    </div>
  );
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movie = await getMovieById(params.id);

  if (!movie) {
    notFound();
  }

  const score = movie.movie_scores?.[0];
  const canonLists = movie.canon_lists ?? [];

  const compositeScore = score?.composite_score ?? 0;
  const scoreColor =
    compositeScore >= 85 ? '#22c55e' : compositeScore >= 70 ? '#f5a623' : '#ef4444';

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link href="/" className="text-sm text-[#555] hover:text-[#f5a623] transition-colors">
          ← Back to Rankings
        </Link>
      </nav>

      {/* Hero */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        {/* Poster */}
        <div className="relative w-40 sm:w-52 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-[#222] self-start mx-auto sm:mx-0">
          {movie.poster_url ? (
            <Image
              src={movie.poster_url}
              alt={`${movie.title} poster`}
              width={208}
              height={308}
              className="w-full object-cover"
              unoptimized={movie.poster_url.includes('m.media-amazon.com')}
            />
          ) : (
            <div className="w-full h-[308px] flex items-center justify-center bg-[#1a1a1a] text-[#333] text-5xl">
              🎬
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                {movie.title}
              </h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-[#666] flex-wrap">
                <span>{movie.year}</span>
                {movie.director && (
                  <>
                    <span className="text-[#333]">·</span>
                    <span>{movie.director}</span>
                  </>
                )}
                {movie.runtime_minutes && (
                  <>
                    <span className="text-[#333]">·</span>
                    <span>{movie.runtime_minutes} min</span>
                  </>
                )}
              </div>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {movie.genres?.map((g) => (
                  <span
                    key={g}
                    className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#777] border border-[#222]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Composite score badge */}
            <div
              className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-2 shrink-0"
              style={{ borderColor: scoreColor, boxShadow: `0 0 24px ${scoreColor}30` }}
            >
              <span className="text-2xl font-bold tabular-nums" style={{ color: scoreColor }}>
                {compositeScore.toFixed(1)}
              </span>
              <span className="text-[10px] text-[#555]">composite</span>
            </div>
          </div>

          {/* Plot */}
          {movie.plot && (
            <p className="mt-5 text-[#888] text-sm leading-relaxed max-w-xl">{movie.plot}</p>
          )}

          {/* Raw score badges */}
          {score && (
            <div className="flex gap-3 mt-6 flex-wrap">
              {score.rt_tomatometer != null && (
                <ScoreBadge
                  label="Rotten Tomatoes"
                  value={`${score.rt_tomatometer}%`}
                  color="#ef4444"
                />
              )}
              {score.imdb_rating != null && (
                <ScoreBadge
                  label="IMDb"
                  value={score.imdb_rating}
                  sub={score.imdb_votes ? `${(score.imdb_votes / 1000).toFixed(0)}K votes` : undefined}
                  color="#f5a623"
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score breakdown */}
        <div className="lg:col-span-2">
          {score ? (
            <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a]">
              <ScoreBreakdown
                rtScore={score.rt_tomatometer ?? 0}
                imdbScore={score.imdb_rating ?? 0}
                compositeScore={score.composite_score ?? 0}
              />
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a] text-[#555] text-sm">
              No score data available.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Where to Watch - CTA */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#f5a623] border-opacity-20">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎬</span> Watch Now
            </h3>
            
            {/* Primary CTA - Amazon (Affiliate) */}
            {movie.imdb_id && (
              <AffiliateLink
                href={`https://www.amazon.com/s?k=${encodeURIComponent(movie.title + ' ' + movie.year)}&i=instant-video&tag=brand791-20`}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-[#f5a623] hover:bg-[#f7b84b] text-black font-semibold text-sm transition-all mb-2"
                platform="amazon"
                movieTitle={movie.title}
              >
                <span>🎁 Watch on Amazon</span>
                <span>→</span>
              </AffiliateLink>
            )}
            
            {/* Secondary CTA - JustWatch */}
            <AffiliateLink
              href={`https://www.justwatch.com/us/search?q=${encodeURIComponent(movie.title)}`}
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-sm text-[#888] hover:text-white transition-colors border border-[#222] hover:border-[#333] mb-2"
              platform="justwatch"
              movieTitle={movie.title}
            >
              <span>Find Streaming Options</span>
              <span className="text-[#444]">→</span>
            </AffiliateLink>
            
            {/* Tertiary - IMDb */}
            {movie.imdb_id && (
              <AffiliateLink
                href={`https://www.imdb.com/title/${movie.imdb_id}/`}
                className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] text-sm text-[#888] hover:text-white transition-colors border border-[#222] hover:border-[#333]"
                platform="imdb"
                movieTitle={movie.title}
              >
                <span>View Details on IMDb</span>
                <span className="text-[#444]">→</span>
              </AffiliateLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
