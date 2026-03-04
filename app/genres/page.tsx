import Link from 'next/link';
import { getTopMovies } from '@/lib/supabase';
import { getGenreLeaderboards } from '@/lib/analytics';
import { GenreFilter } from '@/app/components/GenreFilter';

export const metadata = {
  title: 'Genre Leaderboards — CrowdAndCritic',
  description: 'The highest-rated films in each genre.',
};

export default async function GenresPage() {
  const movies = await getTopMovies(1000);
  const genres = getGenreLeaderboards(movies, 20);

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

      {/* Genre Filter & Display (Client Component) */}
      <GenreFilter genres={genres} />
    </div>
  );
}
