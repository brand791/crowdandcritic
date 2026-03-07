import Link from 'next/link';
import Image from 'next/image';
import { getTopMovies } from '@/lib/supabase';
import { getDirectorScores } from '@/lib/analytics';

export const metadata = {
  title: 'Director Scorecards — CrowdAndCritic',
  description: 'Rankings of filmmakers by their average film score.',
};

export default async function DirectorsPage() {
  const movies = await getTopMovies(1000); // Fetch all scored movies to include all directors
  const directors = getDirectorScores(movies);

  // Only show directors with 2+ movies for meaningful stats
  const qualifiedDirectors = directors.filter(d => d.movieCount >= 2);

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
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Director Scorecards</h1>
        <p className="text-[#666] text-lg max-w-2xl">
          Filmmakers ranked by number of films on our list. (Min. 2 films)
        </p>
      </div>

      {/* Directors List */}
      <div className="space-y-4">
        {qualifiedDirectors.map((director, index) => (
          <details
            key={director.name}
            className="group p-5 rounded-lg bg-[#111] border border-[#222] hover:border-[#333] transition-colors"
          >
            <summary className="cursor-pointer flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-sm font-bold text-[#888]">#{index + 1}</span>
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#f5a623] transition-colors">
                    {director.name}
                  </h3>
                </div>
                <p className="text-sm text-[#666]">
                  {director.movieCount} film{director.movieCount !== 1 ? 's' : ''} • Avg: <span className="text-[#f5a623] font-semibold">{director.averageScore.toFixed(1)}</span>
                </p>
              </div>
              <div className="shrink-0 text-[#555] group-open:text-[#f5a623] transition-colors">
                ▼
              </div>
            </summary>

            {/* Filmography */}
            <div className="mt-4 pt-4 border-t border-[#1a1a1a] space-y-2">
              {director.movies.map((movie, idx) => {
                const score = movie.movie_scores?.[0];
                const composite = score?.composite_score ?? 0;
                const posterUrl = movie.poster_url || '/placeholder-poster.svg';

                return (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    className="group/movie flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent hover:border-[#2a2a2a] hover:bg-[#0a0a0a] transition-all"
                  >
                    <div className="w-6 text-right text-xs font-semibold text-[#555]">{idx + 1}</div>

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
                      <h4 className="font-medium text-[#d8d8d8] group-hover/movie:text-white truncate text-sm">
                        {movie.title}
                      </h4>
                      <p className="text-xs text-[#555]">{movie.year}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[#f5a623] font-semibold text-sm">{composite.toFixed(1)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      {qualifiedDirectors.length === 0 && (
        <div className="text-center py-12 text-[#555]">
          <p>No directors with multiple films found.</p>
        </div>
      )}

      {/* Solo directors note */}
      <div className="mt-12 p-4 rounded-lg bg-[#0f0f0f] border border-[#1a1a1a] text-xs text-[#555]">
        <p>
          Showing {qualifiedDirectors.length} director{qualifiedDirectors.length !== 1 ? 's' : ''} with 2+ films. ({directors.length - qualifiedDirectors.length} director{directors.length - qualifiedDirectors.length !== 1 ? 's' : ''} with single film{directors.length - qualifiedDirectors.length !== 1 ? 's' : ''} excluded)
        </p>
      </div>
    </div>
  );
}
