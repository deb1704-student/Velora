import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Velora — Salon Service Management & Marketplace Platform',
  description:
    'Velora connects customers with verified beauty professionals and premium salons for home-service and in-salon appointments.',
  openGraph: {
    title: 'Velora — Salon Service Management & Marketplace Platform',
    description:
      'Book verified beauty specialists and top-rated salons with seamless scheduling, transparent pricing, and secure payments.',
    url: 'https://velora.local',
    siteName: 'Velora',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-zinc-50/50 text-zinc-900 antialiased selection:bg-zinc-900 selection:text-white dark:bg-zinc-950 dark:text-zinc-50">
        <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 font-semibold text-lg tracking-tight text-zinc-900 dark:text-white">
              <span className="w-8 h-8 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm">
                V
              </span>
              <span>Velora</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              <Link href="/services" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                Services
              </Link>
              <Link href="/salons" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                Salons
              </Link>
              <Link href="/providers" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                Specialists
              </Link>
              <Link href="/bookings" className="hover:text-zinc-950 dark:hover:text-white transition-colors font-medium">
                My Bookings
              </Link>
              <Link href="/about" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
                About
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors shadow-xs"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                  <span className="w-6 h-6 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
                    V
                  </span>
                  <span>Velora</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Advanced Salon Service Management and Marketplace Platform supporting in-salon and home-service appointments.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
                  Discover
                </h4>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <li><Link href="/services" className="hover:underline">Catalog Services</Link></li>
                  <li><Link href="/salons" className="hover:underline">Partner Salons</Link></li>
                  <li><Link href="/providers" className="hover:underline">Verified Specialists</Link></li>
                  <li><Link href="/packages" className="hover:underline">Service Packages</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
                  For Partners
                </h4>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <li><Link href="/partner/salon" className="hover:underline">Register Salon</Link></li>
                  <li><Link href="/partner/specialist" className="hover:underline">Join as Specialist</Link></li>
                  <li><Link href="/partner/portal" className="hover:underline">Provider Portal</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-3">
                  Legal & Trust
                </h4>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:underline">Terms & Conditions</Link></li>
                  <li><Link href="/support" className="hover:underline">Customer Support</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500">
              <p>&copy; {new Date().getFullYear()} Velora Platform. All rights reserved.</p>
              <p className="mt-2 sm:mt-0">Enterprise Grade Salon & Service Management System</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
