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
  ExternalLink,
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

  // Flow & State Machine Execution
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
          // ignore if addresses cannot be fetched
        });
    }
  }, [isOpen]);

  // Pricing and runtime calculations
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

  // Fetch slots whenever service, date, deliveryType, or duration changes
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

  // Handle Save New Address
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

  // Transactional Safe Booking Submission
  const handleConfirmBooking = async () => {
    if (!currentUser) {
      setErrorMessage('Please log in with your Velora client account to confirm your reservation.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Please select an available appointment time slot.');
      return;
    }

    if (deliveryType === 'HOME' && !selectedAddressId) {
      setErrorMessage('Please select or specify a destination delivery address for home service.');
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
      // Honest Conflict Handling
      if (err.statusCode === 409 || err.message?.includes('already reserved') || err.message?.includes('capacity')) {
        setErrorMessage(
          'Slot Conflict: This time window was just reserved by another client or salon capacity was reached. We have refreshed the live schedule for you.'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-950/40">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {service.category?.name || 'Treatment Suite'}
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{service.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {bookingConfirmed ? (
          /* Confirmation State View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-600 dark:text-emerald-400">
                Reservation Confirmed
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {bookingConfirmed.bookingReference}
              </h3>
              <p className="text-xs text-zinc-500">
                Your appointment has been successfully scheduled and transactionally verified.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-left space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Service:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {bookingConfirmed.service?.name || service.name}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Date & Window:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {new Date(bookingConfirmed.appointmentDate).toISOString().split('T')[0]} at{' '}
                  {bookingConfirmed.startTime} – {bookingConfirmed.endTime}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Mode:</span>
                <Badge variant={bookingConfirmed.deliveryType === 'HOME' ? 'warning' : 'outline'}>
                  {bookingConfirmed.deliveryType === 'HOME' ? 'Home Service' : 'In-Salon Appointment'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Snapshotted Total:</span>
                <span className="font-bold text-sm text-zinc-900 dark:text-white">
                  ₹{Number(bookingConfirmed.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  setBookingConfirmed(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onClose();
                  router.push('/bookings');
                }}
                className="flex items-center gap-1.5"
              >
                <span>View My Bookings</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Error / Conflict Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Unauthenticated Notification */}
            {!currentUser && (
              <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Please sign in with your customer account to complete your booking.</span>
                </div>
                <Link
                  href="/login"
                  className="font-semibold underline hover:text-amber-900 dark:hover:text-white"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* 1. Delivery Mode Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                1. Delivery Preference
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={service.deliveryType === 'HOME'}
                  onClick={() => setDeliveryType('SALON')}
                  className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all ${
                    deliveryType === 'SALON'
                      ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                  } ${service.deliveryType === 'HOME' ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Building2
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      deliveryType === 'SALON'
                        ? 'text-zinc-900 dark:text-white'
                        : 'text-zinc-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span>Salon Visit</span>
                      {deliveryType === 'SALON' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Relax at partner atelier workstation.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={service.deliveryType === 'SALON'}
                  onClick={() => setDeliveryType('HOME')}
                  className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all ${
                    deliveryType === 'HOME'
                      ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                  } ${service.deliveryType === 'SALON' ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Home
                    className={`w-5 h-5 mt-0.5 shrink-0 ${
                      deliveryType === 'HOME'
                        ? 'text-zinc-900 dark:text-white'
                        : 'text-zinc-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span>Home Service</span>
                      {deliveryType === 'HOME' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Specialist arrives at your residence.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Optional Service Add-Ons */}
            {service.addons && service.addons.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    2. Optional Boosters & Treatments
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Add-ons extend duration & calculate accurate runtime
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
                        className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 opacity-80" />
                            <span>{addon.name}</span>
                          </div>
                          <span
                            className={`text-[10px] ${
                              isChecked ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'
                            }`}
                          >
                            +{addon.extraDurationMinutes} mins
                          </span>
                        </div>
                        <div className="text-xs font-bold">
                          +₹{Number(addon.price).toLocaleString('en-IN')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Appointment Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                3. Choose Appointment Date
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(opt.dateStr)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      selectedDate === opt.dateStr
                        ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="block text-[10px] opacity-70">{opt.dayLabel}</span>
                  </button>
                ))}
                <div className="flex items-center gap-2 ml-auto">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* 4. Live Available Slots */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  4. Available Time Slots
                </label>
                {isLoadingSlots && (
                  <span className="text-[11px] text-zinc-500 animate-pulse flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Querying live slots...</span>
                  </span>
                )}
              </div>

              {isLoadingSlots ? (
                <div className="grid grid-cols-3 gap-2.5 py-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="p-6 text-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-1">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    No available slots on this date
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    All specialists or chairs are booked. Try selecting an alternate date.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {morningSlots.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Morning Appointments (Before 12:00)
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
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow'
                                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
                              }`}
                            >
                              <div className="text-xs font-bold">
                                {slot.startTime} – {slot.endTime}
                              </div>
                              <div
                                className={`text-[10px] mt-0.5 truncate flex items-center gap-1 ${
                                  isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'
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
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Afternoon & Evening Appointments (12:00 onwards)
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
                              className={`p-2.5 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow'
                                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
                              }`}
                            >
                              <div className="text-xs font-bold">
                                {slot.startTime} – {slot.endTime}
                              </div>
                              <div
                                className={`text-[10px] mt-0.5 truncate flex items-center gap-1 ${
                                  isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'
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

            {/* 5. Destination Address (Home Service only) */}
            {deliveryType === 'HOME' && (
              <div className="space-y-3 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>5. Destination Residence Address</span>
                  </label>
                  {!isAddingAddress && (
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(true)}
                      className="text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:underline"
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
                      className="w-full text-xs px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                      />
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={newPostalCode}
                        onChange={(e) => setNewPostalCode(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
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
                        className={`flex items-start gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                          selectedAddressId === addr.id
                            ? 'border-zinc-900 bg-white dark:border-zinc-100 dark:bg-zinc-900'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/40'
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
                          <span className="font-semibold text-zinc-900 dark:text-white">
                            {addr.label || 'Home'}
                          </span>
                          <p className="text-[11px] text-zinc-500">
                            {addr.streetLine1}, {addr.city} {addr.postalCode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500">
                    No saved addresses found. Click &quot;Add New Address&quot; above to add your location.
                  </p>
                )}
              </div>
            )}

            {/* 6. Special Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Special Instructions / Notes (Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Skin sensitivity preferences, gate passcode, or quiet appointment..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
            </div>

            {/* 7. Appointment Summary & Price Breakdown */}
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Treatment Duration:
                </span>
                <span className="font-mono text-zinc-900 dark:text-white">
                  {baseDuration}m base{' '}
                  {addonsDuration > 0 ? `+ ${addonsDuration}m boosters = ${totalDuration}m` : ''}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span>Base Procedure Fee:</span>
                  <span>₹{basePrice.toLocaleString('en-IN')}</span>
                </div>
                {selectedAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between text-[11px]">
                    <span>+ {addon.name}:</span>
                    <span>₹{Number(addon.price).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-[11px]">
                  <span>Estimated Tax (18% GST):</span>
                  <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-white">
                <span>Estimated Total:</span>
                <span className="text-base">₹{estimatedTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!bookingConfirmed && (
          <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
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
              className="flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
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
