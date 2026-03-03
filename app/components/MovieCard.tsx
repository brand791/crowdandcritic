'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MovieWithScore } from '@/lib/supabase';

interface MovieCardProps {
  movie: MovieWithScore;
  rank: number;
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 75) return '#f5a623';
  if (score >= 60) return '#f97316';
  return '#ef4444';
}

function ScorePill({
  label,
  value,
  color,
  isPercent,
}: {
  label: string;
  value: number | null | undefined;
  color: string;
  isPercent?: boolean;
}) {
  if (value == null) return null;
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-[#666] uppercase tracking-wide leading-none mb-1">
        {label}
      </span>
      <span className="text-xs font-semibold" style={{ color }}>
        {isPercent ? `${value.toFixed(0)}%` : value.toFixed(0)}
      </span>
    </div>
  );
}

export default function MovieCard({ movie, rank }: MovieCardProps) {
  const score = movie.movie_scores?.[0];
  const compositeScore = score?.composite_score ?? 0;
  const scoreColor = getScoreColor(compositeScore);

  const genres = movie.genres?.slice(0, 2) ?? [];

  // Fallback poster
  const posterUrl = movie.poster_url || '/placeholder-poster.svg';

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group flex items-center gap-4 px-4 py-3 rounded-lg border border-transparent hover:border-[#2a2a2a] hover:bg-[#111] transition-all duration-200 movie-card-hover"
    >
      {/* Rank */}
      <div className="w-10 shrink-0 text-right">
        <span
          className={`rank-number font-bold tabular-nums ${
            rank <= 3
              ? 'text-[#f5a623] text-lg'
              : rank <= 10
              ? 'text-[#888] text-base'
              : 'text-[#444] text-sm'
          }`}
        >
          {rank}
        </span>
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
          <h3 className="font-semibold text-[#e8e8e8] group-hover:text-white truncate text-sm sm:text-base leading-tight">
            {movie.title}
          </h3>
          <span className="text-xs text-[#555] shrink-0">{movie.year}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-[#666] truncate">{movie.director}</span>
          {genres.map((g) => (
            <span
              key={g}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#555] border border-[#222]"
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      {/* Sub-scores (hidden on mobile) */}
      <div className="hidden sm:flex items-center gap-5 shrink-0">
        <ScorePill
          label="RT"
          value={score?.rt_tomatometer}
          color="#ef4444"
          isPercent={true}
        />
        <ScorePill
          label="IMDb"
          value={score?.imdb_rating}
          color="#f5a623"
        />
      </div>

      {/* Composite Score */}
      <div className="shrink-0 flex flex-col items-center ml-2">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm tabular-nums border-2 transition-all group-hover:scale-105"
          style={{
            borderColor: scoreColor,
            color: scoreColor,
            boxShadow: `0 0 12px ${scoreColor}25`,
          }}
        >
          {compositeScore.toFixed(0)}
        </div>
      </div>
    </Link>
  );
}
