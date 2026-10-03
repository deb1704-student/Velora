import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — Velora',
  description: 'Velora Privacy Policy, Personal Data Protection, and Information Governance Notice',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Breadcrumb / Back */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#78716c] hover:text-[#1c1917] dark:hover:text-[#f5f5f4] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Marketplace</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3 pb-8 border-b border-[#e5e0d5] dark:border-[#2e2a26]">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] border border-[#e2ded5] bg-[#f4f1ea] dark:border-[#38332d] dark:bg-[#1f1c19] text-xs font-medium text-[#44403c] dark:text-[#d6d3d1]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#274c3a] dark:text-[#86efac]" />
          <span>Data Governance & Client Confidentiality</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1816] dark:text-white font-editorial">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">
          Effective Date: October 3, 2026 • Document Version 1.2
        </p>
      </div>

      {/* Policy Framework Notice */}
      <div className="p-4 rounded-[6px] border border-[#e2dfd7] bg-[#f7f5ef] dark:border-[#38342f] dark:bg-[#1a1816] text-xs text-[#57534e] dark:text-[#a8a29e] space-y-1">
        <p className="font-semibold text-[#1c1917] dark:text-[#f5f5f4]">
          Operational Policy Framework
        </p>
        <p className="leading-relaxed">
          This document describes how Velora collects, processes, and protects client, specialist, and salon partner information across appointment booking, service coordination, and settlement workflows.
        </p>
      </div>

      {/* Structured Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-[#44403c] dark:text-[#d6d3d1] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            1. Scope and Applicable Roles
          </h2>
          <p>
            This Privacy Notice applies to all registered and visiting users of Velora, including clients booking in-salon and home services, beauty specialists providing certified treatments, partner salon owners and managers, and operational staff.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            2. Categories of Information Collected
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-[6px] border border-[#e5e0d5] bg-white dark:border-[#2e2a26] dark:bg-[#181614] space-y-1.5">
              <span className="font-semibold text-xs text-[#1a1816] dark:text-white">
                Client Profile & Addresses
              </span>
              <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-snug">
                Full name, verified contact email, telephone, service notes, and physical destination addresses for home-service delivery.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-[#e5e0d5] bg-white dark:border-[#2e2a26] dark:bg-[#181614] space-y-1.5">
              <span className="font-semibold text-xs text-[#1a1816] dark:text-white">
                Appointment & Transaction Records
              </span>
              <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-snug">
                Service item selections, add-on boosters, timestamps, snapshotted catalog prices, appointment audit states, and settlement references.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-[#e5e0d5] bg-white dark:border-[#2e2a26] dark:bg-[#181614] space-y-1.5">
              <span className="font-semibold text-xs text-[#1a1816] dark:text-white">
                Provider KYC & Credentials
              </span>
              <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-snug">
                Professional accreditation certificates, trade experience, working hour schedules, and geographic service radii.
              </p>
            </div>

            <div className="p-4 rounded-[6px] border border-[#e5e0d5] bg-white dark:border-[#2e2a26] dark:bg-[#181614] space-y-1.5">
              <span className="font-semibold text-xs text-[#1a1816] dark:text-white">
                Device & Operational Telemetry
              </span>
              <p className="text-xs text-[#78716c] dark:text-[#a8a29e] leading-snug">
                Session tokens, authentication logs, role permissions, and system audit trail metadata for security governance.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            3. Purpose of Processing
          </h2>
          <p>
            Your information is processed strictly to support genuine marketplace functions:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#57534e] dark:text-[#a8a29e]">
            <li>Calculating accurate specialist availability and workstation chair capacity.</li>
            <li>Enforcing transactional race-condition prevention during simultaneous reservation attempts.</li>
            <li>Enabling providers to navigate to verified client residences for at-home appointments.</li>
            <li>Maintaining auditable state-machine transition history for service and dispute resolution.</li>
            <li>Issuing itemized price snapshots that protect existing bookings from post-booking catalog alterations.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            4. Security Architecture & Access Control
          </h2>
          <p>
            Velora utilizes role-based access control (RBAC), TLS transmission encryption, and database-level transactional isolation. Sensitive user credentials are stored using salted cryptographic hashes. Payment card details are processed directly through certified PCI-DSS payment partners and are never stored on Velora application databases.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            5. User Rights & Inquiries
          </h2>
          <p>
            Users retain the right to review, update, or request deactivation of their profile and stored delivery addresses at any time through the Velora account settings. For regulatory inquiries, contact the Velora Data Governance Office at <span className="font-mono text-xs">privacy@velora.luxury</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
