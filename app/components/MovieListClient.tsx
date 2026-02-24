'use client';

import { useState, useMemo } from 'react';
import { MovieWithScore } from '@/lib/supabase';
import MovieCard from './MovieCard';
import FilterBar, { SortOption } from './FilterBar';

interface MovieListClientProps {
  movies: MovieWithScore[];
}

export default function MovieListClient({ movies }: MovieListClientProps) {
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeSort, setActiveSort] = useState<SortOption>('composite');

  const filtered = useMemo(() => {
    let result = [...movies];

    // Genre filter
    if (activeGenre !== 'All') {
      result = result.filter((m) =>
        m.genres?.some((g) => g.toLowerCase() === activeGenre.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      const sa = a.movie_scores?.[0];
      const sb = b.movie_scores?.[0];
      switch (activeSort) {
        case 'composite':
          return (sb?.composite_score ?? 0) - (sa?.composite_score ?? 0);
        case 'critic':
          return (sb?.critic_score ?? 0) - (sa?.critic_score ?? 0);
        case 'audience':
          return (sb?.audience_score ?? 0) - (sa?.audience_score ?? 0);
        case 'year_desc':
          return (b.year ?? 0) - (a.year ?? 0);
        case 'year_asc':
          return (a.year ?? 0) - (b.year ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [movies, activeGenre, activeSort]);

  return (
    <div>
      <FilterBar
        onGenreChange={setActiveGenre}
        onSortChange={setActiveSort}
        activeGenre={activeGenre}
        activeSort={activeSort}
        totalCount={filtered.length}
      />

      {/* Column headers */}
      <div className="hidden sm:flex items-center gap-4 px-4 py-2 mt-2 text-[10px] uppercase tracking-widest text-[#444]">
        <div className="w-10 text-right">Rank</div>
        <div className="w-10 shrink-0" />
        <div className="flex-1">Film</div>
        <div className="flex items-center gap-5 shrink-0">
          <span className="w-10 text-center text-[#ef4444]">Critic</span>
          <span className="w-12 text-center text-[#3b82f6]">Audience</span>
          <span className="w-10 text-center text-[#a855f7]">Canon</span>
        </div>
        <div className="w-12 text-center ml-2">Score</div>
      </div>

      <div className="mt-1 space-y-0.5">
        {filtered.map((movie, index) => (
          <MovieCard key={movie.id} movie={movie} rank={index + 1} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#444]">
          <div className="text-4xl mb-3">🎞️</div>
          <p className="text-sm">No films match this filter.</p>
        </div>
      )}
    </div>
  );
}
