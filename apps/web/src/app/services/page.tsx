'use client';

import * as React from 'react';
import {
  Breadcrumbs,
  Input,
  Button,
  Badge,
  EmptyState,
} from '@velora/ui';
import {
  Search,
  Clock,
  Sparkles,
  Building2,
  Home,
  Check,
} from 'lucide-react';
import Link from 'next/link';

// Baseline catalog items traceable to D5 Service Catalog Data Store
interface CatalogService {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  deliveryType: 'SALON' | 'HOME' | 'BOTH';
  durationMinutes: number;
  basePrice: number;
  description: string;
}

const INITIAL_SERVICES: CatalogService[] = [
  {
    id: 'srv-01',
    name: 'Precision Haircut & Blowdry',
    category: 'Hair & Styling',
    categorySlug: 'hair',
    deliveryType: 'BOTH',
    durationMinutes: 45,
    basePrice: 599,
    description: 'Consultation, scalp massage, tailored haircut, and professional blowdry finish.',
  },
  {
    id: 'srv-02',
    name: 'Deep Hydrating Radiance Facial',
    category: 'Skincare & Facial',
    categorySlug: 'skin',
    deliveryType: 'BOTH',
    durationMinutes: 60,
    basePrice: 1499,
    description: 'Double cleanse, botanical steam, pore extraction, hyaluronic hydration mask.',
  },
  {
    id: 'srv-03',
    name: 'Deluxe Spa Pedicure',
    category: 'Nails & Pedicure',
    categorySlug: 'nails',
    deliveryType: 'BOTH',
    durationMinutes: 50,
    basePrice: 899,
    description: 'Dead sea salt soak, cuticle care, exfoliating scrub, and nail lacquer application.',
  },
  {
    id: 'srv-04',
    name: 'Signature Keratin Hair Treatment',
    category: 'Hair & Styling',
    categorySlug: 'hair',
    deliveryType: 'SALON',
    durationMinutes: 120,
    basePrice: 3499,
    description: 'Professional protein infusing therapy that eliminates frizz and reinforces hair structure.',
  },
  {
    id: 'srv-05',
    name: 'Full Body Aromatherapy Massage',
    category: 'Massage & Spa',
    categorySlug: 'spa',
    deliveryType: 'HOME',
    durationMinutes: 75,
    basePrice: 2299,
    description: 'Gentle Swedish techniques with therapeutic essential oils for full body stress relief.',
  },
  {
    id: 'srv-06',
    name: 'Bridal Couture Makeup & Hair',
    category: 'Bridal & Grooming',
    categorySlug: 'bridal',
    deliveryType: 'BOTH',
    durationMinutes: 150,
    basePrice: 7999,
    description: 'Complete HD bridal makeup, luxury lashes, and customized traditional or contemporary hair styling.',
  },
];

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedDelivery, setSelectedDelivery] = React.useState<'ALL' | 'SALON' | 'HOME'>('ALL');

  const filteredServices = React.useMemo(() => {
    return INITIAL_SERVICES.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || service.categorySlug === selectedCategory;

      const matchesDelivery =
        selectedDelivery === 'ALL' ||
        service.deliveryType === 'BOTH' ||
        service.deliveryType === selectedDelivery;

      return matchesSearch && matchesCategory && matchesDelivery;
    });
  }, [searchQuery, selectedCategory, selectedDelivery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Service Catalog' },
        ]}
      />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Service Catalog
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl">
          Standardized beauty and grooming procedures with verified durations and transparent pricing.
          Choose between in-salon appointments and home-service visits.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-lg border border-zinc-200 bg-white space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by treatment or procedure name..."
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
              <option value="SALON">In-Salon Appointments</option>
              <option value="HOME">Home Service Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {[
            { label: 'All Services', slug: 'all' },
            { label: 'Hair & Styling', slug: 'hair' },
            { label: 'Skincare & Facial', slug: 'skin' },
            { label: 'Nails & Pedicure', slug: 'nails' },
            { label: 'Bridal & Grooming', slug: 'bridal' },
            { label: 'Massage & Spa', slug: 'spa' },
          ].map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid or Honest Empty State */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-5 rounded-lg border border-zinc-200 bg-white flex flex-col justify-between space-y-4 dark:border-zinc-800 dark:bg-zinc-900 hover:border-zinc-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    {service.category}
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
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.durationMinutes} mins</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                    ₹{service.basePrice.toLocaleString('en-IN')}
                  </div>
                </div>

                <Link
                  href={`/book?serviceId=${service.id}`}
                  className="px-3.5 py-2 text-xs font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                >
                  Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No Matching Catalog Services"
          description="There are currently no catalog services matching your filter criteria. Try adjusting the search keywords or selecting all delivery modes."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedDelivery('ALL');
          }}
        />
      )}
    </div>
  );
}
