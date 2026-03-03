'use client';

import { useState, useMemo } from 'react';
import { MovieWithScore } from '@/lib/supabase';
import MovieCard from './MovieCard';
import FilterBar, { SortOption } from './FilterBar';

interface MovieListClientProps {
  movies: MovieWithScore[];
}

const MOVIES_PER_PAGE = 100;

export default function MovieListClient({ movies }: MovieListClientProps) {
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeSort, setActiveSort] = useState<SortOption>('composite');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...movies];

    // Search filter (title or director)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((m) =>
        m.title.toLowerCase().includes(query) ||
        m.director?.toLowerCase().includes(query)
      );
    }

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
  }, [movies, activeGenre, activeSort, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / MOVIES_PER_PAGE);
  const startIdx = (currentPage - 1) * MOVIES_PER_PAGE;
  const endIdx = startIdx + MOVIES_PER_PAGE;
  const paginatedMovies = filtered.slice(startIdx, endIdx);

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    setCurrentPage(1);
    callback();
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title or director..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-3 rounded-lg bg-[#111] border border-[#222] text-white placeholder-[#555] focus:outline-none focus:border-[#f5a623] transition-colors"
          />
          <span className="absolute right-4 top-3.5 text-[#555] text-lg">🔍</span>
        </div>
        {searchQuery && (
          <p className="text-xs text-[#555] mt-2">
            Found {filtered.length} film{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <FilterBar
        onGenreChange={(genre) => handleFilterChange(() => setActiveGenre(genre))}
        onSortChange={(sort) => handleFilterChange(() => setActiveSort(sort))}
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
          <span className="w-10 text-center text-[#ef4444]">RT</span>
          <span className="w-12 text-center text-[#f5a623]">IMDb</span>
        </div>
        <div className="w-12 text-center ml-2">Score</div>
      </div>

      <div className="mt-1 space-y-0.5">
        {paginatedMovies.map((movie, index) => (
          <MovieCard key={movie.id} movie={movie} rank={startIdx + index + 1} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#444]">
          <div className="text-4xl mb-3">🎞️</div>
          <p className="text-sm">No films match this filter.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 flex-wrap pb-8">
          {/* Previous button */}
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg bg-[#111] border border-[#222] text-sm text-[#888] hover:text-white hover:border-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>

          {/* Page buttons */}
          <div className="flex gap-1 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first 3, last 3, and current ± 1
              const isVisible =
                page <= 3 ||
                page > totalPages - 3 ||
                (page >= currentPage - 1 && page <= currentPage + 1);

              if (!isVisible) {
                if (page === 4 && currentPage > 5) {
                  return (
                    <span key="ellipsis-start" className="px-2 py-1 text-[#555]">
                      ...
                    </span>
                  );
                }
                if (page === totalPages - 3 && currentPage < totalPages - 4) {
                  return (
                    <span key="ellipsis-end" className="px-2 py-1 text-[#555]">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#f5a623] text-[#000] border border-[#f5a623]'
                      : 'bg-[#111] border border-[#222] text-[#888] hover:text-white hover:border-[#333]'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg bg-[#111] border border-[#222] text-sm text-[#888] hover:text-white hover:border-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>

          {/* Page info */}
          <div className="text-xs text-[#555] ml-2">
            Page {currentPage} of {totalPages} ({filtered.length} total)
          </div>
        </div>
      )}
    </div>
  );
}
