'use client';

import * as React from 'react';
import { Breadcrumbs, Badge, Input, EmptyState } from '@velora/ui';
import { UserCheck, ShieldCheck, MapPin, Award, Home, Building2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SpecialistItem {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  serviceRadiusKm: number;
  isHomeService: boolean;
  isSalonService: boolean;
  verificationStatus: 'APPROVED';
}

const INITIAL_SPECIALISTS: SpecialistItem[] = [
  {
    id: 'prov-01',
    name: 'Ananya Sharma',
    specialty: 'Master Hair Colorist & Stylist',
    experienceYears: 8,
    serviceRadiusKm: 12,
    isHomeService: true,
    isSalonService: true,
    verificationStatus: 'APPROVED',
  },
  {
    id: 'prov-02',
    name: 'Priya Mukherjee',
    specialty: 'Clinical Aesthetician & Skincare Specialist',
    experienceYears: 6,
    serviceRadiusKm: 15,
    isHomeService: true,
    isSalonService: false,
    verificationStatus: 'APPROVED',
  },
  {
    id: 'prov-03',
    name: 'Rahul Varma',
    specialty: 'Senior Barber & Men\'s Grooming Specialist',
    experienceYears: 10,
    serviceRadiusKm: 10,
    isHomeService: true,
    isSalonService: true,
    verificationStatus: 'APPROVED',
  },
  {
    id: 'prov-04',
    name: 'Natasha Fernandez',
    specialty: 'Celebrity & Bridal Makeup Artist',
    experienceYears: 7,
    serviceRadiusKm: 25,
    isHomeService: true,
    isSalonService: true,
    verificationStatus: 'APPROVED',
  },
];

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedMode, setSelectedMode] = React.useState('ALL');

  const filteredSpecialists = React.useMemo(() => {
    return INITIAL_SPECIALISTS.filter((prov) => {
      const matchesSearch =
        prov.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prov.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode =
        selectedMode === 'ALL' ||
        (selectedMode === 'HOME' && prov.isHomeService) ||
        (selectedMode === 'SALON' && prov.isSalonService);
      return matchesSearch && matchesMode;
    });
  }, [searchQuery, selectedMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Verified Specialists' },
        ]}
      />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Verified Beauty Specialists
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl">
          Independent stylists, cosmetologists, and therapists with verified trade certifications and KYC approval.
          Book direct assignments for in-salon appointments or at-home consultations.
        </p>
      </div>

      <div className="p-4 rounded-lg border border-zinc-200 bg-white flex flex-col sm:flex-row gap-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex-1">
          <Input
            placeholder="Search specialist by name or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="sm:w-56">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 focus:outline-none"
          >
            <option value="ALL">All Service Modes</option>
            <option value="HOME">Home Service Available</option>
            <option value="SALON">Salon Appointments Only</option>
          </select>
        </div>
      </div>

      {filteredSpecialists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSpecialists.map((prov) => (
            <div
              key={prov.id}
              className="p-5 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-md bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {prov.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    <span>KYC Verified</span>
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    {prov.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                    {prov.specialty}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{prov.experienceYears} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Up to {prov.serviceRadiusKm} km travel radius</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {prov.isHomeService && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <Home className="w-2.5 h-2.5" /> Home Visits
                    </span>
                  )}
                  {prov.isSalonService && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <Building2 className="w-2.5 h-2.5" /> In-Salon
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href={`/services?providerId=${prov.id}`}
                  className="w-full py-2 text-xs font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1"
                >
                  <span>View Services</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={UserCheck}
          title="No Specialists Found"
          description="No verified beauty specialists found matching your search. Adjust keyword criteria to view all licensed specialists."
          actionLabel="Reset Search"
          onAction={() => {
            setSearchQuery('');
            setSelectedMode('ALL');
          }}
        />
      )}
    </div>
  );
}
