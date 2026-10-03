'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Star,
  Compass,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@velora/ui';
import { catalogApi, salonsApi } from '../lib/api';
import { SlotBookingDrawer, ServiceForBooking } from '../components/SlotBookingDrawer';

export default function HomePage() {
  const router = useRouter();

  // Search Widget State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedMode, setSelectedMode] = React.useState<'both' | 'SALON' | 'HOME'>('both');
  const [selectedCity, setSelectedCity] = React.useState('Bengaluru');

  // Featured Catalog Services State
  const [featuredServices, setFeaturedServices] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = React.useState(true);

  // Slot Booking Drawer State
  const [activeBookingService, setActiveBookingService] = React.useState<ServiceForBooking | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    Promise.all([
      catalogApi.getCategories().catch(() => ({ data: [] })),
      catalogApi.getServices({ limit: 4 }).catch(() => ({ data: [] })),
    ])
      .then(([catRes, servRes]) => {
        if (!isMounted) return;
        if (catRes.data) setCategories(catRes.data);
        if (servRes.data) setFeaturedServices(servRes.data);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCatalog(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedMode !== 'both') params.set('deliveryType', selectedMode);
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-12">
      {/* 1. Hero Section: Concrete, Trustworthy, Editorial */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-5">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] border border-[#e2ded5] bg-[#f4f1ea] dark:border-[#332f2b] dark:bg-[#1e1b18] text-xs font-medium text-[#44403c] dark:text-[#d6d3d1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b3592c]" />
            <span>Verified Atelier Workstations & Certified In-Home Specialists</span>
          </div>

          {/* Primary Concrete Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#1a1816] dark:text-[#fafaf9] font-editorial leading-[1.12]">
            Reserve verified salon treatments and in-home beauty services.
          </h1>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-base text-[#615b53] dark:text-[#b5ada1] leading-relaxed max-w-2xl">
            Velora connects you directly with accredited partner salons and vetted beauty professionals. Every reservation is verified with real-time slot revalidation and immutable price snapshots.
          </p>
        </div>

        {/* 2. Interactive Discovery Bar */}
        <div className="mt-8 p-3 sm:p-4 rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] shadow-[0_2px_8px_rgba(26,24,22,0.04),0_1px_2px_rgba(26,24,22,0.02)]">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Treatment Search */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[5px] border border-[#e5e0d5] bg-[#faf8f5] dark:border-[#2e2a26] dark:bg-[#141211] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              <Search className="w-4 h-4 text-[#8c857b] shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <label htmlFor="service-search-input" className="block text-[9px] uppercase font-bold tracking-wider text-[#8c857b]">
                  Treatment or Procedure
                </label>
                <input
                  id="service-search-input"
                  type="text"
                  placeholder="e.g. Balayage, Hydrafacial, Manicure..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs font-medium bg-transparent text-[#1a1816] placeholder:text-[#a8a29e] focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[5px] border border-[#e5e0d5] bg-[#faf8f5] dark:border-[#2e2a26] dark:bg-[#141211] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              <Compass className="w-4 h-4 text-[#8c857b] shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <label htmlFor="delivery-mode-select" className="block text-[9px] uppercase font-bold tracking-wider text-[#8c857b]">
                  Appointment Mode
                </label>
                <select
                  id="delivery-mode-select"
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value as any)}
                  className="w-full text-xs font-medium bg-transparent text-[#1a1816] focus:outline-none dark:text-white cursor-pointer"
                >
                  <option value="both">Both In-Salon & At-Home</option>
                  <option value="SALON">Atelier Salon Visit</option>
                  <option value="HOME">Private Residence Visit</option>
                </select>
              </div>
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[5px] border border-[#e5e0d5] bg-[#faf8f5] dark:border-[#2e2a26] dark:bg-[#141211] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
              <MapPin className="w-4 h-4 text-[#8c857b] shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <label htmlFor="city-select" className="block text-[9px] uppercase font-bold tracking-wider text-[#8c857b]">
                  Service Territory
                </label>
                <select
                  id="city-select"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-xs font-medium bg-transparent text-[#1a1816] focus:outline-none dark:text-white cursor-pointer"
                >
                  <option value="Bengaluru">Bengaluru (Indiranagar, Lavelle Rd)</option>
                  <option value="Mumbai">Mumbai (Bandra, Juhu)</option>
                  <option value="Delhi NCR">Delhi NCR (Vasant Vihar, Gurugram)</option>
                </select>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="flex items-center">
              <Button
                type="submit"
                variant="primary"
                className="w-full h-full min-h-[46px] rounded-[5px] text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Find Available Slots</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Two Dual Delivery Modes: Clear Architectural Distinction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Atelier Salon Visits */}
          <div className="p-6 sm:p-8 rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-[4px] bg-[#f4f1ea] dark:bg-[#24211e] flex items-center justify-center border border-[#e2ded5] dark:border-[#38332d]">
                <Building2 className="w-5 h-5 text-[#1a1816] dark:text-[#f5f3ef]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#b3592c]">
                  Physical Destination
                </span>
                <h2 className="text-xl font-bold text-[#1a1816] dark:text-white font-editorial">
                  Atelier Salon Workstations
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
                Reserve dedicated chair time and private suites at vetted salons. Real-time workstation capacity ensures guaranteed chair availability without walk-in delays or waiting room queues.
              </p>
              <ul className="space-y-1.5 text-xs text-[#57524b] dark:text-[#c4bdb2] pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#274c3a] shrink-0" />
                  <span>Real-time chair capacity tracking (no overbooking)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#274c3a] shrink-0" />
                  <span>Licensed facilities with professional sanitary suites</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-[#f0ebe1] dark:border-[#24211e]">
              <Link
                href="/salons"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a1816] dark:text-[#f5f3ef] hover:underline"
              >
                <span>Browse partner salons & chair capacity</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* At-Home Private Residence Visits */}
          <div className="p-6 sm:p-8 rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-[4px] bg-[#f4f1ea] dark:bg-[#24211e] flex items-center justify-center border border-[#e2ded5] dark:border-[#38332d]">
                <Home className="w-5 h-5 text-[#1a1816] dark:text-[#f5f3ef]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#b3592c]">
                  Private Residence
                </span>
                <h2 className="text-xl font-bold text-[#1a1816] dark:text-white font-editorial">
                  At-Home Specialist Appointments
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
                KYC-verified beauty specialists arrive directly at your residence with sterile toolkits and professional-grade formulations. Enjoy hair, facial, and massage treatments in private comfort.
              </p>
              <ul className="space-y-1.5 text-xs text-[#57524b] dark:text-[#c4bdb2] pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#274c3a] shrink-0" />
                  <span>Sterilized tools & single-use disposable wraps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#274c3a] shrink-0" />
                  <span>En-route telemetry and arrival check-in verification</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-[#f0ebe1] dark:border-[#24211e]">
              <Link
                href="/services?deliveryType=HOME"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a1816] dark:text-[#f5f3ef] hover:underline"
              >
                <span>View at-home treatment menu</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Real Curated Catalog Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c857b]">
              Catalog Architecture
            </span>
            <h2 className="text-2xl font-bold text-[#1a1816] dark:text-white font-editorial">
              Standardized Treatment Categories
            </h2>
            <p className="text-xs text-[#615b53] dark:text-[#b5ada1] mt-0.5">
              Structured procedures with verified runtime durations and fixed base pricing.
            </p>
          </div>
          <Link
            href="/services"
            className="text-xs font-semibold text-[#1a1816] dark:text-[#f5f3ef] hover:underline inline-flex items-center gap-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categories.length > 0
            ? categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/services?categoryId=${cat.id}`}
                  className="p-5 rounded-[6px] border border-[#ded8cb] bg-white hover:border-[#b8b3a7] dark:border-[#2e2a26] dark:bg-[#181614] dark:hover:border-[#423d38] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2 group"
                >
                  <div className="w-8 h-8 rounded-[4px] bg-[#f4f1ea] dark:bg-[#24211e] flex items-center justify-center text-[#1a1816] dark:text-[#fafaf9]">
                    <Sparkles className="w-4 h-4 text-[#b3592c]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#1a1816] dark:text-[#fafaf9] group-hover:text-[#b3592c] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-[#736d65] dark:text-[#a69f95] mt-0.5 line-clamp-1">
                      {cat.description || 'Verified procedures'}
                    </p>
                  </div>
                </Link>
              ))
            : [
                { name: 'Hair & Styling', desc: 'Precision cuts, balayage, glazes' },
                { name: 'Skincare & Facials', desc: 'Hydrafacials, clinical peels' },
                { name: 'Nails & Pedicure', desc: 'Russian manicures, spa pedicures' },
                { name: 'Bridal & Ritual Suites', desc: 'Complete ceremonial packages' },
              ].map((fallback) => (
                <div
                  key={fallback.name}
                  className="p-5 rounded-[6px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] space-y-2"
                >
                  <Sparkles className="w-4 h-4 text-[#b3592c]" />
                  <h3 className="text-xs font-bold text-[#1a1816] dark:text-[#fafaf9]">
                    {fallback.name}
                  </h3>
                  <p className="text-[11px] text-[#736d65]">{fallback.desc}</p>
                </div>
              ))}
        </div>
      </section>

      {/* 5. Featured Treatments: Real Seeded Catalog with Direct Slot Booking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c857b]">
              Signature Offerings
            </span>
            <h2 className="text-2xl font-bold text-[#1a1816] dark:text-white font-editorial">
              Featured Clinical & Styling Services
            </h2>
            <p className="text-xs text-[#615b53] dark:text-[#b5ada1] mt-0.5">
              Select any procedure below to review verified availability slots and lock reservations.
            </p>
          </div>
        </div>

        {isLoadingCatalog ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 rounded-[8px] bg-[#f0eee6] dark:bg-[#221f1c] animate-pulse border border-[#e2ded5]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredServices.map((service) => {
              const basePrice = Number(service.basePrice);
              const duration = service.durationMinutes;

              return (
                <div
                  key={service.id}
                  className="rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 hover:border-[#b8b3a7] transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c857b]">
                        {service.category?.name || 'Treatment'}
                      </span>
                      <Badge variant={service.deliveryType === 'HOME' ? 'warning' : 'outline'}>
                        {service.deliveryType === 'HOME' ? 'Home' : 'Salon / Both'}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-[#1a1816] dark:text-[#fafaf9] leading-snug">
                      {service.name}
                    </h3>

                    <p className="text-xs text-[#615b53] dark:text-[#b5ada1] line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-[#736d65] dark:text-[#a69f95] border-t border-[#f0ebe1] dark:border-[#272421]">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {duration} mins
                      </span>
                      {service.addons && service.addons.length > 0 && (
                        <span className="text-[11px] text-[#b3592c]">
                          +{service.addons.length} Add-on Boosters
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#f0ebe1] dark:border-[#272421] flex items-center justify-between gap-2">
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-[#8c857b]">
                        Base Snapshot
                      </span>
                      <span className="text-base font-bold text-[#1a1816] dark:text-white">
                        ₹{basePrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setActiveBookingService(service)}
                      className="text-xs h-8 px-3.5 font-semibold"
                    >
                      Reserve Slot
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Operational Standards (Honest Architectural Facts) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-[8px] border border-[#ded8cb] bg-[#f5f2eb] dark:border-[#2e2a26] dark:bg-[#181614] space-y-8">
          <div className="max-w-xl space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#b3592c]">
              Engineering Discipline
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a1816] dark:text-white font-editorial">
              Platform Integrity & Operational Guarantees
            </h2>
            <p className="text-xs text-[#615b53] dark:text-[#b5ada1]">
              Engineered with zero artificial urgency counters or fabricated reviews. Built strictly around deterministic service operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-7 h-7 rounded-[4px] bg-[#e5e0d5] dark:bg-[#272421] flex items-center justify-center text-[#1a1816] dark:text-white">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#1a1816] dark:text-[#fafaf9]">
                Transactional Slot Locking
              </h3>
              <p className="text-[11px] text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
                Database-level advisory locks prevent race conditions so two simultaneous users cannot book the same specialist or workstation.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-7 h-7 rounded-[4px] bg-[#e5e0d5] dark:bg-[#272421] flex items-center justify-center text-[#1a1816] dark:text-white">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#1a1816] dark:text-[#fafaf9]">
                Immutable Price Snapshots
              </h3>
              <p className="text-[11px] text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
                Prices and add-ons are snapshotted permanently at booking time. Future catalog modifications will never silently alter your fee.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-7 h-7 rounded-[4px] bg-[#e5e0d5] dark:bg-[#272421] flex items-center justify-center text-[#1a1816] dark:text-white">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#1a1816] dark:text-[#fafaf9]">
                Trade & KYC Verification
              </h3>
              <p className="text-[11px] text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
                Every independent specialist and salon partner undergoes formal document review, identity checks, and skill accreditation before activation.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-7 h-7 rounded-[4px] bg-[#e5e0d5] dark:bg-[#272421] flex items-center justify-center text-[#1a1816] dark:text-white">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-[#1a1816] dark:text-[#fafaf9]">
                Canonical Audit Telemetry
              </h3>
              <p className="text-[11px] text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
                Track appointments across 11 explicit lifecycle stages from arrival check-in to completion with complete audit logging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Partner Registration Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#ded8cb] rounded-[8px] p-6 sm:p-8 bg-white dark:border-[#2e2a26] dark:bg-[#181614] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-base sm:text-lg font-bold text-[#1a1816] dark:text-white font-editorial">
              Are you an accredited salon atelier or certified specialist?
            </h2>
            <p className="text-xs text-[#615b53] dark:text-[#b5ada1]">
              Manage workstation capacity, coordinate dispatch schedules, and receive protected batch settlements with Velora&apos;s operations engine.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/register">
              <Button variant="outline" size="sm" className="text-xs">
                Register Atelier Salon
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="text-xs">
                Join as Specialist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Interactive Booking Drawer */}
      <SlotBookingDrawer
        isOpen={activeBookingService !== null}
        onClose={() => setActiveBookingService(null)}
        service={activeBookingService}
      />
    </div>
  );
}
