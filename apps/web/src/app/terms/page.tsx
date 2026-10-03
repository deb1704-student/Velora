import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Velora',
  description: 'Velora Platform Terms of Service and Operational Conditions',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-md p-4 text-xs mb-8">
        <strong>Notice:</strong> This operational agreement represents the baseline terms of service for the Velora platform and requires formal legal counsel review prior to live commercial deployment.
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
        Terms & Conditions
      </h1>
      <p className="text-xs text-zinc-500 mb-8">Last Updated: October 3, 2026</p>

      <div className="space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing or using the Velora platform (&quot;Velora&quot;), whether as a customer seeking services, an independent beauty specialist, or a partner salon business, you agree to comply with and be bound by these Terms and Conditions.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">2. Booking, Scheduling & Concurrency</h2>
          <p>
            All appointments are confirmed subject to availability. Velora utilizes transactional scheduling engines to prevent overlapping slots and double-booking. A booking is formally confirmed once accepted and confirmed by the provider or salon and backed by an authorized transaction.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">3. Cancellation & Refund Policy</h2>
          <p>
            Cancellations and rescheduling requests are subject to the applicable policy tier specified at the time of booking. Authorized refunds will be returned via the original payment method or credited to the customer&apos;s digital wallet pursuant to cancellation window rules.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">4. Provider Verification & Standards</h2>
          <p>
            All independent providers and partner salons must undergo verification (KYC and document review) before receiving client assignments or offering catalog services. Providers are responsible for maintaining all necessary health, hygiene, and local licensing standards.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-2">5. Reviews & Integrity</h2>
          <p>
            Reviews and ratings may only be submitted by verified customers who have completed an authentic booking with the respective provider or salon. Fabricated reviews, automated submissions, and defamatory content are strictly prohibited and subject to immediate account termination.
          </p>
        </section>
      </div>
    </div>
  );
}
