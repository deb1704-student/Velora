'use client';

import * as React from 'react';
import {
  Breadcrumbs,
  Input,
  Badge,
  EmptyState,
} from '@velora/ui';
import {
  Clock,
  Sparkles,
  Building2,
  Home,
  Layers,
  ChevronRight,
  Package,
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

  const [activeTab, setActiveTab] = React.useState<'SERVICES' | 'PACKAGES'>('SERVICES');
  const [categories, setCategories] = React.useState<CategoryItem[]>([]);
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [packages, setPackages] = React.useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [selectedDelivery, setSelectedDelivery] = React.useState<'ALL' | 'SALON' | 'HOME'>('ALL');
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
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Service Catalog' },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
            <span>Master Catalog & Atelier Offerings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Curated Beauty & Wellness Catalog
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl leading-relaxed">
            Standardized procedures with transparent durations and audited hygiene protocol.
            Select in-salon chair sessions or certified specialist home appointments.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="inline-flex p-1 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('SERVICES')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'SERVICES'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            Individual Treatments ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PACKAGES')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'PACKAGES'
                ? 'bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            Curated Suites ({packages.length})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-lg border border-zinc-200 bg-white space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by procedure name, technique, or formula..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />
          </div>
          <div>
            <select
              value={selectedDelivery}
              onChange={(e) => setSelectedDelivery(e.target.value as 'ALL' | 'SALON' | 'HOME')}
              className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 focus:outline-none"
            >
              <option value="ALL">All Delivery Modes</option>
              <option value="SALON">In-Salon Atelier</option>
              <option value="HOME">At-Home Consultation</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        {activeTab === 'SERVICES' && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-4 animate-pulse"
            >
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : activeTab === 'SERVICES' ? (
        filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="p-5 rounded-lg border border-zinc-200 bg-white flex flex-col justify-between space-y-4 dark:border-zinc-800 dark:bg-zinc-900 hover:border-zinc-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      {service.category?.name || 'General Treatment'}
                    </span>
                    <Badge variant="neutral" className="text-[10px]">
                      {service.deliveryType === 'BOTH' ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <Home className="w-3 h-3" />
                          <span>Salon / Home</span>
                        </span>
                      ) : service.deliveryType === 'SALON' ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>Salon Only</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          <span>Home Visit</span>
                        </span>
                      )}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {service.name}
                  </h3>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Addon preview tag */}
                  {service.addons && service.addons.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 pt-1">
                      <Layers className="w-3 h-3 text-zinc-400" />
                      <span>{service.addons.length} Add-on Boosters Available</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.durationMinutes} mins</span>
                    </div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                      ₹{Number(service.basePrice).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingService(service)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1"
                  >
                    <span>Select Service</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="No Matching Treatments"
            description="We could not find services matching your active filters. Try searching with different keywords or reset category filters."
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
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-6 rounded-lg border border-zinc-200 bg-white flex flex-col justify-between space-y-5 dark:border-zinc-800 dark:bg-zinc-900 hover:border-zinc-300 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-[10px]">
                    <Package className="w-3 h-3 mr-1" />
                    <span>Curated Ritual Package</span>
                  </Badge>
                  {pkg.discountPercentage && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded dark:bg-emerald-950 dark:border-emerald-900">
                      Save {pkg.discountPercentage}%
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                {/* Bundled Services List */}
                {pkg.items && pkg.items.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                      Included Procedures:
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                      {pkg.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between">
                          <span>• {item.service.name}</span>
                          <span className="text-zinc-400 text-[11px] font-mono">
                            {item.service.durationMinutes}m
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Total {pkg.durationMinutes} mins</span>
                  </div>
                  <div className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                    ₹{Number(pkg.price).toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setBookingService({
                      id: pkg.id,
                      name: pkg.name,
                      slug: pkg.slug,
                      description: pkg.description,
                      durationMinutes: pkg.durationMinutes,
                      basePrice: pkg.price,
                      deliveryType: 'SALON',
                      category: { id: 'pkg', name: 'Curated Ritual Suite' },
                    })
                  }
                  className="px-4 py-2 text-xs font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1"
                >
                  <span>Book Package Ritual</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No Bundled Packages Found"
          description="There are currently no multi-service packages matching your query."
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      )}

      {/* Real-time Slot Booking Drawer (Phase 6) */}
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
          <div className="h-8 bg-zinc-100 rounded w-1/4 animate-pulse dark:bg-zinc-800" />
          <div className="h-24 bg-zinc-100 rounded-lg animate-pulse dark:bg-zinc-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-zinc-100 rounded-lg animate-pulse dark:bg-zinc-800" />
            ))}
          </div>
        </div>
      }
    >
      <ServicesContent />
    </React.Suspense>
  );
}
