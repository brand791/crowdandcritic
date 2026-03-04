'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface GenreFilterProps {
  genres: { [key: string]: any[] };
}

function MovieRow({ movie, rank }: { movie: any; rank: number }) {
  const score = movie.movie_scores?.[0];
  const composite = score?.composite_score ?? 0;
  const posterUrl = movie.poster_url || '/placeholder-poster.svg';

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent hover:border-[#2a2a2a] hover:bg-[#111] transition-all"
    >
      <div className="w-6 text-right text-sm font-semibold text-[#888]">{rank}</div>

      <div className="relative shrink-0 w-8 h-11 rounded overflow-hidden bg-[#1a1a1a]">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="32px"
          unoptimized={posterUrl.includes('m.media-amazon.com')}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-[#e8e8e8] group-hover:text-white truncate text-sm">
          {movie.title}
        </h4>
        <p className="text-xs text-[#555]">{movie.year}</p>
      </div>

      <div className="shrink-0 text-right">
        <span className="text-[#f5a623] font-semibold text-sm">{composite.toFixed(1)}</span>
      </div>
    </Link>
  );
}

export function GenreFilter({ genres }: GenreFilterProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const genreEntries = Object.entries(genres).sort((a, b) => a[0].localeCompare(b[0]));

  const displayedGenres = selectedGenre
    ? genreEntries.filter(([genre]) => genre === selectedGenre)
    : genreEntries;

  return (
    <div>
      {/* Genre Buttons */}
      <div className="mb-8 p-5 rounded-lg bg-[#111] border border-[#222]">
        <h3 className="text-sm font-semibold text-white mb-4">Filter by Genre:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedGenre === null
                ? 'bg-[#f5a623] text-black'
                : 'bg-[#1a1a1a] border border-[#222] text-[#888] hover:text-white hover:border-[#333]'
            }`}
          >
            All ({genreEntries.length})
          </button>
          {genreEntries.map(([genre, movies]) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedGenre === genre
                  ? 'bg-[#f5a623] text-black'
                  : 'bg-[#1a1a1a] border border-[#222] text-[#888] hover:text-white hover:border-[#333]'
              }`}
            >
              {genre} ({movies.length})
            </button>
          ))}
        </div>
      </div>

      {/* Genre Content */}
      <div className="space-y-12">
        {displayedGenres.map(([genre, genreMovies]) => (
          <div key={genre} id={genre.replace(/\s+/g, '-')}>
            <h2 className="text-2xl font-bold text-white mb-4">{genre}</h2>
            <div className="p-4 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] space-y-1">
              {genreMovies.map((movie, index) => (
                <MovieRow key={movie.id} movie={movie} rank={index + 1} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {displayedGenres.length === 0 && (
        <div className="text-center py-12 text-[#555]">
          <p>No genres found.</p>
        </div>
      )}
    </div>
  );
}
