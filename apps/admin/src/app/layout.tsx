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
  Clock,
  Building2,
  Users,
  Activity,
  Database,
  Terminal,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Velora Operations Console — Mission Control',
  description: 'Authoritative back-office, capacity management, lifecycle monitoring, and governance console for Velora Platform.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8fafc] text-[#090d16] antialiased flex flex-col md:flex-row">
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#e2e8f0] bg-white flex flex-col justify-between shrink-0">
          <div>
            {/* Header Brand */}
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#f1f5f9]">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-[4px] bg-[#090d16] text-white flex items-center justify-center font-bold font-serif text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  V
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-xs tracking-tight uppercase">Velora Console</span>
                  <span className="text-[10px] text-[#64748b] font-mono">BACK-OFFICE & GOVERNANCE</span>
                </div>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#f1f5f9] text-[#475569] rounded-[3px] border border-[#e2e8f0]">
                v1.0
              </span>
            </div>

            {/* Navigation Groups */}
            <nav className="p-3 space-y-4 text-xs">
              {/* Group 1: Core Operations */}
              <div>
                <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] font-semibold block mb-1">
                  Core Operations
                </span>
                <div className="space-y-0.5">
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] text-[#090d16] hover:bg-[#f1f5f9] font-medium transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#475569]" />
                    <span>Mission Overview</span>
                  </Link>

                  <Link
                    href="/bookings"
                    className="flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[#090d16] hover:bg-[#f1f5f9] font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className="w-4 h-4 text-[#475569]" />
                      <span>Bookings Lifecycle</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
                      11 STAGES
                    </span>
                  </Link>

                  <Link
                    href="/capacity"
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] text-[#090d16] hover:bg-[#f1f5f9] font-medium transition-colors"
                  >
                    <Clock className="w-4 h-4 text-[#475569]" />
                    <span>Workstations & Capacity</span>
                  </Link>

                  <Link
                    href="/verifications"
                    className="flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[#090d16] hover:bg-[#f1f5f9] font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-[#475569]" />
                      <span>Verifications (KYC)</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#b45309]" />
                  </Link>
                </div>
              </div>

              {/* Group 2: Catalog & Network */}
              <div>
                <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] font-semibold block mb-1">
                  Catalog & Network
                </span>
                <div className="space-y-0.5">
                  <a
                    href="http://localhost:3000/services"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[#475569] hover:bg-[#f1f5f9] hover:text-[#090d16] font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Scissors className="w-4 h-4 text-[#64748b]" />
                      <span>Service Catalog</span>
                    </div>
                    <span className="text-[10px] text-[#94a3b8]">Live ↗</span>
                  </a>

                  <a
                    href="http://localhost:3000/salons"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[#475569] hover:bg-[#f1f5f9] hover:text-[#090d16] font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#64748b]" />
                      <span>Atelier Studios</span>
                    </div>
                    <span className="text-[10px] text-[#94a3b8]">Live ↗</span>
                  </a>

                  <a
                    href="http://localhost:3000/providers"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[#475569] hover:bg-[#f1f5f9] hover:text-[#090d16] font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#64748b]" />
                      <span>Specialist Roster</span>
                    </div>
                    <span className="text-[10px] text-[#94a3b8]">Live ↗</span>
                  </a>
                </div>
              </div>

              {/* Group 3: Governance */}
              <div>
                <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[#94a3b8] font-semibold block mb-1">
                  Governance & Audit
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[#94a3b8] font-medium cursor-not-allowed">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4" />
                      <span>Settlements (Escrow)</span>
                    </div>
                    <span className="text-[9px] font-mono">Q4 Phase</span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[#94a3b8] font-medium cursor-not-allowed">
                    <div className="flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Dispute Mediation</span>
                    </div>
                    <span className="text-[9px] font-mono">Q4 Phase</span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-2 rounded-[4px] text-[#94a3b8] font-medium cursor-not-allowed">
                    <div className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Audit Logs (D19)</span>
                    </div>
                    <span className="text-[9px] font-mono">Active</span>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* System Footer info */}
          <div className="p-4 border-t border-[#f1f5f9] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#64748b] font-mono">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>PostgreSQL 16</span>
              </span>
              <span className="px-1.5 py-0.2 rounded-[3px] bg-[#dcfce7] text-[#15803d] font-semibold text-[10px]">
                ONLINE
              </span>
            </div>
            <div className="text-[10px] text-[#94a3b8] font-mono">
              Port 4000 • Prisma 5.22.0
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-[#e2e8f0] bg-white px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#090d16]">
                Operational Command
              </span>
              <span className="text-[#cbd5e1]">/</span>
              <span className="text-xs text-[#64748b] font-medium">
                Authoritative State Controller
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-medium bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
                <Activity className="w-3 h-3 text-[#16a34a]" />
                <span>Lifecycle Engine Enforced</span>
              </span>
              <div className="w-8 h-8 rounded-[4px] bg-[#090d16] flex items-center justify-center text-xs font-mono font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                OPS
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
