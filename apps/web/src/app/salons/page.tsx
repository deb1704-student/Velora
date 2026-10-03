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
  Sparkles,
  ArrowRight,
  Layers,
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
    city: 'Bengaluru',
    area: 'Indiranagar',
    address: '100ft Road, Indiranagar, Bengaluru, KA 560038',
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

  // Station Capacity Modal State
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
            city: item.address?.city || 'Bengaluru',
            area: item.address?.state || 'Karnataka',
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

  // Fetch live station capacity when modal is active
  React.useEffect(() => {
    if (!inspectingSalon) return;
    let mounted = true;
    setIsLoadingCapacity(true);

    availabilityApi
      .getSalonCapacity(inspectingSalon.id, capacityDate)
      .then((res) => {
        if (mounted && res.success) {
          setCapacityData(res.data);
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

  const filteredSalons = React.useMemo(() => {
    return salons.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === 'ALL' || s.city.toLowerCase() === selectedCity.toLowerCase();
      return matchesSearch && matchesCity;
    });
  }, [salons, searchQuery, selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Partner Ateliers' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#e5e0d5] dark:border-[#2e2a26] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#f4f1ea] dark:bg-[#221f1c] border border-[#e2ded5] dark:border-[#38332d] text-[11px] font-semibold text-[#44403c] dark:text-[#d6d3d1]">
            <Building2 className="w-3.5 h-3.5 text-[#b3592c]" />
            <span>Accredited Workstations & Studios</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1816] dark:text-white font-editorial">
            Licensed Partner Salon Ateliers
          </h1>
          <p className="text-xs sm:text-sm text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
            Browse inspected salon facilities with verified workstation chair capacities. Book chair sessions directly with zero walk-in uncertainty.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by salon name, street, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 text-xs sm:text-sm"
          />
        </div>
        <div className="sm:w-56">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="h-10 w-full rounded-[5px] border border-[#d6d3cb] bg-white px-3 text-xs font-medium text-[#1c1917] dark:border-[#383532] dark:bg-[#161412] dark:text-[#f5f5f4] focus:outline-none cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <option value="ALL">All Territories</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi NCR">Delhi NCR</option>
          </select>
        </div>
      </div>

      {/* Salons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 rounded-[8px] bg-[#f0eee6] dark:bg-[#221f1c] animate-pulse border border-[#e2ded5]"
            />
          ))}
        </div>
      ) : filteredSalons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSalons.map((salon) => (
            <div
              key={salon.id}
              className="rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5 hover:border-[#b8b3a7] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c857b]">
                      {salon.city}
                    </span>
                    <h3 className="font-bold text-lg text-[#1a1816] dark:text-[#fafaf9] font-editorial leading-tight">
                      {salon.name}
                    </h3>
                  </div>
                  <Badge variant={salon.verificationStatus === 'VERIFIED' ? 'success' : 'neutral'}>
                    <ShieldCheck className="w-3 h-3 text-[#274c3a]" />
                    <span>Verified Atelier</span>
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-[#615b53] dark:text-[#b5ada1]">
                  <p className="flex items-start gap-1.5 leading-snug">
                    <MapPin className="w-3.5 h-3.5 text-[#8c857b] shrink-0 mt-0.5" />
                    <span>{salon.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#8c857b] shrink-0" />
                    <span>Operating Hours: {salon.openingTime} – {salon.closingTime}</span>
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Users className="w-3.5 h-3.5 text-[#8c857b] shrink-0" />
                    <span>Station Capacity: {salon.capacity} Dedicated Workstation Chairs</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0ebe1] dark:border-[#272421] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInspectingSalon(salon)}
                    className="text-xs h-8 flex items-center justify-center gap-1"
                  >
                    <Activity className="w-3 h-3 text-[#b3592c]" />
                    <span>Chair Matrix</span>
                  </Button>

                  <Link href={`/services?salonId=${salon.id}`}>
                    <Button variant="primary" size="sm" className="w-full text-xs h-8">
                      Book Services
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No Salons Found"
          description="No partner ateliers match your current search query."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCity('ALL');
          }}
        />
      )}

      {/* Hourly Chair Capacity Modal */}
      {inspectingSalon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#181614] border border-[#ded8cb] dark:border-[#2e2a26] rounded-[8px] shadow-2xl p-6 sm:p-8 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0ebe1] dark:border-[#272421] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#b3592c]">
                  Live Station Telemetry
                </span>
                <h3 className="text-lg font-bold text-[#1a1816] dark:text-white font-editorial">
                  Workstation Capacity Matrix: {inspectingSalon.name}
                </h3>
                <p className="text-xs text-[#736d65]">
                  Total Chairs: {inspectingSalon.capacity} • Operating {inspectingSalon.openingTime} – {inspectingSalon.closingTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSalon(null)}
                className="p-1 rounded text-[#8c857b] hover:text-[#1a1816] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Date Selector */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-[6px] bg-[#faf8f5] dark:bg-[#141211] border border-[#e5e0d5] dark:border-[#2e2a26]">
              <span className="text-xs font-semibold text-[#1a1816] dark:text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8c857b]" />
                <span>Selected Schedule Date:</span>
              </span>
              <input
                type="date"
                value={capacityDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCapacityDate(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-[4px] border border-[#d6d3cb] dark:border-[#383532] bg-white dark:bg-[#181614] text-[#1c1917] dark:text-white"
              />
            </div>

            {/* Hourly Capacity Breakdown */}
            {isLoadingCapacity ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 py-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-16 rounded bg-[#f0eee6] dark:bg-[#221f1c] animate-pulse" />
                ))}
              </div>
            ) : capacityData?.capacityByHour ? (
              <div className="space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c857b] block">
                  Hourly Chair Utilization & Free Slots
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {capacityData.capacityByHour.map((slot: any) => {
                    const isFull = slot.availableChairs === 0;
                    return (
                      <div
                        key={slot.hour}
                        className={`p-3 rounded-[5px] border text-left space-y-1 ${
                          isFull
                            ? 'border-[#fca5a5] bg-[#fdf2f2] dark:border-[#541616] dark:bg-[#2d0e0e]'
                            : 'border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold font-mono">
                          <span>{slot.hour}</span>
                          <span
                            className={
                              isFull
                                ? 'text-[#b91c1c] text-[10px]'
                                : 'text-[#274c3a] dark:text-[#86efac] text-[10px]'
                            }
                          >
                            {isFull ? 'Station Full' : `${slot.availableChairs} Available`}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#736d65] dark:text-[#a69f95] flex justify-between">
                          <span>Occupied: {slot.occupiedChairs}/{slot.totalChairs}</span>
                          <span>{slot.utilizationPercentage}% full</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#736d65] text-center py-4">
                No capacity telemetry recorded for this schedule date.
              </p>
            )}

            <div className="pt-3 border-t border-[#f0ebe1] dark:border-[#272421] flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setInspectingSalon(null)}>
                Close Matrix
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
