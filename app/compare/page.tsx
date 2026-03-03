'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MovieWithScore, getTopMovies } from '@/lib/supabase';

async function loadMovies() {
  const movies = await getTopMovies(409);
  return movies;
}

export default function ComparePage() {
  const [movies, setMovies] = useState<MovieWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [movie1Id, setMovie1Id] = useState('');
  const [movie2Id, setMovie2Id] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Load movies on mount
  useEffect(() => {
    loadMovies().then(m => {
      setMovies(m);
      setLoading(false);
    });
  }, []);

  const filteredMovies = useMemo(() => {
    if (!searchInput.trim()) return movies;
    const query = searchInput.toLowerCase();
    return movies.filter(m => m.title.toLowerCase().includes(query));
  }, [movies, searchInput]);

  const movie1 = movies.find(m => m.id === movie1Id);
  const movie2 = movies.find(m => m.id === movie2Id);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 text-center text-[#555]">
        <p>Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <Link href="/" className="text-sm text-[#555] hover:text-[#f5a623] transition-colors">
          ← Back to Rankings
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Head-to-Head</h1>
        <p className="text-[#666] text-lg">Pick two movies and compare side by side.</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-[#111] border border-[#222] text-white placeholder-[#555] focus:outline-none focus:border-[#f5a623] transition-colors"
        />
      </div>

      {/* Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Movie 1 */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Movie 1</h2>
          {movie1 ? (
            <div className="p-6 rounded-lg bg-[#111] border border-[#222]">
              <button
                onClick={() => setMovie1Id('')}
                className="text-xs text-[#555] hover:text-[#f5a623] mb-4 transition-colors"
              >
                ✕ Clear
              </button>
              <MoviePreview movie={movie1} />
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMovies.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMovie1Id(m.id)}
                  className="w-full text-left px-4 py-2 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] text-white transition-all"
                >
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-xs text-[#666]">{m.year}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Movie 2 */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Movie 2</h2>
          {movie2 ? (
            <div className="p-6 rounded-lg bg-[#111] border border-[#222]">
              <button
                onClick={() => setMovie2Id('')}
                className="text-xs text-[#555] hover:text-[#f5a623] mb-4 transition-colors"
              >
                ✕ Clear
              </button>
              <MoviePreview movie={movie2} />
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMovies.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMovie2Id(m.id)}
                  className="w-full text-left px-4 py-2 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] text-white transition-all"
                >
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-xs text-[#666]">{m.year}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      {movie1 && movie2 && (
        <div className="p-6 rounded-lg bg-[#111] border border-[#222]">
          <h2 className="text-2xl font-bold text-white mb-6">Comparison</h2>
          <div className="space-y-4">
            <ComparisonRow
              label="Score"
              value1={(movie1.movie_scores?.[0]?.composite_score ?? 0).toFixed(1)}
              value2={(movie2.movie_scores?.[0]?.composite_score ?? 0).toFixed(1)}
            />
            <ComparisonRow
              label="Rotten Tomatoes"
              value1={`${movie1.movie_scores?.[0]?.rt_tomatometer ?? 'N/A'}%`}
              value2={`${movie2.movie_scores?.[0]?.rt_tomatometer ?? 'N/A'}%`}
            />
            <ComparisonRow
              label="IMDb"
              value1={`${(movie1.movie_scores?.[0]?.imdb_rating ?? 0).toFixed(1)}/100`}
              value2={`${(movie2.movie_scores?.[0]?.imdb_rating ?? 0).toFixed(1)}/100`}
            />
            <ComparisonRow label="Year" value1={movie1.year.toString()} value2={movie2.year.toString()} />
            <ComparisonRow label="Director" value1={movie1.director || 'Unknown'} value2={movie2.director || 'Unknown'} />
            <ComparisonRow
              label="Runtime"
              value1={movie1.runtime_minutes ? `${movie1.runtime_minutes} min` : 'Unknown'}
              value2={movie2.runtime_minutes ? `${movie2.runtime_minutes} min` : 'Unknown'}
            />
            <ComparisonRow
              label="Genres"
              value1={movie1.genres?.join(', ') || 'Unknown'}
              value2={movie2.genres?.join(', ') || 'Unknown'}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MoviePreview({ movie }: { movie: MovieWithScore }) {
  const score = movie.movie_scores?.[0];
  const posterUrl = movie.poster_url || '/placeholder-poster.svg';

  return (
    <div className="space-y-4">
      <div className="relative w-full h-64 rounded-lg overflow-hidden bg-[#0a0a0a]">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          className="object-cover"
          unoptimized={posterUrl.includes('m.media-amazon.com')}
        />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">{movie.title}</h3>
        <p className="text-sm text-[#666]">{movie.year}</p>
      </div>
      <div className="flex gap-4">
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-[#f5a623]">{(score?.composite_score ?? 0).toFixed(1)}</div>
          <div className="text-xs text-[#555]">Score</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-[#ef4444]">{score?.rt_tomatometer ?? 'N/A'}%</div>
          <div className="text-xs text-[#555]">RT</div>
        </div>
        <div className="text-center flex-1">
          <div className="text-3xl font-bold text-[#f5a623]">{(score?.imdb_rating ?? 0).toFixed(1)}</div>
          <div className="text-xs text-[#555]">IMDb</div>
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, value1, value2 }: { label: string; value1: string; value2: string }) {
  const val1Num = parseFloat(value1);
  const val2Num = parseFloat(value2);
  const isValue1Higher = !isNaN(val1Num) && !isNaN(val2Num) && val1Num > val2Num;
  const isValue2Higher = !isNaN(val1Num) && !isNaN(val2Num) && val2Num > val1Num;

  return (
    <div className="grid grid-cols-3 gap-4 pb-4 border-b border-[#1a1a1a]">
      <div className="text-sm text-[#888]">{label}</div>
      <div className={`text-right font-semibold ${isValue1Higher ? 'text-[#22c55e]' : 'text-[#d8d8d8]'}`}>
        {value1}
      </div>
      <div className={`text-right font-semibold ${isValue2Higher ? 'text-[#22c55e]' : 'text-[#d8d8d8]'}`}>
        {value2}
      </div>
    </div>
  );
}
