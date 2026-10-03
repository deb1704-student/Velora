import {
  CalendarDays,
  UserCheck,
  CheckCircle2,
  Clock,
  Database,
  ArrowRight,
  ShieldCheck,
  Building2,
  Scissors,
  Users,
  Activity,
  Lock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      {/* System Status Banner */}
      <div className="p-5 rounded-[5px] border border-[#e2e8f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-[4px] bg-[#090d16] text-white flex items-center justify-center shrink-0">
            <Database className="w-4 h-4 text-[#22c55e]" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#090d16]">
                Authoritative System Core Active
              </h2>
              <span className="px-1.5 py-0.2 rounded-[3px] bg-[#dcfce7] text-[#15803d] font-mono text-[10px] font-semibold">
                OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-[#64748b]">
              Canonical data stores D1–D19 running on PostgreSQL with transactional slot locking and immutable price snapshotting.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-[#475569] shrink-0">
          <span className="px-2 py-1 rounded-[4px] bg-[#f1f5f9] border border-[#e2e8f0]">
            API: http://localhost:4000
          </span>
          <span className="px-2 py-1 rounded-[4px] bg-[#f1f5f9] border border-[#e2e8f0]">
            Web: http://localhost:3000
          </span>
        </div>
      </div>

      {/* Operational Queues */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#090d16]">
            Operational Queues & Routing
          </h3>
          <span className="text-[11px] text-[#64748b] font-mono">Real-time status</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Queue 1: Bookings */}
          <Link
            href="/bookings"
            className="group p-5 rounded-[5px] border border-[#e2e8f0] bg-white hover:border-[#090d16] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#090d16]">
                <CalendarDays className="w-4 h-4 text-[#475569]" />
                <span>Active Bookings</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#090d16] transition-colors" />
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Live reservations transitioning through the 11-stage canonical lifecycle. Advance states, reschedule slots, or log no-shows.
            </p>
            <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
              <span className="text-[#64748b]">Lifecycle Monitor</span>
              <span className="font-semibold text-[#090d16] group-hover:underline">Inspect →</span>
            </div>
          </Link>

          {/* Queue 2: Workstation Capacity */}
          <Link
            href="/capacity"
            className="group p-5 rounded-[5px] border border-[#e2e8f0] bg-white hover:border-[#090d16] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#090d16]">
                <Clock className="w-4 h-4 text-[#475569]" />
                <span>Workstation Capacity</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#090d16] transition-colors" />
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Chair concurrency limits, hourly occupancy graphs, and specialist weekly availability intervals.
            </p>
            <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
              <span className="text-[#64748b]">Capacity Matrix</span>
              <span className="font-semibold text-[#090d16] group-hover:underline">Manage →</span>
            </div>
          </Link>

          {/* Queue 3: KYC Verification */}
          <Link
            href="/verifications"
            className="group p-5 rounded-[5px] border border-[#e2e8f0] bg-white hover:border-[#090d16] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-3 block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#090d16]">
                <UserCheck className="w-4 h-4 text-[#475569]" />
                <span>Partner KYC Queue</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] bg-[#fef3c7] text-[#92400e] font-semibold">
                REVIEW
              </span>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Audit government identification, trade credentials, and atelier licenses prior to marketplace catalog indexing.
            </p>
            <div className="pt-2 border-t border-[#f1f5f9] flex items-center justify-between text-[11px]">
              <span className="text-[#64748b]">Accreditation Audit</span>
              <span className="font-semibold text-[#090d16] group-hover:underline">Audit →</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Canonical Booking Lifecycle Reference */}
      <div className="p-6 rounded-[5px] border border-[#e2e8f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f1f5f9] pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#090d16]">
              Canonical Booking State Machine Architecture
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Enforced across NestJS BookingsModule with immutable status history audit logging.
            </p>
          </div>
          <span className="text-[10px] font-mono font-semibold text-[#166534] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-0.5 rounded-[3px]">
            GUARD CONSTRAINTS VERIFIED
          </span>
        </div>

        {/* 11 Canonical Stages Flow */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] font-semibold block">
            Progressive Forward Lifecycle (Stages 1 – 11)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { num: '01', name: 'Requested', desc: 'Slot locked' },
              { num: '02', name: 'Pending Assignment', desc: 'Routing provider' },
              { num: '03', name: 'Assigned', desc: 'Specialist designated' },
              { num: '04', name: 'Provider Accepted', desc: 'Specialist confirmed' },
              { num: '05', name: 'Confirmed', desc: 'Booking finalized' },
              { num: '06', name: 'Provider En Route', desc: 'Home dispatch' },
              { num: '07', name: 'Provider Arrived', desc: 'On-site checkin' },
              { num: '08', name: 'Service Started', desc: 'Treatment in-progress' },
              { num: '09', name: 'Service Completed', desc: 'Treatment done' },
              { num: '10', name: 'Payment Completed', desc: 'Settlement confirmed' },
              { num: '11', name: 'Closed', desc: 'Archived ledger' },
            ].map((stage) => (
              <div
                key={stage.num}
                className="p-3 rounded-[4px] border border-[#e2e8f0] bg-[#fafafa] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#94a3b8] font-bold">{stage.num}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#090d16]" />
                </div>
                <div className="text-xs font-bold text-[#090d16] truncate">{stage.name}</div>
                <div className="text-[10px] text-[#64748b]">{stage.desc}</div>
              </div>
            ))}

            <div className="p-3 rounded-[4px] border border-[#fecdd3] bg-[#fff1f2] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-[#e11d48] font-bold">TERM</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
              </div>
              <div className="text-xs font-bold text-[#9f1239]">Terminal States</div>
              <div className="text-[10px] text-[#be123c]">Cancelled / No-Show</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Integrity & Operational Guarantees */}
      <div className="p-6 rounded-[5px] border border-[#e2e8f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#090d16]">
          System Verification & Operational Constraints
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-[4px] border border-[#f1f5f9] bg-[#fafafa] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#090d16]">
              <Lock className="w-4 h-4 text-[#16a34a]" />
              <span>Concurrency Lock</span>
            </div>
            <p className="text-[#64748b] text-[11px] leading-relaxed">
              PostgreSQL transactional row locking prevents double-booking across simultaneous specialist allocations.
            </p>
          </div>

          <div className="p-4 rounded-[4px] border border-[#f1f5f9] bg-[#fafafa] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#090d16]">
              <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
              <span>Immutable Pricing</span>
            </div>
            <p className="text-[#64748b] text-[11px] leading-relaxed">
              Base procedure, selected addons, and taxes are permanently snapshotted at time of reservation creation.
            </p>
          </div>

          <div className="p-4 rounded-[4px] border border-[#f1f5f9] bg-[#fafafa] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#090d16]">
              <Layers className="w-4 h-4 text-[#16a34a]" />
              <span>Transition Audit Trail</span>
            </div>
            <p className="text-[#64748b] text-[11px] leading-relaxed">
              Every status shift records actor ID, timestamp, prior state, target state, and operational change notes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
