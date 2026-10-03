import Link from 'next/link';
import { SearchX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <SearchX className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="text-xs text-zinc-500 leading-relaxed">
          The page or service you are searching for does not exist, has been relocated, or is temporarily unavailable.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
