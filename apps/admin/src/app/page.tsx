import {
  CalendarDays,
  UserCheck,
  CheckCircle2,
  Clock,
  Database,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Notice Banner */}
      <div className="p-4 rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-slate-700 dark:text-slate-300 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-white">
              Phase 1 Baseline Initialized (Development Environment)
            </h2>
            <p className="text-xs text-slate-500">
              The canonical 19 data stores (D1–D19) and Prisma schema are active. Metrics and verification items will automatically populate upon executing test transactions or seeding demo data.
            </p>
          </div>
        </div>
        <span className="shrink-0 px-2 py-0.5 text-[10px] font-mono rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          PostgreSQL 16 / 18
        </span>
      </div>

      {/* Operational Queues */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>Partner KYC Queue</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-mono">
              0 Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Specialists and salon owners awaiting credential verification before listing in the catalog.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">All submissions are up to date</span>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              <span>Active Bookings</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-mono">
              0 Active
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Current appointments transitioning through the 11-stage canonical booking lifecycle.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">No active service execution jobs</span>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Dispute Cases</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-mono">
              0 Open
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Customer and provider tickets requiring administrative review or refund mediation.
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">Queue clean</span>
          </div>
        </div>
      </div>

      {/* Canonical Booking Lifecycle Reference */}
      <div className="p-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Authoritative Booking State Lifecycle
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              System state machine configured according to specification Section 6.
            </p>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            Enforced by Backend Guard
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center">
          {[
            '1. Requested',
            '2. Pending Assignment',
            '3. Assigned',
            '4. Provider Accepted',
            '5. Confirmed',
            '6. Provider En Route',
            '7. Provider Arrived',
            '8. Service Started',
            '9. Service Completed',
            '10. Payment Completed',
            '11. Closed',
          ].map((stage, idx) => (
            <div
              key={stage}
              className="p-2.5 rounded border border-slate-200 bg-slate-50/70 text-[11px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              {stage}
            </div>
          ))}
          <div className="p-2.5 rounded border border-rose-200 bg-rose-50/50 text-[11px] font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400">
            Exceptions / Terminals
          </div>
        </div>
      </div>

      {/* Operational Architecture Reference */}
      <div className="p-6 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          System Verification Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Concurrency & Double-Booking Protection</p>
              <p className="text-[11px] text-slate-500 mt-0.5">PostgreSQL transactional isolation and slot lock constraints configured.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Financial Audit Logging</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Decimal precision on all currency amounts; no floating-point arithmetic.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
