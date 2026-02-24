'use client';

import { useState } from 'react';

const GENRES = ['All', 'Drama', 'Crime', 'Comedy', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'War', 'Biography'];
const SORT_OPTIONS = [
  { value: 'composite', label: 'Composite Score' },
  { value: 'critic', label: 'Critic Score' },
  { value: 'audience', label: 'Audience Score' },
  { value: 'year_desc', label: 'Newest First' },
  { value: 'year_asc', label: 'Oldest First' },
] as const;

export type SortOption = typeof SORT_OPTIONS[number]['value'];

interface FilterBarProps {
  onGenreChange: (genre: string) => void;
  onSortChange: (sort: SortOption) => void;
  activeGenre: string;
  activeSort: SortOption;
  totalCount: number;
}

export default function FilterBar({
  onGenreChange,
  onSortChange,
  activeGenre,
  activeSort,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between py-4 border-b border-[#1a1a1a]">
      {/* Genre filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeGenre === genre
                ? 'bg-[#f5a623] text-black'
                : 'bg-[#1a1a1a] text-[#888] hover:bg-[#222] hover:text-[#ccc] border border-[#222]'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-[#555]">{totalCount} films</span>
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="text-xs bg-[#1a1a1a] border border-[#222] text-[#888] rounded px-2 py-1.5 focus:outline-none focus:border-[#f5a623] cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
