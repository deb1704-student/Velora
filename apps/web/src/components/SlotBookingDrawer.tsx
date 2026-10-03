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
} from 'lucide-react';
import { Badge, Button } from '@velora/ui';
import { availabilityApi } from '../lib/api';

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
  onConfirmSlot?: (details: {
    serviceId: string;
    date: string;
    deliveryType: 'SALON' | 'HOME';
    slot: {
      startTime: string;
      endTime: string;
      providerId: string;
      providerName: string;
    };
    addonIds: string[];
    totalAmount: number;
    totalDuration: number;
  }) => void;
}

export function SlotBookingDrawer({
  isOpen,
  onClose,
  service,
  initialSalonId,
  onConfirmSlot,
}: SlotBookingDrawerProps) {
  // Format dates: get default date formatted as YYYY-MM-DD
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
  const [bookingConfirmedNotice, setBookingConfirmedNotice] = React.useState(false);

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
      setBookingConfirmedNotice(false);
    }
  }, [service]);

  // Calculate pricing and duration dynamically
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
  React.useEffect(() => {
    if (!isOpen || !service) return;

    let isMounted = true;
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
        if (!isMounted) return;
        if (res.success && res.data?.slots) {
          setSlots(res.data.slots);
          // If previous selection isn't in new slots, clear it
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
        if (!isMounted) return;
        setSlots([]);
        setErrorMessage(err.message || 'Unable to retrieve slots for this schedule.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, service?.id, selectedDate, deliveryType, totalDuration, initialSalonId]);

  if (!isOpen || !service) return null;

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Group slots into Morning and Afternoon/Evening
  const morningSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(':')[0], 10);
    return hour < 12;
  });

  const afternoonSlots = slots.filter((s) => {
    const hour = parseInt(s.startTime.split(':')[0], 10);
    return hour >= 12;
  });

  // Helper date buttons
  const dateOptions = [
    { label: 'Today', offset: 0 },
    { label: 'Tomorrow', offset: 1 },
    { label: '+2 Days', offset: 2 },
    { label: '+3 Days', offset: 3 },
  ].map((opt) => {
    const d = new Date();
    d.setDate(d.getDate() + opt.offset);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return {
      label: opt.label,
      dateStr,
      dayLabel,
    };
  });

  const handleProceed = () => {
    if (!selectedSlot) return;
    if (onConfirmSlot) {
      onConfirmSlot({
        serviceId: service.id,
        date: selectedDate,
        deliveryType,
        slot: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          providerId: selectedSlot.providerId,
          providerName: selectedSlot.providerName,
        },
        addonIds: selectedAddonIds,
        totalAmount: estimatedTotal,
        totalDuration,
      });
    }
    setBookingConfirmedNotice(true);
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
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {service.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Delivery Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              1. Delivery Setting
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={service.deliveryType === 'HOME'}
                onClick={() => setDeliveryType('SALON')}
                className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'SALON'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : service.deliveryType === 'HOME'
                    ? 'opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
                }`}
              >
                <Building2 className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold">In-Salon Atelier</div>
                  <div className={`text-[11px] mt-0.5 ${deliveryType === 'SALON' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'}`}>
                    Private styling chair at Maison de Velora
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={service.deliveryType === 'SALON'}
                onClick={() => setDeliveryType('HOME')}
                className={`p-3.5 rounded-lg border text-left flex items-start gap-3 transition-all ${
                  deliveryType === 'HOME'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : service.deliveryType === 'SALON'
                    ? 'opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
                }`}
              >
                <Home className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-bold">At-Home Specialist</div>
                  <div className={`text-[11px] mt-0.5 ${deliveryType === 'HOME' ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'}`}>
                    Certified specialist travels directly to you
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Optional Add-ons & Boosters */}
          {service.addons && service.addons.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  2. Optional Boosters & Treatments
                </label>
                <span className="text-[11px] text-zinc-400">
                  Select to customize ritual duration & formula
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.addons.map((addon) => {
                  const isSelected = selectedAddonIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800/80'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium text-zinc-900 dark:text-white">
                          {addon.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>+{addon.extraDurationMinutes} mins</span>
                          <span>•</span>
                          <span>+₹{Number(addon.price).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-900'
                            : 'border-zinc-300 dark:border-zinc-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Appointment Date Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                {service.addons && service.addons.length > 0 ? '3' : '2'}. Select Appointment Date
              </label>
              <span className="text-[11px] font-mono text-zinc-400">
                {selectedDate}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {dateOptions.map((opt) => (
                <button
                  key={opt.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(opt.dateStr)}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    selectedDate === opt.dateStr
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className={`text-[10px] mt-0.5 ${selectedDate === opt.dateStr ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500'}`}>
                    {opt.dayLabel}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-1 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <span className="text-[11px] text-zinc-400">
                Or pick any custom date from the calendar
              </span>
            </div>
          </div>

          {/* 4. Live Available Slots Grid */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Available Starting Windows
                </label>
                <Badge variant="neutral" className="text-[10px]">
                  {totalDuration} mins runtime
                </Badge>
              </div>
              <span className="text-[11px] text-zinc-400">
                {isLoadingSlots
                  ? 'Calculating availability...'
                  : `${slots.length} slots available`}
              </span>
            </div>

            {isLoadingSlots ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                ))}
              </div>
            ) : errorMessage ? (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {errorMessage}
              </div>
            ) : slots.length === 0 ? (
              <div className="p-6 text-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 space-y-2">
                <Clock className="w-6 h-6 text-zinc-400 mx-auto" />
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  No Available Appointments on {selectedDate}
                </div>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                  Our accredited specialists are either scheduled off, on break, or fully reserved
                  for this duration. Try selecting another date or adjusting delivery mode.
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

          {/* 5. Appointment Summary & Price Breakdown */}
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Treatment Duration:
              </span>
              <span className="font-mono text-zinc-900 dark:text-white">
                {baseDuration}m base {addonsDuration > 0 ? `+ ${addonsDuration}m boosters = ${totalDuration}m` : ''}
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

          {/* Booking Confirmed / Ready Notice */}
          {bookingConfirmedNotice && (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
              <div>
                <span className="font-bold">Slot Selected & Verified:</span> {selectedDate} at {selectedSlot?.startTime} – {selectedSlot?.endTime} with {selectedSlot?.providerName}. Ready for booking creation in Phase 7!
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
            disabled={!selectedSlot}
            onClick={handleProceed}
            className="flex items-center gap-1.5"
          >
            <span>Proceed to Appointment Booking</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
