import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, FileText, ArrowLeft, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Velora',
  description: 'Velora Marketplace Agreement, Booking Conditions, and Service Standards',
};

export default function TermsPage() {
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
          <Scale className="w-3.5 h-3.5 text-[#b3592c]" />
          <span>Marketplace Standards & Client Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1816] dark:text-white font-editorial">
          Terms & Conditions
        </h1>
        <p className="text-xs text-[#78716c] dark:text-[#a8a29e]">
          Effective Date: October 3, 2026 • Document Version 1.2
        </p>
      </div>

      {/* Notice Box */}
      <div className="p-4 rounded-[6px] border border-[#e2dfd7] bg-[#f7f5ef] dark:border-[#38342f] dark:bg-[#1a1816] text-xs text-[#57534e] dark:text-[#a8a29e] space-y-1">
        <p className="font-semibold text-[#1c1917] dark:text-[#f5f5f4]">
          Marketplace Operational Agreement
        </p>
        <p className="leading-relaxed">
          These Terms govern the reservation, fulfillment, cancellation, and settlement of salon treatments and at-home beauty services booked through the Velora platform.
        </p>
      </div>

      {/* Structured Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-[#44403c] dark:text-[#d6d3d1] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            1. Agreement to Terms & Relationship of Parties
          </h2>
          <p>
            By booking a service, offering specialist treatments, or listing salon facilities on Velora, you enter into a binding agreement governed by these terms. Velora operates as a verified scheduling and marketplace platform connecting clients with accredited independent beauty specialists and licensed salon ateliers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            2. Appointment Reservations & Slot Locking
          </h2>
          <p>
            All appointment slots are scheduled subject to verified provider availability and salon chair capacity. When a reservation request is submitted, Velora executes interactive transactional database locking to ensure the selected provider and workstation are reserved exclusively for the requested window. Once confirmed, a unique booking reference (<span className="font-mono text-xs">VEL-YYYYMMDD-XXXX</span>) is issued to all parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            3. Price Snapshots & Fee Transparency
          </h2>
          <p>
            The fee for each appointment includes the base treatment price, selected booster add-ons, applicable taxes, and platform coordination fees. At the time of reservation, Velora creates an immutable snapshot of all catalog prices. Subsequent price alterations in salon or platform catalogs will never increase or decrease the price of an already confirmed booking.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            4. Cancellation, Rescheduling & No-Show Policy
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#57534e] dark:text-[#a8a29e]">
            <li>
              <strong>Cancellation:</strong> Permitted prior to service commencement through the My Bookings portal with a recorded reason. Cancellations are prohibited once a service is in-progress or closed.
            </li>
            <li>
              <strong>Rescheduling:</strong> Permitted prior to specialist dispatch or salon arrival. The new requested date and time are re-validated in real-time against specialist shifts and salon chair capacity.
            </li>
            <li>
              <strong>No-Show:</strong> In the event a client fails to arrive or allow entry within the standard 30-minute grace period, the appointment may be formally recorded as a No-Show, and applicable provider cancellation allowances may apply.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            5. Professional Accreditation & Hygiene Standards
          </h2>
          <p>
            Specialists offering home-services are required to carry sterile, single-use disposable items where appropriate, professional salon-grade tools, and maintain verified identity documentation. Partner salons guarantee clean, inspected workstations and dedicated chair access during confirmed windows.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1a1816] dark:text-[#fafaf9]">
            6. Inquiries & Dispute Resolution
          </h2>
          <p>
            In the event of an appointment discrepancy, treatment dissatisfaction, or timing dispute, parties can initiate a formal review via the Velora client support desk at <span className="font-mono text-xs">concierge@velora.luxury</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
