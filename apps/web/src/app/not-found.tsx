import Link from 'next/link';
import { SearchX, ArrowLeft } from 'lucide-react';
import { Button } from '@velora/ui';

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16 bg-[#faf8f5]">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-[5px] bg-[#f0ece1] border border-[#ded8cb] flex items-center justify-center text-[#1a1816]">
          <SearchX className="w-5 h-5 stroke-[1.5]" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8c827a] block">
            404 — Record Missing
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#1a1816]">
            Page Not Found
          </h1>
          <p className="text-xs text-[#736b63] leading-relaxed max-w-sm mx-auto">
            The requested treatment, atelier studio, or route does not exist or has been relocated in the catalog.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" className="h-9 px-5 text-xs uppercase tracking-wider font-semibold">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              <span>Return to Catalog</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
