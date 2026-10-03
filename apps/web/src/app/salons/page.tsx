'use client';

import * as React from 'react';
import { Breadcrumbs, Badge, Input, EmptyState, Button } from '@velora/ui';
import {
  Building2,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  ChevronRight,
  Activity,
  X,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { salonsApi, availabilityApi } from '../../lib/api';

interface SalonItem {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  capacity: number;
  openingTime: string;
  closingTime: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

const FALLBACK_SALONS: SalonItem[] = [
  {
    id: '06eb1d81-749c-44b7-ab2c-4fe060413a6c',
    name: 'Maison de Velora',
    city: 'Beverly Hills',
    area: 'Rodeo Drive',
    address: '450 Rodeo Drive, Beverly Hills, CA 90210',
    capacity: 12,
    openingTime: '09:00',
    closingTime: '20:00',
    verificationStatus: 'VERIFIED',
  },
];

export default function SalonsPage() {
  const [salons, setSalons] = React.useState<SalonItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedCity, setSelectedCity] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Capacity Modal State
  const [inspectingSalon, setInspectingSalon] = React.useState<SalonItem | null>(null);
  const [capacityDate, setCapacityDate] = React.useState(
    new Date().toISOString().split('T')[0]
  );
  const [capacityData, setCapacityData] = React.useState<any | null>(null);
  const [isLoadingCapacity, setIsLoadingCapacity] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    salonsApi
      .getSalons()
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data && res.data.length > 0) {
          const mapped: SalonItem[] = res.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            city: item.address?.city || 'Beverly Hills',
            area: item.address?.state || 'California',
            address: item.address
              ? `${item.address.streetLine1}, ${item.address.city}, ${item.address.postalCode}`
              : 'Atelier Suites',
            capacity: item.capacity || 10,
            openingTime: item.openingTime || '09:00',
            closingTime: item.closingTime || '20:00',
            verificationStatus: item.verificationStatus,
          }));
          setSalons(mapped);
        } else {
          setSalons(FALLBACK_SALONS);
        }
      })
      .catch(() => {
        if (mounted) setSalons(FALLBACK_SALONS);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch capacity when modal is open and date changes
  React.useEffect(() => {
    if (!inspectingSalon) return;
    let mounted = true;
    setIsLoadingCapacity(true);

    availabilityApi
      .getSalonCapacity(inspectingSalon.id, capacityDate)
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data) {
          setCapacityData(res.data);
        } else {
          setCapacityData(null);
        }
      })
      .catch(() => {
        if (mounted) setCapacityData(null);
      })
      .finally(() => {
        if (mounted) setIsLoadingCapacity(false);
      });

    return () => {
      mounted = false;
    };
  }, [inspectingSalon, capacityDate]);

  const cities = React.useMemo(() => {
    const set = new Set(salons.map((s) => s.city));
    return Array.from(set);
  }, [salons]);

  const filteredSalons = React.useMemo(() => {
    return salons.filter((salon) => {
      const matchesCity = selectedCity === 'ALL' || salon.city === selectedCity;
      const matchesSearch =
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [salons, selectedCity, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Partner Salons' },
        ]}
      />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Partner Salons & Studios
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl">
          Accredited studios with audited hygiene protocols, private treatment booths, and guaranteed
          workstation capacity. Inspect live chair availability to reserve without waiting queues.
        </p>
      </div>

      <div className="p-4 rounded-lg border border-zinc-200 bg-white flex flex-col sm:flex-row gap-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex-1">
          <Input
            placeholder="Search by atelier name, locality, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="sm:w-52">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 focus:outline-none"
          >
            <option value="ALL">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-6 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-4 animate-pulse"
            >
              <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3" />
              <div className="h-7 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
              <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredSalons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSalons.map((salon) => (
            <div
              key={salon.id}
              className="p-6 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-5 hover:border-zinc-300 transition-colors shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {salon.area}, {salon.city}
                    </span>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    <span>Accredited Atelier</span>
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {salon.name}
                </h3>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {salon.address}
                </p>

                <div className="pt-2 flex items-center gap-5 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{salon.openingTime} – {salon.closingTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{salon.capacity} Workstations</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setInspectingSalon(salon)}
                  className="px-3 py-1.5 text-xs font-semibold rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Check Station Capacity</span>
                </button>

                <Link
                  href={`/services?salonId=${salon.id}`}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1"
                >
                  <span>Book at Atelier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No Salons Found"
          description="We could not find partner salons matching your current location or keywords. You can reset filters to view all accredited locations."
          actionLabel="View All Salons"
          onAction={() => {
            setSelectedCity('ALL');
            setSearchQuery('');
          }}
        />
      )}

      {/* Live Workstation Capacity Modal (Phase 6) */}
      {inspectingSalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-950/40">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  Real-time Workstation Utilization
                </span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                  {inspectingSalon.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSalon(null)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <input
                    type="date"
                    value={capacityDate}
                    onChange={(e) => setCapacityDate(e.target.value)}
                    className="text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none"
                  />
                </div>
                <div className="text-xs font-medium text-zinc-500">
                  Total Capacity: <span className="font-bold text-zinc-900 dark:text-white">{inspectingSalon.capacity} Chairs</span>
                </div>
              </div>

              {isLoadingCapacity ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  ))}
                </div>
              ) : capacityData && capacityData.capacityByHour ? (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Hourly Workstation Availability
                  </div>

                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                    {capacityData.capacityByHour.map((hourRow: any) => {
                      const availPercent = 100 - hourRow.utilizationPercentage;
                      return (
                        <div
                          key={hourRow.hour}
                          className="p-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <div className="w-20 font-mono font-medium text-zinc-800 dark:text-zinc-200">
                            {hourRow.hour}
                          </div>

                          <div className="flex-1 mx-4">
                            <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                              <span>
                                {hourRow.availableChairs} of {hourRow.totalChairs} chairs available
                              </span>
                              <span>{hourRow.utilizationPercentage}% occupied</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  hourRow.utilizationPercentage > 80
                                    ? 'bg-red-500'
                                    : hourRow.utilizationPercentage > 40
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${hourRow.utilizationPercentage}%` }}
                              />
                            </div>
                          </div>

                          <Badge
                            variant={
                              hourRow.availableChairs > 4
                                ? 'success'
                                : hourRow.availableChairs > 0
                                ? 'warning'
                                : 'destructive'
                            }
                            className="text-[10px]"
                          >
                            {hourRow.availableChairs > 0 ? `${hourRow.availableChairs} Free` : 'Fully Booked'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500">
                  No hourly capacity breakdown available for this date.
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setInspectingSalon(null)}
                className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Close
              </button>

              <Link
                href={`/services?salonId=${inspectingSalon.id}`}
                className="px-4 py-2 text-xs font-semibold rounded bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1"
              >
                <span>View Atelier Services</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
