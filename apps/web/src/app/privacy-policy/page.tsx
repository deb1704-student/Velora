import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Velora',
  description: 'Velora Privacy Policy and Data Protection Notice',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md p-4 text-xs mb-8">
        <strong>Notice:</strong> This document represents the functional policy framework for the Velora platform and requires formal legal counsel review prior to live commercial deployment in applicable jurisdictions.
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
        Privacy Policy
      </h1>
      <p className="text-xs text-zinc-500 mb-8">Last Updated: October 3, 2026</p>

      <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">1. Overview</h2>
          <p>
            Velora (&quot;the Platform&quot;) is committed to protecting the privacy and personal data of its users, including customers, service specialists, salon partners, and administrative personnel. This Privacy Policy outlines our standards for collecting, processing, and safeguarding your information.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <li><strong>Account Information:</strong> Name, verified email address, phone number, role, and encrypted credentials.</li>
            <li><strong>Service & Booking Details:</strong> Requested services, appointment times, specialist selections, service locations (for home-service delivery), and cancellation records.</li>
            <li><strong>Payment & Financial Data:</strong> Transaction references, payment methods, settlement records, and invoice details. Note that complete payment card data is processed directly via PCI-DSS compliant payment gateways and is not stored on Velora application servers.</li>
            <li><strong>Provider Information:</strong> Professional experience, identity/KYC documents, skill certifications, operating radius, and availability schedules.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">3. How Information is Used</h2>
          <p>
            Information collected is strictly utilized to facilitate appointment scheduling, verify specialist qualifications, prevent double-booking, calculate travel radius for home services, process payments, and maintain mandatory audit trails for financial transactions.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">4. Data Retention and Security</h2>
          <p>
            We implement industry-standard encryption, strict role-based access control (RBAC), and transactional integrity protocols. Records are retained strictly as required by applicable commercial and accounting regulations.
          </p>
        </section>
      </div>
    </div>
  );
}
