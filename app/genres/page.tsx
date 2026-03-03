import Link from 'next/link';
import Image from 'next/image';
import { getTopMovies } from '@/lib/supabase';
import { getGenreLeaderboards } from '@/lib/analytics';

export const metadata = {
  title: 'Genre Leaderboards — CrowdAndCritic',
  description: 'The highest-rated films in each genre.',
};

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

export default async function GenresPage() {
  const movies = await getTopMovies(409);
  const genres = getGenreLeaderboards(movies, 20);

  const genreEntries = Object.entries(genres);

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
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Genre Leaderboards</h1>
        <p className="text-[#666] text-lg max-w-2xl">
          The highest-rated films in each genre. Top 20 per category.
        </p>
      </div>

      {/* Genre Grid */}
      <div className="space-y-12">
        {genreEntries.map(([genre, genreMovies]) => (
          <div key={genre}>
            <h2 className="text-2xl font-bold text-white mb-4">{genre}</h2>
            <div className="p-4 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] space-y-1">
              {genreMovies.map((movie, index) => (
                <MovieRow key={movie.id} movie={movie} rank={index + 1} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {genreEntries.length === 0 && (
        <div className="text-center py-12 text-[#555]">
          <p>No genres found.</p>
        </div>
      )}
    </div>
  );
}
