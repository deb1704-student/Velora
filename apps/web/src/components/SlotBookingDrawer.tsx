'use client';

import * as React from 'react';
import {
  Clock,
  Sparkles,
  Building2,
  Home,
  Check,
  Calendar,
  X,
  User,
  ShieldCheck,
  ChevronRight,
  Info,
  AlertTriangle,
  MapPin,
  FileText,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Badge, Button } from '@velora/ui';
import { availabilityApi, bookingsApi, authApi, usersApi } from '../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface ServiceForBooking {
  id: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  basePrice: string | number;
  deliveryType: 'SALON' | 'HOME' | 'BOTH';
  category?: {
    id: string;
    name: string;
  };
  addons?: Array<{
    id: string;
    name: string;
    extraDurationMinutes: number;
    price: string | number;
  }>;
}

interface SlotBookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceForBooking | null;
  initialSalonId?: string;
}

export function SlotBookingDrawer({
  isOpen,
  onClose,
  service,
  initialSalonId,
}: SlotBookingDrawerProps) {
  const router = useRouter();

  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // default to tomorrow
    return d.toISOString().split('T')[0];
  };

  const [deliveryType, setDeliveryType] = React.useState<'SALON' | 'HOME'>('SALON');
  const [selectedAddonIds, setSelectedAddonIds] = React.useState<string[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>(getDefaultDate());
  const [slots, setSlots] = React.useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<any | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Home Address State
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>('');
  const [newStreetAddress, setNewStreetAddress] = React.useState('');
  const [newCity, setNewCity] = React.useState('Bengaluru');
  const [newPostalCode, setNewPostalCode] = React.useState('560001');
  const [isAddingAddress, setIsAddingAddress] = React.useState(false);
  const [customerNotes, setCustomerNotes] = React.useState('');

  // Transaction State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookingConfirmed, setBookingConfirmed] = React.useState<any | null>(null);
  const [currentUser, setCurrentUser] = React.useState<any | null>(null);

  // Sync delivery type when service changes
  React.useEffect(() => {
    if (service) {
      if (service.deliveryType === 'HOME') {
        setDeliveryType('HOME');
      } else {
        setDeliveryType('SALON');
      }
      setSelectedAddonIds([]);
      setSelectedSlot(null);
      setBookingConfirmed(null);
      setErrorMessage(null);
    }
  }, [service]);

  // Check auth and load addresses if customer
  React.useEffect(() => {
    if (!isOpen) return;
    const user = authApi.getCurrentUser();
    setCurrentUser(user);

    if (user && user.id) {
      usersApi
        .getAddresses(user.id)
        .then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setAddresses(res.data);
            const defaultAddr = res.data.find((a: any) => a.isDefault) || res.data[0];
            setSelectedAddressId(defaultAddr.id);
          }
        })
        .catch(() => {
          // ignore error
        });
    }
  }, [isOpen]);

  // Pricing & Duration Calculations
  const basePrice = service ? Number(service.basePrice) : 0;
  const selectedAddons = React.useMemo(() => {
    if (!service?.addons) return [];
    return service.addons.filter((addon) => selectedAddonIds.includes(addon.id));
  }, [service, selectedAddonIds]);

  const addonsPrice = selectedAddons.reduce((sum, a) => sum + Number(a.price), 0);
  const baseDuration = service ? service.durationMinutes : 0;
  const addonsDuration = selectedAddons.reduce((sum, a) => sum + a.extraDurationMinutes, 0);
  const totalDuration = baseDuration + addonsDuration;

  const subtotal = basePrice + addonsPrice;
  const estimatedTax = Math.round(subtotal * 0.18); // 18% GST standard
  const estimatedTotal = subtotal + estimatedTax;

  // Refresh Slots Function
  const refreshSlots = React.useCallback(() => {
    if (!isOpen || !service) return;

    setIsLoadingSlots(true);
    setErrorMessage(null);

    availabilityApi
      .getSlots({
        serviceId: service.id,
        date: selectedDate,
        deliveryType,
        salonId: deliveryType === 'SALON' ? initialSalonId : undefined,
        durationMinutes: totalDuration,
      })
      .then((res) => {
        if (res.success && res.data?.slots) {
          setSlots(res.data.slots);
          if (
            selectedSlot &&
            !res.data.slots.some(
              (s: any) =>
                s.startTime === selectedSlot.startTime && s.providerId === selectedSlot.providerId
            )
          ) {
            setSelectedSlot(null);
          }
        } else {
          setSlots([]);
        }
      })
      .catch((err) => {
        setSlots([]);
        setErrorMessage(err.message || 'Unable to retrieve availability slots.');
      })
      .finally(() => {
        setIsLoadingSlots(false);
      });
  }, [isOpen, service, selectedDate, deliveryType, initialSalonId, totalDuration, selectedSlot]);

  React.useEffect(() => {
    refreshSlots();
  }, [isOpen, service?.id, selectedDate, deliveryType, totalDuration, initialSalonId]);

  if (!isOpen || !service) return null;

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const morningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(':')[0], 10);
    return hour < 12;
  });

  const afternoonSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(':')[0], 10);
    return hour >= 12;
  });

  const dateOptions = [
    { label: 'Today', offset: 0 },
    { label: 'Tomorrow', offset: 1 },
    { label: '+2 Days', offset: 2 },
    { label: '+3 Days', offset: 3 },
  ].map((opt) => {
    const d = new Date();
    d.setDate(d.getDate() + opt.offset);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return {
      label: opt.label,
      dateStr,
      dayLabel,
    };
  });

  const handleCreateAddress = async () => {
    if (!currentUser) return;
    if (!newStreetAddress.trim()) {
      setErrorMessage('Please enter street address.');
      return;
    }
    try {
      const res = await usersApi.createAddress(currentUser.id, {
        streetLine1: newStreetAddress,
        city: newCity,
        state: 'Karnataka',
        postalCode: newPostalCode,
        isDefault: true,
      });
      if (res.success && res.data) {
        setAddresses((prev) => [res.data, ...prev]);
        setSelectedAddressId(res.data.id);
        setIsAddingAddress(false);
        setNewStreetAddress('');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save address');
    }
  };

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      setErrorMessage('Please log in with your Velora client account to confirm this reservation.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Please select an available appointment time slot.');
      return;
    }

    if (deliveryType === 'HOME' && !selectedAddressId) {
      setErrorMessage('Please specify a destination delivery address for home service.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        serviceId: service.id,
        deliveryType,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        providerId: selectedSlot.providerId,
        addonIds: selectedAddonIds,
        customerNotes: customerNotes.trim() || undefined,
      };

      if (deliveryType === 'SALON') {
        payload.salonId = selectedSlot.salonId || initialSalonId;
      } else {
        payload.addressId = selectedAddressId;
      }

      const res = await bookingsApi.createBooking(payload);

      if (res.success && res.data) {
        setBookingConfirmed(res.data);
      } else {
        throw new Error(res.message || 'Booking creation failed');
      }
    } catch (err: any) {
      if (err.statusCode === 409 || err.message?.includes('already reserved') || err.message?.includes('capacity')) {
        setErrorMessage(
          'Slot Conflict: This time window was just claimed by another client or chair capacity was reached. The schedule has been refreshed.'
        );
        refreshSlots();
      } else {
        setErrorMessage(
          err.message || 'An error occurred while confirming your booking. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#faf8f5] dark:bg-[#181614] border border-[#ded8cb] dark:border-[#2e2a26] rounded-[8px] shadow-2xl overflow-hidden my-6">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#e5e0d5] dark:border-[#272421] flex items-center justify-between bg-white dark:bg-[#141211]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#b3592c]">
                {service.category?.name || 'Treatment Suite'}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-[10px] font-mono text-[#736d65]">
                {totalDuration}m total runtime
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1a1816] dark:text-white font-editorial leading-tight mt-0.5">
              {service.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-[#736d65] hover:text-[#1a1816] dark:hover:text-white hover:bg-[#f4f1ea] dark:hover:bg-[#221f1c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {bookingConfirmed ? (
          /* Confirmation Receipt View */
          <div className="p-8 text-center space-y-6">
            <div className="w-14 h-14 rounded-[4px] bg-[#f0f5f1] dark:bg-[#14261c] border border-[#c2ded0] dark:border-[#1e4630] text-[#1b4332] dark:text-[#86efac] mx-auto flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#274c3a] dark:text-[#86efac]">
                Reservation Confirmed & Locked
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-[#1a1816] dark:text-white font-mono">
                {bookingConfirmed.bookingReference}
              </h3>
              <p className="text-xs text-[#736d65] dark:text-[#a69f95]">
                Your appointment has been transactionally validated across specialist shifts and capacity.
              </p>
            </div>

            <div className="max-w-md mx-auto p-5 rounded-[6px] bg-white dark:bg-[#141211] border border-[#e5e0d5] dark:border-[#2e2a26] text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#f0ebe1] dark:border-[#272421]">
                <span className="text-[#736d65]">Treatment:</span>
                <span className="font-semibold text-[#1a1816] dark:text-white">
                  {bookingConfirmed.service?.name || service.name}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#f0ebe1] dark:border-[#272421]">
                <span className="text-[#736d65]">Date & Time:</span>
                <span className="font-semibold text-[#1a1816] dark:text-white font-mono">
                  {new Date(bookingConfirmed.appointmentDate).toISOString().split('T')[0]} at{' '}
                  {bookingConfirmed.startTime} – {bookingConfirmed.endTime}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#f0ebe1] dark:border-[#272421]">
                <span className="text-[#736d65]">Delivery Mode:</span>
                <Badge variant={bookingConfirmed.deliveryType === 'HOME' ? 'warning' : 'neutral'}>
                  {bookingConfirmed.deliveryType === 'HOME' ? 'Home Service' : 'Atelier Salon Visit'}
                </Badge>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[#736d65]">Snapshotted Total:</span>
                <span className="font-bold text-sm text-[#1a1816] dark:text-white">
                  ₹{Number(bookingConfirmed.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  setBookingConfirmed(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  router.push('/bookings');
                }}
                className="flex items-center gap-1.5 font-semibold"
              >
                <span>View My Bookings</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Error / Conflict Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-[5px] bg-[#fdf2f2] dark:bg-[#2d0e0e] border border-[#fbc8c8] dark:border-[#541616] flex items-start gap-2 text-xs text-[#991b1b] dark:text-[#fca5a5]">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-[#dc2626]" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Unauthenticated Notification */}
            {!currentUser && (
              <div className="p-3.5 rounded-[5px] bg-[#fdf6ec] dark:bg-[#291b08] border border-[#fae8c8] dark:border-[#4d3410] flex items-center justify-between text-xs text-[#854d0e] dark:text-[#fde047]">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#ca8a04] shrink-0" />
                  <span>Please sign in with your customer account to complete your reservation.</span>
                </div>
                <Link
                  href="/login"
                  className="font-semibold underline hover:text-[#583307] dark:hover:text-white shrink-0 ml-2"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Stage 1: Delivery Mode */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#736d65] dark:text-[#a69f95] uppercase tracking-wider">
                  Stage 1: Delivery Preference
                </label>
                <span className="text-[10px] text-[#736d65]">Choose venue</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={service.deliveryType === 'HOME'}
                  onClick={() => setDeliveryType('SALON')}
                  className={`p-3.5 rounded-[6px] border text-left flex items-start gap-3 transition-all ${
                    deliveryType === 'SALON'
                      ? 'border-[#1a1816] bg-white dark:border-white dark:bg-[#221f1c] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                      : 'border-[#ded8cb] hover:border-[#b8b3a7] bg-white/70 dark:border-[#2e2a26] dark:bg-[#141211]'
                  } ${service.deliveryType === 'HOME' ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Building2
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      deliveryType === 'SALON' ? 'text-[#1a1816] dark:text-white' : 'text-[#8c857b]'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-[#1a1816] dark:text-white flex items-center gap-1.5">
                      <span>Atelier Salon Visit</span>
                      {deliveryType === 'SALON' && <Check className="w-3.5 h-3.5 text-[#274c3a]" />}
                    </div>
                    <p className="text-[11px] text-[#736d65] mt-0.5">
                      Workstation chair at partner facility.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={service.deliveryType === 'SALON'}
                  onClick={() => setDeliveryType('HOME')}
                  className={`p-3.5 rounded-[6px] border text-left flex items-start gap-3 transition-all ${
                    deliveryType === 'HOME'
                      ? 'border-[#1a1816] bg-white dark:border-white dark:bg-[#221f1c] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                      : 'border-[#ded8cb] hover:border-[#b8b3a7] bg-white/70 dark:border-[#2e2a26] dark:bg-[#141211]'
                  } ${service.deliveryType === 'SALON' ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Home
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      deliveryType === 'HOME' ? 'text-[#1a1816] dark:text-white' : 'text-[#8c857b]'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-bold text-[#1a1816] dark:text-white flex items-center gap-1.5">
                      <span>At-Home Service</span>
                      {deliveryType === 'HOME' && <Check className="w-3.5 h-3.5 text-[#274c3a]" />}
                    </div>
                    <p className="text-[11px] text-[#736d65] mt-0.5">
                      Specialist dispatched to your address.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Stage 2: Add-on Boosters */}
            {service.addons && service.addons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#736d65] dark:text-[#a69f95] uppercase tracking-wider">
                    Stage 2: Treatment Boosters & Extensions
                  </label>
                  <span className="text-[10px] text-[#736d65]">
                    Extends duration & recalibrates slots
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {service.addons.map((addon) => {
                    const isChecked = selectedAddonIds.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-3 rounded-[5px] border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? 'border-[#1a1816] bg-[#1a1816] text-[#fafaf9] dark:border-white dark:bg-white dark:text-[#1a1816] shadow-xs'
                            : 'border-[#ded8cb] dark:border-[#2e2a26] bg-white dark:bg-[#141211] hover:border-[#b8b3a7]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 opacity-80" />
                            <span>{addon.name}</span>
                          </div>
                          <span
                            className={`text-[10px] font-mono ${
                              isChecked ? 'opacity-80' : 'text-[#736d65]'
                            }`}
                          >
                            +{addon.extraDurationMinutes}m runtime
                          </span>
                        </div>
                        <div className="text-xs font-bold font-mono">
                          +₹{Number(addon.price).toLocaleString('en-IN')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stage 3: Appointment Date */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#736d65] dark:text-[#a69f95] uppercase tracking-wider">
                Stage 3: Appointment Date
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(opt.dateStr)}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-medium border transition-colors ${
                      selectedDate === opt.dateStr
                        ? 'border-[#1a1816] bg-[#1a1816] text-[#fafaf9] dark:border-white dark:bg-white dark:text-[#1a1816] font-semibold'
                        : 'border-[#ded8cb] dark:border-[#2e2a26] bg-white dark:bg-[#141211] text-[#57524b] dark:text-[#c4bdb2] hover:border-[#b8b3a7]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="block text-[10px] opacity-75">{opt.dayLabel}</span>
                  </button>
                ))}
                <div className="flex items-center gap-2 ml-auto">
                  <Calendar className="w-3.5 h-3.5 text-[#8c857b]" />
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-[4px] border border-[#d6d3cb] dark:border-[#383532] bg-white dark:bg-[#141211] text-[#1c1917] dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Stage 4: Live Verified Slots */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#736d65] dark:text-[#a69f95] uppercase tracking-wider">
                  Stage 4: Available Time Slots
                </label>
                {isLoadingSlots && (
                  <span className="text-[10px] text-[#736d65] animate-pulse flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Querying verified slots...</span>
                  </span>
                )}
              </div>

              {isLoadingSlots ? (
                <div className="grid grid-cols-3 gap-2.5 py-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-[5px] bg-[#f0eee6] dark:bg-[#221f1c] animate-pulse border border-[#e2ded5]"
                    />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="p-6 text-center rounded-[6px] border border-dashed border-[#ded8cb] dark:border-[#2e2a26] bg-white/50 dark:bg-[#141211]/50 space-y-1">
                  <p className="text-xs font-semibold text-[#1a1816] dark:text-white">
                    No verified slots available on this date
                  </p>
                  <p className="text-[11px] text-[#736d65]">
                    All specialist shifts or workstation chairs are reserved. Please pick an alternate date.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {morningSlots.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-[#8c857b] uppercase tracking-wider">
                        Morning Windows (Before 12:00)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {morningSlots.map((slot) => {
                          const isSelected =
                            selectedSlot?.startTime === slot.startTime &&
                            selectedSlot?.providerId === slot.providerId;
                          return (
                            <button
                              key={`${slot.providerId}-${slot.startTime}`}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-2.5 rounded-[5px] border text-left transition-all ${
                                isSelected
                                  ? 'border-[#1a1816] bg-[#1a1816] text-[#fafaf9] dark:border-white dark:bg-white dark:text-[#1a1816] shadow-xs'
                                  : 'border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#141211] hover:border-[#b8b3a7]'
                              }`}
                            >
                              <div className="text-xs font-bold font-mono">
                                {slot.startTime} – {slot.endTime}
                              </div>
                              <div
                                className={`text-[10px] mt-0.5 truncate flex items-center gap-1 ${
                                  isSelected ? 'opacity-85' : 'text-[#736d65]'
                                }`}
                              >
                                <User className="w-2.5 h-2.5" />
                                <span>{slot.providerName}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {afternoonSlots.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-[#8c857b] uppercase tracking-wider">
                        Afternoon & Evening Windows (12:00 onwards)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {afternoonSlots.map((slot) => {
                          const isSelected =
                            selectedSlot?.startTime === slot.startTime &&
                            selectedSlot?.providerId === slot.providerId;
                          return (
                            <button
                              key={`${slot.providerId}-${slot.startTime}`}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-2.5 rounded-[5px] border text-left transition-all ${
                                isSelected
                                  ? 'border-[#1a1816] bg-[#1a1816] text-[#fafaf9] dark:border-white dark:bg-white dark:text-[#1a1816] shadow-xs'
                                  : 'border-[#ded8cb] bg-white dark:border-[#2e2a26] dark:bg-[#141211] hover:border-[#b8b3a7]'
                              }`}
                            >
                              <div className="text-xs font-bold font-mono">
                                {slot.startTime} – {slot.endTime}
                              </div>
                              <div
                                className={`text-[10px] mt-0.5 truncate flex items-center gap-1 ${
                                  isSelected ? 'opacity-85' : 'text-[#736d65]'
                                }`}
                              >
                                <User className="w-2.5 h-2.5" />
                                <span>{slot.providerName}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stage 5: Residence Address (Home Service only) */}
            {deliveryType === 'HOME' && (
              <div className="space-y-3 p-4 rounded-[6px] bg-[#f5f2eb] dark:bg-[#1f1c19] border border-[#e2ded5] dark:border-[#38332d]">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#1a1816] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#b3592c]" />
                    <span>Destination Residence Address</span>
                  </label>
                  {!isAddingAddress && (
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(true)}
                      className="text-[11px] font-semibold text-[#b3592c] hover:underline"
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {isAddingAddress ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder="Flat, Villa, Street line 1..."
                      value={newStreetAddress}
                      onChange={(e) => setNewStreetAddress(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-[4px] border border-[#d6d3cb] bg-white dark:bg-[#141211]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-[4px] border border-[#d6d3cb] bg-white dark:bg-[#141211]"
                      />
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={newPostalCode}
                        onChange={(e) => setNewPostalCode(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-[4px] border border-[#d6d3cb] bg-white dark:bg-[#141211]"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddingAddress(false)}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" variant="primary" onClick={handleCreateAddress}>
                        Save Address
                      </Button>
                    </div>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-1.5">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-[4px] border text-xs cursor-pointer transition-colors ${
                          selectedAddressId === addr.id
                            ? 'border-[#1a1816] bg-white dark:border-white dark:bg-[#141211] font-semibold'
                            : 'border-[#ded8cb] dark:border-[#2e2a26] bg-white/60 dark:bg-[#141211]/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-0.5"
                        />
                        <div className="leading-snug">
                          <span className="text-[#1a1816] dark:text-white">
                            {addr.label || 'Residence'}
                          </span>
                          <p className="text-[11px] text-[#736d65] font-normal">
                            {addr.streetLine1}, {addr.city} {addr.postalCode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#736d65]">
                    No saved addresses found. Click &quot;Add New Address&quot; above.
                  </p>
                )}
              </div>
            )}

            {/* Client Special Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#736d65] dark:text-[#a69f95] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#8c857b]" />
                <span>Special Instructions or Clinical Sensitivities (Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Skin allergy details, gate passcode, or quiet appointment..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-[5px] border border-[#d6d3cb] bg-white dark:border-[#383532] dark:bg-[#141211] text-[#1c1917] dark:text-white placeholder:text-[#a8a29e]"
              />
            </div>

            {/* Itemized Price Snapshot Breakdown */}
            <div className="p-4 rounded-[6px] bg-white dark:bg-[#141211] border border-[#ded8cb] dark:border-[#2e2a26] space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-[#f0ebe1] dark:border-[#272421]">
                <span className="font-semibold text-[#1a1816] dark:text-white">
                  Procedure Runtime:
                </span>
                <span className="font-mono text-[#1a1816] dark:text-white">
                  {baseDuration}m base {addonsDuration > 0 ? `+ ${addonsDuration}m boosters = ${totalDuration}m` : ''}
                </span>
              </div>

              <div className="space-y-1 text-xs text-[#736d65] dark:text-[#a69f95]">
                <div className="flex items-center justify-between">
                  <span>Base Procedure Fee:</span>
                  <span className="font-mono text-[#1a1816] dark:text-white">₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                {selectedAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between text-[11px]">
                    <span>+ Booster: {addon.name}</span>
                    <span className="font-mono text-[#1a1816] dark:text-white">₹{Number(addon.price).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-[11px]">
                  <span>Estimated Tax (18% GST):</span>
                  <span className="font-mono text-[#1a1816] dark:text-white">₹{estimatedTax.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-[#f0ebe1] dark:border-[#272421] text-sm font-bold text-[#1a1816] dark:text-white">
                <span>Snapshotted Total:</span>
                <span className="text-base font-mono">₹{estimatedTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!bookingConfirmed && (
          <div className="px-6 py-4 border-t border-[#e5e0d5] dark:border-[#272421] bg-white dark:bg-[#141211] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-[#736d65] hover:text-[#1a1816] dark:hover:text-white"
            >
              Cancel
            </button>

            <Button
              variant="primary"
              disabled={
                !selectedSlot ||
                isSubmitting ||
                (deliveryType === 'HOME' && !selectedAddressId)
              }
              onClick={handleConfirmBooking}
              className="flex items-center gap-1.5 text-xs font-semibold h-9 px-5"
            >
              {isSubmitting ? (
                <>
                  <Lock className="w-3.5 h-3.5 animate-spin" />
                  <span>Locking Slot & Reserving...</span>
                </>
              ) : (
                <>
                  <span>Confirm Appointment Reservation</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
