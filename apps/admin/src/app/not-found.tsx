import Link from 'next/link';
import { SearchX, ArrowLeft } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <SearchX className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Console Route Not Found
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested administrative module or governance entity does not exist or has been archived.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
