'use client';

import * as React from 'react';
import { Breadcrumbs, Badge, Input, EmptyState } from '@velora/ui';
import { Building2, MapPin, Clock, Users, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SalonItem {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  capacity: number;
  openingTime: string;
  closingTime: string;
  verificationStatus: 'VERIFIED' | 'PENDING';
}

const INITIAL_SALONS: SalonItem[] = [
  {
    id: 'salon-01',
    name: 'Aura Studio & Wellness Lounge',
    city: 'Bengaluru',
    area: 'Indiranagar',
    address: '100 Feet Road, HAL 2nd Stage',
    capacity: 6,
    openingTime: '09:00',
    closingTime: '20:30',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'salon-02',
    name: 'Kroma Atelier Hair & Color',
    city: 'Bengaluru',
    area: 'Koramangala',
    address: '5th Block, Jyoti Nivas College Road',
    capacity: 8,
    openingTime: '10:00',
    closingTime: '21:00',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'salon-03',
    name: 'Velvet Mane Aesthetic Studio',
    city: 'Mumbai',
    area: 'Bandra West',
    address: 'Pali Hill, Near Union Park',
    capacity: 5,
    openingTime: '09:30',
    closingTime: '20:00',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'salon-04',
    name: 'The Gilded Mirror Spa & Salon',
    city: 'Delhi NCR',
    area: 'Greater Kailash II',
    address: 'M-Block Market',
    capacity: 7,
    openingTime: '10:00',
    closingTime: '20:30',
    verificationStatus: 'VERIFIED',
  },
];

export default function SalonsPage() {
  const [selectedCity, setSelectedCity] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSalons = React.useMemo(() => {
    return INITIAL_SALONS.filter((salon) => {
      const matchesCity = selectedCity === 'ALL' || salon.city === selectedCity;
      const matchesSearch =
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [selectedCity, searchQuery]);

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
          Accredited salons with audited hygiene standards and verified workstation capacity.
          Book appointments without walk-in waiting queues.
        </p>
      </div>

      <div className="p-4 rounded-lg border border-zinc-200 bg-white flex flex-col sm:flex-row gap-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex-1">
          <Input
            placeholder="Search by salon name, area, or locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 focus:outline-none"
          >
            <option value="ALL">All Cities</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi NCR">Delhi NCR</option>
          </select>
        </div>
      </div>

      {filteredSalons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredSalons.map((salon) => (
            <div
              key={salon.id}
              className="p-6 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{salon.area}, {salon.city}</span>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    <span>Accredited</span>
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {salon.name}
                </h3>

                <p className="text-xs text-zinc-500">{salon.address}</p>

                <div className="pt-2 flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
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

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Guaranteed Chair Availability</span>
                <Link
                  href={`/services?salonId=${salon.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                >
                  <span>Select Salon & Book</span>
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
    </div>
  );
}
