'use client';

import * as React from 'react';
import {
  Breadcrumbs,
  Input,
  Badge,
  EmptyState,
  Button,
} from '@velora/ui';
import {
  Clock,
  Sparkles,
  Building2,
  Home,
  Layers,
  ChevronRight,
  Package,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { catalogApi } from '../../lib/api';
import { SlotBookingDrawer, ServiceForBooking } from '../../components/SlotBookingDrawer';

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  basePrice: string | number;
  deliveryType: 'SALON' | 'HOME' | 'BOTH';
  imageUrl?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  addons?: Array<{
    id: string;
    name: string;
    extraDurationMinutes: number;
    price: string | number;
  }>;
}

interface PackageItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  durationMinutes: number;
  discountPercentage?: string | number | null;
  items?: Array<{
    id: string;
    service: {
      id: string;
      name: string;
      durationMinutes: number;
      basePrice: string | number;
    };
  }>;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  children?: CategoryItem[];
}

function ServicesContent() {
  const searchParams = useSearchParams();
  const salonFilter = searchParams.get('salonId');
  const initialCategoryParam = searchParams.get('categoryId') || 'ALL';
  const initialDeliveryParam = (searchParams.get('deliveryType') as any) || 'ALL';

  const [activeTab, setActiveTab] = React.useState<'SERVICES' | 'PACKAGES'>('SERVICES');
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [packages, setPackages] = React.useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [searchQuery, setSearchQuery] = React.useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategoryParam);
  const [selectedDelivery, setSelectedDelivery] = React.useState<'ALL' | 'SALON' | 'HOME'>(initialDeliveryParam);
  const [bookingService, setBookingService] = React.useState<ServiceForBooking | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [catsRes, srvsRes, pkgsRes] = await Promise.all([
          catalogApi.getCategories().catch(() => ({ success: false, data: [] })),
          catalogApi
            .getServices({ salonId: salonFilter || undefined, limit: 50 })
            .catch(() => ({ success: false, data: [] })),
          catalogApi.getPackages().catch(() => ({ success: false, data: [] })),
        ]);

        if (mounted) {
          if (catsRes?.data) setCategories(catsRes.data);
          if (srvsRes?.data) {
            setServices(srvsRes.data);
            const selectedParam = searchParams.get('selected');
            if (selectedParam) {
              const matched = srvsRes.data.find((s: any) => s.id === selectedParam);
              if (matched) setBookingService(matched);
            }
          }
          if (pkgsRes?.data) setPackages(pkgsRes.data);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadCatalog();
    return () => {
      mounted = false;
    };
  }, [salonFilter, searchParams]);

  const filteredServices = React.useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' ||
        service.category?.id === selectedCategory ||
        service.category?.slug === selectedCategory;

      const matchesDelivery =
        selectedDelivery === 'ALL' ||
        service.deliveryType === 'BOTH' ||
        service.deliveryType === selectedDelivery;

      return matchesSearch && matchesCategory && matchesDelivery;
    });
  }, [services, searchQuery, selectedCategory, selectedDelivery]);

  const filteredPackages = React.useMemo(() => {
    return packages.filter((pkg) => {
      return (
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [packages, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Service Catalog' },
        ]}
      />

      {/* Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#e5e0d5] dark:border-[#2e2a26] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#f4f1ea] dark:bg-[#221f1c] border border-[#e2ded5] dark:border-[#38332d] text-[11px] font-semibold text-[#44403c] dark:text-[#d6d3d1]">
            <Sparkles className="w-3.5 h-3.5 text-[#b3592c]" />
            <span>Master Catalog & Verified Procedures</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1816] dark:text-white font-editorial">
            Curated Beauty & Wellness Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
            Standardized treatments with transparent durations, sterile protocols, and snapshot pricing. Reserve chair time at partner salons or request certified specialist home dispatch.
          </p>
        </div>

        {/* Tactile Tab Switcher */}
        <div className="inline-flex p-1 rounded-[6px] border border-[#ded8cb] bg-[#f5f2eb] dark:border-[#2e2a26] dark:bg-[#181614] self-start md:self-auto shrink-0 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
          <button
            type="button"
            onClick={() => setActiveTab('SERVICES')}
            className={`px-4 py-1.5 rounded-[4px] text-xs font-semibold transition-all ${
              activeTab === 'SERVICES'
                ? 'bg-white text-[#1a1816] shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-[#262320] dark:text-white font-bold'
                : 'text-[#736d65] hover:text-[#1a1816] dark:text-[#a69f95] dark:hover:text-white'
            }`}
          >
            Individual Treatments ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PACKAGES')}
            className={`px-4 py-1.5 rounded-[4px] text-xs font-semibold transition-all ${
              activeTab === 'PACKAGES'
                ? 'bg-white text-[#1a1816] shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-[#262320] dark:text-white font-bold'
                : 'text-[#736d65] hover:text-[#1a1816] dark:text-[#a69f95] dark:hover:text-white'
            }`}
          >
            Curated Suites ({packages.length})
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 sm:p-5 rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by procedure name, technique, or formula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 text-xs sm:text-sm"
            />
          </div>
          <div>
            <select
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value as 'ALL' | 'SALON' | 'HOME')}
              className="h-10 w-full rounded-[5px] border border-[#d6d3cb] bg-white px-3 text-xs font-medium text-[#1c1917] dark:border-[#383532] dark:bg-[#161412] dark:text-[#f5f5f4] focus:outline-none cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <option value="ALL">All Delivery Modes</option>
              <option value="SALON">Atelier Salon Visit Only</option>
              <option value="HOME">At-Home Consultation Only</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        {activeTab === 'SERVICES' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#f0ebe1] dark:border-[#272421]">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-[#1a1816] text-[#fafaf9] dark:bg-[#f5f5f4] dark:text-[#1c1917] font-semibold'
                  : 'bg-[#f4f1ea] text-[#57524b] hover:bg-[#ebe6dc] dark:bg-[#221f1c] dark:text-[#c4bdb2]'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#1a1816] text-[#fafaf9] dark:bg-[#f5f5f4] dark:text-[#1c1917] font-semibold'
                    : 'bg-[#f4f1ea] text-[#57524b] hover:bg-[#ebe6dc] dark:bg-[#221f1c] dark:text-[#c4bdb2]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Services Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-[8px] bg-[#f0eee6] dark:bg-[#221f1c] animate-pulse border border-[#e2ded5]"
            />
          ))}
        </div>
      ) : activeTab === 'SERVICES' ? (
        filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service) => {
              const basePrice = Number(service.basePrice);
              const duration = service.durationMinutes;

              return (
                <div
                  key={service.id}
                  className="rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4 hover:border-[#b8b3a7] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c857b]">
                        {service.category?.name || 'Treatment'}
                      </span>
                      <Badge
                        variant={
                          service.deliveryType === 'HOME'
                            ? 'warning'
                            : service.deliveryType === 'SALON'
                            ? 'neutral'
                            : 'success'
                        }
                      >
                        {service.deliveryType === 'HOME'
                          ? 'Home Service'
                          : service.deliveryType === 'SALON'
                          ? 'Atelier Salon'
                          : 'Salon & Home'}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-[#1a1816] dark:text-[#fafaf9] leading-snug">
                      {service.name}
                    </h3>

                    <p className="text-xs text-[#615b53] dark:text-[#b5ada1] line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Add-ons Available */}
                    {service.addons && service.addons.length > 0 && (
                      <div className="pt-2 border-t border-[#f0ebe1] dark:border-[#272421] space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c857b] block">
                          Compatible Boosters ({service.addons.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {service.addons.map((a) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-[3px] bg-[#f4f1ea] dark:bg-[#221f1c] text-[#57524b] dark:text-[#c4bdb2]"
                            >
                              +{a.name} (+₹{a.price})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#f0ebe1] dark:border-[#272421] flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#736d65] dark:text-[#a69f95] font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{duration}m duration</span>
                      </div>
                      <div className="text-lg font-bold text-[#1a1816] dark:text-white mt-0.5">
                        ₹{basePrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setBookingService(service)}
                      className="text-xs font-semibold h-9 px-4"
                    >
                      Reserve Slot
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No Services Found"
            description="No catalog procedures match your current search query or filter configuration."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedDelivery('ALL');
            }}
          />
        )
      ) : filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPackages.map((pkg) => {
            const price = Number(pkg.price);
            const discount = pkg.discountPercentage ? Number(pkg.discountPercentage) : 0;

            return (
              <div
                key={pkg.id}
                className="rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#b3592c]">
                      Curated Multi-Procedure Suite
                    </span>
                    {discount > 0 && (
                      <Badge variant="success">Save {discount}% Bundle</Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-[#1a1816] dark:text-[#fafaf9] font-editorial">
                    {pkg.name}
                  </h3>

                  <p className="text-xs text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
                    {pkg.description}
                  </p>

                  {pkg.items && pkg.items.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#f0ebe1] dark:border-[#272421]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c857b]">
                        Included Procedures ({pkg.items.length})
                      </span>
                      <div className="space-y-1">
                        {pkg.items.map((pi, idx) => (
                          <div
                            key={pi.id || idx}
                            className="flex items-center justify-between text-xs text-[#57524b] dark:text-[#c4bdb2]"
                          >
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#274c3a]" />
                              {pi.service?.name}
                            </span>
                            <span className="font-mono text-[11px] text-[#8c857b]">
                              {pi.service?.durationMinutes}m
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#f0ebe1] dark:border-[#272421] flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#8c857b]">
                      Total Runtime ~{pkg.durationMinutes}m
                    </span>
                    <span className="text-xl font-bold text-[#1a1816] dark:text-white">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      // Map package to booking drawer format
                      setBookingService({
                        id: pkg.id,
                        name: pkg.name,
                        slug: pkg.slug,
                        description: pkg.description,
                        durationMinutes: pkg.durationMinutes,
                        basePrice: pkg.price,
                        deliveryType: 'SALON',
                      });
                    }}
                    className="text-xs font-semibold h-9 px-4"
                  >
                    Reserve Suite Slot
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No Curated Suites Found"
          description="No ritual packages match your current search query."
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      )}

      {/* Real-time Slot Booking Drawer */}
      <SlotBookingDrawer
        isOpen={bookingService !== null}
        onClose={() => setBookingService(null)}
        service={bookingService}
        initialSalonId={salonFilter || undefined}
      />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="h-8 bg-[#f0eee6] rounded w-1/4 animate-pulse dark:bg-[#221f1c]" />
          <div className="h-24 bg-[#f0eee6] rounded-[8px] animate-pulse dark:bg-[#221f1c]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-[#f0eee6] rounded-[8px] animate-pulse dark:bg-[#221f1c]" />
            ))}
          </div>
        </div>
      }
    >
      <ServicesContent />
    </React.Suspense>
  );
}
