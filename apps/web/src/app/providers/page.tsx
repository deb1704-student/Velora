'use client';

import * as React from 'react';
import { Breadcrumbs, Badge, Input, EmptyState, Button } from '@velora/ui';
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
  Sparkles,
  ArrowRight,
  Users,
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
        prov.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prov.salonName && prov.salonName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMode =
        selectedMode === 'ALL' ||
        (selectedMode === 'HOME' && prov.isHomeService) ||
        (selectedMode === 'SALON' && prov.isSalonService);
      return matchesSearch && matchesMode;
    });
  }, [specialists, searchQuery, selectedMode]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Verified Specialists' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-[#e5e0d5] dark:border-[#2e2a26] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#f4f1ea] dark:bg-[#221f1c] border border-[#e2ded5] dark:border-[#38332d] text-[11px] font-semibold text-[#44403c] dark:text-[#d6d3d1]">
            <UserCheck className="w-3.5 h-3.5 text-[#274c3a]" />
            <span>KYC Audited & Trade Accredited</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1a1816] dark:text-white font-editorial">
            Verified Beauty Specialists
          </h1>
          <p className="text-xs sm:text-sm text-[#615b53] dark:text-[#b5ada1] leading-relaxed">
            Independent masters and studio stylists verified by identity, trade certifications, and practical evaluation. Book private residence visits or atelier workstation sessions.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by specialist name, specialty, or atelier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 text-xs sm:text-sm"
          />
        </div>
        <div className="sm:w-56">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="h-10 w-full rounded-[5px] border border-[#d6d3cb] bg-white px-3 text-xs font-medium text-[#1c1917] dark:border-[#383532] dark:bg-[#161412] dark:text-[#f5f5f4] focus:outline-none cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <option value="ALL">All Service Modes</option>
            <option value="HOME">At-Home Service Ready</option>
            <option value="SALON">Atelier Salon Workstations</option>
          </select>
        </div>
      </div>

      {/* Specialists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-[8px] bg-[#f0eee6] dark:bg-[#221f1c] animate-pulse border border-[#e2ded5]"
            />
          ))}
        </div>
      ) : filteredSpecialists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSpecialists.map((specialist) => (
            <div
              key={specialist.id}
              className="rounded-[8px] border border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#181614] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-5 hover:border-[#b8b3a7] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-[#1a1816] dark:text-[#fafaf9] font-editorial leading-tight">
                      {specialist.name}
                    </h3>
                    <p className="text-xs text-[#b3592c] font-medium">
                      {specialist.specialty}
                    </p>
                  </div>
                  <Badge variant={specialist.verificationStatus === 'APPROVED' ? 'success' : 'neutral'}>
                    <ShieldCheck className="w-3 h-3 text-[#274c3a]" />
                    <span>Accredited</span>
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-[#615b53] dark:text-[#b5ada1]">
                  <p className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Award className="w-3.5 h-3.5 text-[#8c857b] shrink-0" />
                    <span>Trade Experience: {specialist.experienceYears}+ Professional Years</span>
                  </p>
                  {specialist.salonName && (
                    <p className="flex items-center gap-1.5 leading-snug">
                      <Building2 className="w-3.5 h-3.5 text-[#8c857b] shrink-0" />
                      <span>Resident Atelier: {specialist.salonName}</span>
                    </p>
                  )}
                  {specialist.isHomeService && (
                    <p className="flex items-center gap-1.5 font-mono text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#8c857b] shrink-0" />
                      <span>At-Home Dispatch Radius: Up to {specialist.serviceRadiusKm} km</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {specialist.isHomeService && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-[#f4f1ea] dark:bg-[#221f1c] text-[10px] font-medium text-[#57524b] dark:text-[#c4bdb2]">
                      <Home className="w-2.5 h-2.5" />
                      Home Dispatch
                    </span>
                  )}
                  {specialist.isSalonService && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-[#f4f1ea] dark:bg-[#221f1c] text-[10px] font-medium text-[#57524b] dark:text-[#c4bdb2]">
                      <Building2 className="w-2.5 h-2.5" />
                      Atelier Sessions
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0ebe1] dark:border-[#272421]">
                <Link href={`/services?providerId=${specialist.id}`}>
                  <Button variant="primary" size="sm" className="w-full text-xs h-8 font-semibold">
                    Reserve Specialist Services
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No Specialists Found"
          description="No certified professionals match your current search query."
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
