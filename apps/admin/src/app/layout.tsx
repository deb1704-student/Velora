import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import {
  LayoutDashboard,
  UserCheck,
  CalendarDays,
  Scissors,
  CreditCard,
  AlertCircle,
  ShieldAlert,
  Settings,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Velora Console — Administration & Operations',
  description: 'Operations, Verification, Financial Settlement & Audit Console for Velora Platform',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 flex">
        {/* Admin Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between shrink-0">
          <div>
            <div className="h-16 px-6 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="w-7 h-7 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center font-bold text-xs">
                V
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">Velora Console</span>
                <span className="text-[10px] text-slate-500 font-medium">Operations & Governance</span>
              </div>
            </div>

            <nav className="p-4 space-y-1 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Link
                href="/"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-white"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </Link>

              <Link
                href="/verifications"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Verifications (KYC)</span>
              </Link>

              <Link
                href="/bookings"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white transition-colors"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Bookings Lifecycle</span>
              </Link>

              <Link
                href="/services"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white transition-colors"
              >
                <Scissors className="w-4 h-4" />
                <span>Catalog & Salons</span>
              </Link>

              <Link
                href="/finance"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Payments & Settlements</span>
              </Link>

              <Link
                href="/disputes"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Support & Disputes</span>
              </Link>

              <Link
                href="/audit"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Audit & Security Logs</span>
              </Link>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
              <Settings className="w-4 h-4" />
              <span>System v1.0.0 (Dev)</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-6 flex items-center justify-between">
            <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Operations & Back-Office
            </h1>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                Authoritative Mode
              </span>
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                AD
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
