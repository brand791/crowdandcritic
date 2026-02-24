import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-7xl mb-6">🎞️</div>
      <h1 className="text-3xl font-bold text-white mb-3">Film Not Found</h1>
      <p className="text-[#666] mb-8 max-w-sm">
        This movie isn&apos;t in our database yet. We&apos;re constantly adding new films.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-[#f5a623] text-black font-semibold hover:bg-[#f7b84b] transition-colors"
      >
        Back to Rankings
      </Link>
    </div>
  );
}
