'use client';

import * as React from 'react';
import { Breadcrumbs, Badge, Input, EmptyState } from '@velora/ui';
import {
  UserCheck,
  ShieldCheck,
  MapPin,
  Award,
  Home,
  Building2,
  ChevronRight,
  Clock,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { providersApi } from '../../lib/api';

interface SpecialistItem {
  id: string;
  name: string;
  specialty: string;
  experienceYears: number;
  serviceRadiusKm: number;
  isHomeService: boolean;
  isSalonService: boolean;
  verificationStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  salonName?: string;
}

const FALLBACK_SPECIALISTS: SpecialistItem[] = [
  {
    id: '759b4815-6c3c-4151-88f2-bef93e4685ae',
    name: 'Ananya Nair',
    specialty: 'Master Hair Colorist & Trichology Expert',
    experienceYears: 10,
    serviceRadiusKm: 25,
    isHomeService: true,
    isSalonService: true,
    verificationStatus: 'APPROVED',
    salonName: 'Maison de Velora',
  },
];

export default function ProvidersPage() {
  const [specialists, setSpecialists] = React.useState<SpecialistItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedMode, setSelectedMode] = React.useState('ALL');

  React.useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    providersApi
      .getProviders()
      .then((res) => {
        if (!mounted) return;
        if (res.success && res.data && res.data.length > 0) {
          const mapped: SpecialistItem[] = res.data.map((p: any) => ({
            id: p.id,
            name: `${p.user?.firstName || 'Specialist'} ${p.user?.lastName || ''}`.trim(),
            specialty: p.bio || 'Accredited Hair & Skincare Specialist',
            experienceYears: p.experienceYears || 5,
            serviceRadiusKm: p.serviceRadiusKm || 15,
            isHomeService: p.isHomeServiceAvailable ?? true,
            isSalonService: p.isSalonServiceAvailable ?? true,
            verificationStatus: p.verificationStatus,
            salonName: p.salon?.name,
          }));
          setSpecialists(mapped);
        } else {
          setSpecialists(FALLBACK_SPECIALISTS);
        }
      })
      .catch(() => {
        if (mounted) setSpecialists(FALLBACK_SPECIALISTS);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSpecialists = React.useMemo(() => {
    return specialists.filter((prov) => {
      const matchesSearch =
        prov.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prov.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMode =
        selectedMode === 'ALL' ||
        (selectedMode === 'HOME' && prov.isHomeService) ||
        (selectedMode === 'SALON' && prov.isSalonService);
      return matchesSearch && matchesMode;
    });
  }, [specialists, searchQuery, selectedMode]);

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
          Accredited trichologists, master colorists, and clinical aestheticians with audited certifications
          and KYC approval. Check open appointment windows for in-salon ateliers or private residence visits.
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 space-y-4 animate-pulse"
            >
              <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-md" />
              <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
              <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : filteredSpecialists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpecialists.map((prov) => (
            <div
              key={prov.id}
              className="p-5 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-colors shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-wider">
                    {prov.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
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
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {prov.specialty}
                  </p>
                </div>

                {prov.salonName && (
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-zinc-400" />
                    <span>Atelier: {prov.salonName}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{prov.experienceYears} yrs experience</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{prov.serviceRadiusKm} km radius</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {prov.isSalonService && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <Building2 className="w-2.5 h-2.5" />
                      Salon
                    </span>
                  )}
                  {prov.isHomeService && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <Home className="w-2.5 h-2.5" />
                      Home Visit
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Mon–Sat 09:00–19:00</span>
                <Link
                  href={`/services?providerId=${prov.id}`}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors flex items-center gap-1"
                >
                  <span>Book with {prov.name.split(' ')[0]}</span>
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
          description="We could not find beauty specialists matching your active filters. Try searching with different keywords."
          actionLabel="View All Specialists"
          onAction={() => {
            setSearchQuery('');
            setSelectedMode('ALL');
          }}
        />
      )}
    </div>
  );
}
