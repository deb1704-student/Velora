import Link from 'next/link';
import {
  Search,
  MapPin,
  Calendar,
  Sparkles,
  Building2,
  Home,
  ShieldCheck,
  Clock,
  CreditCard,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-zinc-200 bg-white text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            <span>Verified Specialists & Licensed Partner Salons</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.15]">
            Salon-grade beauty services, delivered in-salon or to your home.
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Velora connects you directly with top-tier beauty specialists and accredited salons.
            Schedule confirmed appointments with real-time slot coordination and transparent pricing.
          </p>
        </div>

        {/* Booking Discovery Filter Bar */}
        <div className="mt-8 p-3 rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-zinc-200 bg-zinc-50/50 dark:border-zinc-700/60 dark:bg-zinc-950">
              <Search className="w-4 h-4 text-zinc-400" />
              <div className="flex-1 text-left">
                <span className="block text-[10px] uppercase font-bold text-zinc-500">Service</span>
                <input
                  type="text"
                  placeholder="e.g. Haircut, Facial, Spa"
                  className="w-full text-xs font-medium bg-transparent text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-zinc-200 bg-zinc-50/50 dark:border-zinc-700/60 dark:bg-zinc-950">
              <Home className="w-4 h-4 text-zinc-400" />
              <div className="flex-1 text-left">
                <span className="block text-[10px] uppercase font-bold text-zinc-500">Mode</span>
                <select className="w-full text-xs font-medium bg-transparent text-zinc-900 focus:outline-none dark:text-white">
                  <option value="both">In-Salon or Home-Service</option>
                  <option value="salon">Salon Appointment</option>
                  <option value="home">At-Home Service</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-md border border-zinc-200 bg-zinc-50/50 dark:border-zinc-700/60 dark:bg-zinc-950">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <div className="flex-1 text-left">
                <span className="block text-[10px] uppercase font-bold text-zinc-500">Location</span>
                <input
                  type="text"
                  placeholder="City or Postal Code"
                  className="w-full text-xs font-medium bg-transparent text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center">
              <button
                type="button"
                className="w-full h-full min-h-[42px] px-5 py-2.5 rounded-md bg-zinc-900 text-white font-medium text-xs hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <span>Search Available Slots</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Two Delivery Options */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-md bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
                <Building2 className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                In-Salon Appointments
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Book chair time and private treatment rooms at licensed partner salons.
                Browse staff credentials, review facility amenities, and avoid walk-in waiting times.
              </p>
            </div>
            <Link
              href="/salons"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100 pt-2"
            >
              <span>Explore partner salons</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-md bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
                <Home className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Home-Service Bookings
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Certified beauty specialists travel to your residence with sterile kits and professional tools.
                Enjoy personalized hair, skincare, and massage treatments in your private space.
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100 pt-2"
            >
              <span>View home-service catalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Structured Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Core Service Categories
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Standardized catalog with fixed durations, vetted procedures, and clear pricing.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Hair & Styling', items: 'Haircuts, Coloring, Keratin' },
            { name: 'Skincare & Facial', items: 'Cleanups, Peels, Hydration' },
            { name: 'Nails & Pedicure', items: 'Manicures, Gel Art, Spa Pedicure' },
            { name: 'Bridal & Grooming', items: 'Full Packages, Pre-bridal, Groom' },
            { name: 'Massage & Spa', items: 'Aromatherapy, Deep Tissue' },
          ].map((cat) => (
            <div
              key={cat.name}
              className="p-4 rounded-md border border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 transition-colors"
            >
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{cat.name}</h3>
              <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{cat.items}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Operational Standards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-lg border border-zinc-200 bg-zinc-100/60 dark:border-zinc-800 dark:bg-zinc-900/60 space-y-6">
          <div className="max-w-xl">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Platform Standards & Safety Commitments
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Every booking is managed through our authoritative transactional scheduling engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <UserCheck className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">KYC Verified</h3>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Identity documents, professional certifications, and trade skills are verified prior to activation.
              </p>
            </div>

            <div className="space-y-1.5">
              <Clock className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Guaranteed Slots</h3>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Server-side concurrency locks prevent double-booking across salon chairs and home travel windows.
              </p>
            </div>

            <div className="space-y-1.5">
              <CreditCard className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Protected Payments</h3>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Funds are held securely and settled only after successful service verification and completion.
              </p>
            </div>

            <div className="space-y-1.5">
              <Sparkles className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Auditable Records</h3>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Complete status timelines from arrival to completion with full dispute resolution support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Onboarding Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-zinc-200 rounded-lg p-6 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
              Are you a salon owner or professional beauty specialist?
            </h2>
            <p className="text-xs text-zinc-500">
              Grow your client base with Velora&apos;s automated scheduling, inventory management, and fast settlements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/partner/salon"
              className="px-3.5 py-1.5 text-xs font-medium rounded-md border border-zinc-300 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Register Salon
            </Link>
            <Link
              href="/partner/specialist"
              className="px-3.5 py-1.5 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Join as Specialist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
