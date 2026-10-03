import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Velora — Salon Service Management & Marketplace Platform',
  description:
    'Velora connects discerning clients with verified beauty specialists and accredited partner salons for home-service and in-salon appointments.',
  openGraph: {
    title: 'Velora — Salon Service Management & Marketplace Platform',
    description:
      'Book verified beauty specialists and top-rated salons with seamless scheduling, transparent pricing, and secure payments.',
    url: 'https://velora.luxury',
    siteName: 'Velora',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1a1816] antialiased selection:bg-[#1c1917] selection:text-[#fafaf9] dark:bg-[#141211] dark:text-[#f5f3ef]">
        {/* Editorial Tactile Top Navigation */}
        <header className="sticky top-0 z-40 w-full border-b border-[#e5e0d5] bg-[#faf8f5]/92 backdrop-blur-md dark:border-[#2e2a26] dark:bg-[#141211]/92">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo & Monogram */}
            <Link
              href="/"
              className="flex items-center gap-3 font-semibold text-lg tracking-tight text-[#1a1816] dark:text-white group"
            >
              <span className="w-8 h-8 rounded-[4px] bg-[#1a1816] text-[#faf8f5] dark:bg-[#f5f3ef] dark:text-[#1a1816] flex items-center justify-center font-bold text-sm shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] group-hover:bg-[#2e2a26] transition-colors relative">
                <span>V</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#b3592c] absolute top-1.5 right-1.5" />
              </span>
              <div className="flex flex-col">
                <span className="font-editorial text-xl font-bold tracking-tight leading-none">
                  Velora
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#736d65] dark:text-[#a69f95] font-sans font-medium mt-0.5">
                  Atelier & At-Home
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#57524b] dark:text-[#c4bdb2]">
              <Link
                href="/services"
                className="hover:text-[#1a1816] dark:hover:text-white transition-colors"
              >
                Treatments & Services
              </Link>
              <Link
                href="/salons"
                className="hover:text-[#1a1816] dark:hover:text-white transition-colors"
              >
                Partner Ateliers
              </Link>
              <Link
                href="/providers"
                className="hover:text-[#1a1816] dark:hover:text-white transition-colors"
              >
                Verified Specialists
              </Link>
              <Link
                href="/bookings"
                className="hover:text-[#1a1816] dark:hover:text-white transition-colors font-semibold flex items-center gap-1"
              >
                <span>My Bookings</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#274c3a] dark:bg-[#86efac]" />
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-medium text-[#44403c] hover:text-[#1a1816] dark:text-[#d6d3d1] dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-[5px] bg-[#1a1816] text-[#fafaf9] hover:bg-[#292524] border border-[#1a1816] shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] dark:bg-[#f5f5f4] dark:text-[#1c1917] dark:hover:bg-[#e7e5e4] transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        {/* Structured Luxury Footer */}
        <footer className="border-t border-[#e5e0d5] bg-[#f5f2eb] dark:border-[#2e2a26] dark:bg-[#181614] mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand Statement */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 font-semibold text-[#1a1816] dark:text-white">
                  <span className="w-6 h-6 rounded-[3px] bg-[#1a1816] text-white dark:bg-[#f5f3ef] dark:text-[#1a1816] flex items-center justify-center font-bold text-xs">
                    V
                  </span>
                  <span className="font-editorial text-lg tracking-tight font-bold">Velora</span>
                </div>
                <p className="text-xs text-[#736d65] dark:text-[#a69f95] leading-relaxed">
                  Authoritative Salon Service Management and Marketplace platform. Providing real-time transactional slot coordination for atelier visits and private residence appointments.
                </p>
                <div className="pt-1 flex items-center gap-2 text-[10px] text-[#736d65] dark:text-[#a69f95]">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#274c3a]" />
                  <span>Guaranteed Concurrency & Anti-Double-Booking Engine</span>
                </div>
              </div>

              {/* Discover */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1816] dark:text-[#f5f3ef] mb-3">
                  Marketplace Discovery
                </h4>
                <ul className="space-y-2 text-xs text-[#57524b] dark:text-[#c4bdb2]">
                  <li>
                    <Link href="/services" className="hover:underline hover:text-[#1a1816] dark:hover:text-white">
                      Curated Service Catalog
                    </Link>
                  </li>
                  <li>
                    <Link href="/salons" className="hover:underline hover:text-[#1a1816] dark:hover:text-white">
                      Partner Salon Ateliers
                    </Link>
                  </li>
                  <li>
                    <Link href="/providers" className="hover:underline hover:text-[#1a1816] dark:hover:text-white">
                      Verified Beauty Specialists
                    </Link>
                  </li>
                  <li>
                    <Link href="/bookings" className="hover:underline hover:text-[#1a1816] dark:hover:text-white">
                      My Appointments Portal
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Operations & Partners */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1816] dark:text-[#f5f3ef] mb-3">
                  Professional Network
                </h4>
                <ul className="space-y-2 text-xs text-[#57524b] dark:text-[#c4bdb2]">
                  <li>
                    <Link href="/register" className="hover:underline hover:text-[#1a1816] dark:hover:text-white">
                      Join as Beauty Specialist
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:underline hover:text-[#1a1816] dark:hover:text-white">
                      Register Atelier Salon
                    </Link>
                  </li>
                  <li>
                    <a
                      href="http://localhost:3001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-[#1a1816] dark:hover:text-white flex items-center gap-1"
                    >
                      <span>Operations Console</span>
                      <span className="text-[10px] text-[#736d65]">↗</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal & Governance */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a1816] dark:text-[#f5f3ef] mb-3">
                  Governance & Trust
                </h4>
                <ul className="space-y-2 text-xs text-[#57524b] dark:text-[#c4bdb2]">
                  <li>
                    <Link href="/privacy" className="hover:underline hover:text-[#1a1816] dark:hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:underline hover:text-[#1a1816] dark:hover:text-white">
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <span className="text-[11px] text-[#736d65] dark:text-[#a69f95] block pt-1">
                      No fabricated reviews, artificial scarcity, or automated activity counters.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-10 pt-6 border-t border-[#e5e0d5] dark:border-[#2e2a26] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#736d65] dark:text-[#a69f95]">
              <p>&copy; {new Date().getFullYear()} Velora Platform. All rights reserved.</p>
              <p className="mt-2 sm:mt-0 font-medium">
                Engineered for High-Consequence Appointment Scheduling
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
