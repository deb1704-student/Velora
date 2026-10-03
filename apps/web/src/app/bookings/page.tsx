'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Home,
  User,
  ShieldCheck,
  AlertCircle,
  XCircle,
  History,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Badge, Button, BookingStatusBadge, EmptyState } from '@velora/ui';
import { BookingStatus } from '@velora/types';
import { bookingsApi, authApi, availabilityApi } from '../../lib/api';

export default function MyBookingsPage() {
  const [currentUser, setCurrentUser] = React.useState<any | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filterTab, setFilterTab] = React.useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  // Modal States
  const [cancellingBooking, setCancellingBooking] = React.useState<any | null>(null);
  const [cancelReason, setCancelReason] = React.useState('');
  const [isCancelling, setIsCancelling] = React.useState(false);

  const [reschedulingBooking, setReschedulingBooking] = React.useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = React.useState('');
  const [availableSlots, setAvailableSlots] = React.useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<any | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState(false);
  const [rescheduleReason, setRescheduleReason] = React.useState('');
  const [isRescheduling, setIsRescheduling] = React.useState(false);

  const [auditLogBooking, setAuditLogBooking] = React.useState<any | null>(null);

  // Load User & Bookings
  const loadBookings = React.useCallback(async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await bookingsApi.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err: any) {
      setActionError(err.message || 'Unable to fetch your booking appointments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const user = authApi.getCurrentUser();
    setCurrentUser(user);
    setIsAuthLoading(false);

    if (user) {
      loadBookings();
    } else {
      setIsLoading(false);
    }
  }, [loadBookings]);

  // Filter Bookings
  const filteredBookings = React.useMemo(() => {
    return bookings.filter((b) => {
      if (filterTab === 'ACTIVE') {
        return [
          BookingStatus.REQUESTED,
          BookingStatus.PENDING_ASSIGNMENT,
          BookingStatus.ASSIGNED,
          BookingStatus.PROVIDER_ACCEPTED,
          BookingStatus.CONFIRMED,
          BookingStatus.PROVIDER_EN_ROUTE,
          BookingStatus.PROVIDER_ARRIVED,
          BookingStatus.SERVICE_STARTED,
        ].includes(b.status);
      }
      if (filterTab === 'COMPLETED') {
        return [
          BookingStatus.SERVICE_COMPLETED,
          BookingStatus.PAYMENT_COMPLETED,
          BookingStatus.CLOSED,
        ].includes(b.status);
      }
      if (filterTab === 'CANCELLED') {
        return [
          BookingStatus.CANCELLED,
          BookingStatus.REJECTED,
          BookingStatus.FAILED,
          BookingStatus.NO_SHOW,
          BookingStatus.RESCHEDULED,
          BookingStatus.DISPUTED,
          BookingStatus.REFUNDED,
        ].includes(b.status);
      }
      return true;
    });
  }, [bookings, filterTab]);

  // Handle Cancel Booking Submission
  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    if (!cancelReason.trim()) {
      setActionError('Please provide a reason for cancelling this appointment.');
      return;
    }

    setIsCancelling(true);
    setActionError(null);

    try {
      const res = await bookingsApi.cancelBooking(cancellingBooking.id, cancelReason);
      if (res.success) {
        setActionSuccess(`Appointment ${cancellingBooking.bookingReference} cancelled successfully.`);
        setCancellingBooking(null);
        setCancelReason('');
        loadBookings();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (booking: any) => {
    setReschedulingBooking(booking);
    // Default to tomorrow or next available day
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const dateStr = d.toISOString().split('T')[0];
    setRescheduleDate(dateStr);
    setSelectedSlot(null);
    setRescheduleReason('');
    fetchRescheduleSlots(booking, dateStr);
  };

  // Fetch Slots for Rescheduling
  const fetchRescheduleSlots = async (booking: any, date: string) => {
    setIsLoadingSlots(true);
    try {
      const serviceId = booking.serviceId || booking.service?.id;
      const res = await availabilityApi.getSlots({
        serviceId,
        date,
        deliveryType: booking.deliveryType,
        salonId: booking.salonId || undefined,
      });
      if (res.success && res.data?.slots) {
        setAvailableSlots(res.data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch {
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Handle Reschedule Date Change
  const handleRescheduleDateChange = (date: string) => {
    setRescheduleDate(date);
    setSelectedSlot(null);
    if (reschedulingBooking) {
      fetchRescheduleSlots(reschedulingBooking, date);
    }
  };

  // Confirm Rescheduling
  const handleConfirmReschedule = async () => {
    if (!reschedulingBooking || !selectedSlot) return;

    setIsRescheduling(true);
    setActionError(null);

    try {
      const res = await bookingsApi.rescheduleBooking(reschedulingBooking.id, {
        appointmentDate: rescheduleDate,
        startTime: selectedSlot.startTime,
        reason: rescheduleReason.trim() || 'Client requested reschedule',
      });

      if (res.success) {
        setActionSuccess(
          `Appointment ${reschedulingBooking.bookingReference} successfully rescheduled to ${rescheduleDate} at ${selectedSlot.startTime}.`
        );
        setReschedulingBooking(null);
        loadBookings();
      }
    } catch (err: any) {
      if (err.statusCode === 409) {
        setActionError('Slot Conflict: The chosen slot was just taken. Please select an alternate slot.');
        fetchRescheduleSlots(reschedulingBooking, rescheduleDate);
      } else {
        setActionError(err.message || 'Failed to reschedule appointment');
      }
    } finally {
      setIsRescheduling(false);
    }
  };

  // Check if state permits cancellation / reschedule
  const isCancellable = (status: BookingStatus) => {
    return [
      BookingStatus.REQUESTED,
      BookingStatus.PENDING_ASSIGNMENT,
      BookingStatus.ASSIGNED,
      BookingStatus.PROVIDER_ACCEPTED,
      BookingStatus.CONFIRMED,
    ].includes(status);
  };

  if (isAuthLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 animate-pulse" />
        <div className="h-32 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-600 dark:text-zinc-300">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Sign In to View Your Bookings
        </h2>
        <p className="text-xs text-zinc-500">
          Manage your verified appointments, track arrival statuses, review snapshotted invoices, or reschedule appointments.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="primary">Sign In to Velora</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Client Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            My Appointments & Bookings
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time tracking across Velora&apos;s 11-stage canonical service lifecycle.
          </p>
        </div>
        <Link href="/services">
          <Button variant="outline" className="flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Book New Treatment</span>
          </Button>
        </Link>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-600 hover:text-rose-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {[
          { key: 'ALL', label: 'All Appointments' },
          { key: 'ACTIVE', label: 'Active & Upcoming' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'CANCELLED', label: 'Cancelled & Other' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterTab(tab.key as any)}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors ${
              filterTab === tab.key
                ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-white font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 animate-pulse border border-zinc-200 dark:border-zinc-800"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Appointments Found"
          description={
            filterTab === 'ALL'
              ? 'You have not reserved any appointments yet. Explore curated salon treatments and home services.'
              : `No appointments found matching the "${filterTab.toLowerCase()}" filter.`
          }
          actionLabel="Browse Salon Catalog"
          onAction={() => {
            window.location.href = '/services';
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const appointmentDateFormatted = new Date(b.appointmentDate)
              .toISOString()
              .split('T')[0];
            const cancellable = isCancellable(b.status);

            return (
              <div
                key={b.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs transition-shadow hover:shadow-md space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                      {b.bookingReference}
                    </span>
                    <BookingStatusBadge status={b.status} />
                    <Badge variant={b.deliveryType === 'HOME' ? 'warning' : 'outline'}>
                      {b.deliveryType === 'HOME' ? (
                        <span className="flex items-center gap-1">
                          <Home className="w-2.5 h-2.5" />
                          Home Service
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5" />
                          Salon Appointment
                        </span>
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{appointmentDateFormatted}</span>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {b.startTime} – {b.endTime}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Service & Addons */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                      Service Suite
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                      {b.service?.name || b.package?.name || 'Selected Treatment'}
                    </h4>
                    {b.selectedAddons && b.selectedAddons.length > 0 && (
                      <div className="space-y-0.5 pt-1">
                        <span className="text-[10px] text-zinc-400">Add-ons:</span>
                        {b.selectedAddons.map((ba: any) => (
                          <div
                            key={ba.id}
                            className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5 opacity-70" />
                            <span>
                              {ba.addon?.name} (+₹{ba.priceSnapshot})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Specialist & Venue */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                      Assigned Professional & Location
                    </span>
                    <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>
                        {b.provider?.user
                          ? `${b.provider.user.firstName} ${b.provider.user.lastName}`
                          : 'Pending Specialist Assignment'}
                      </span>
                    </div>
                    {b.salon && (
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>{b.salon.name}</span>
                      </p>
                    )}
                    {b.address && (
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>
                          {b.address.streetLine1}, {b.address.city}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Price Snapshot */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                      Snapshotted Invoice
                    </span>
                    <div className="space-y-0.5 text-zinc-500 text-[11px]">
                      <div className="flex justify-between">
                        <span>Base Amount:</span>
                        <span>₹{Number(b.baseAmount).toLocaleString('en-IN')}</span>
                      </div>
                      {Number(b.addonsAmount) > 0 && (
                        <div className="flex justify-between">
                          <span>Add-ons:</span>
                          <span>+₹{Number(b.addonsAmount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Tax & Platform:</span>
                        <span>₹{Number(b.taxAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-zinc-900 dark:text-white pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                        <span>Total Snapshotted:</span>
                        <span>₹{Number(b.totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation notice if cancelled */}
                {b.cancellationReason && (
                  <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-200">
                    <span className="font-semibold">Cancellation Note: </span>
                    <span>{b.cancellationReason}</span>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setAuditLogBooking(b)}
                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>View Lifecycle Audit Trail ({b.statusHistory?.length || 1} transitions)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {cancellable && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReschedule(b)}
                          className="flex items-center gap-1 text-xs h-8"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reschedule</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setCancellingBooking(b);
                            setCancelReason('');
                          }}
                          className="flex items-center gap-1 text-xs h-8"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Cancel</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Cancel Appointment
              </h3>
              <p className="text-xs text-zinc-500">
                Are you sure you want to cancel reservation{' '}
                <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                  {cancellingBooking.bookingReference}
                </span>
                ?
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Reason for Cancellation
              </label>
              <textarea
                rows={3}
                placeholder="Please describe why you are cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                disabled={isCancelling}
                onClick={() => setCancellingBooking(null)}
              >
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                disabled={isCancelling || !cancelReason.trim()}
                onClick={handleConfirmCancel}
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Reschedule Appointment
              </h3>
              <p className="text-xs text-zinc-500">
                Select a new verified slot for {reschedulingBooking.bookingReference}.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  New Appointment Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleRescheduleDateChange(e.target.value)}
                  className="mt-1 w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Select New Slot
                </label>
                {isLoadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-10 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                      />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 rounded border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                    No available slots on this date. Please pick another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={`${slot.startTime}-${slot.providerId}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2 rounded text-xs text-left border transition-all ${
                            isSelected
                              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          <div>
                            {slot.startTime} – {slot.endTime}
                          </div>
                          <div className="text-[10px] opacity-70 truncate">
                            {slot.providerName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Reason for Rescheduling
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule adjustment"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="mt-1 w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                disabled={isRescheduling}
                onClick={() => setReschedulingBooking(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={isRescheduling || !selectedSlot}
                onClick={handleConfirmReschedule}
              >
                {isRescheduling ? 'Rescheduling...' : 'Confirm Rescheduled Slot'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail Modal */}
      {auditLogBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Canonical Lifecycle Audit Record</span>
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {auditLogBooking.bookingReference}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuditLogBooking(null)}
                className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {auditLogBooking.statusHistory && auditLogBooking.statusHistory.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-5">
                  {auditLogBooking.statusHistory.map((log: any, idx: number) => (
                    <div key={log.id || idx} className="relative space-y-1">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-zinc-900 dark:bg-zinc-100 ring-4 ring-white dark:ring-zinc-900" />
                      <div className="flex items-center gap-2">
                        <BookingStatusBadge status={log.toStatus} />
                        <span className="text-[10px] text-zinc-400">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      {log.fromStatus && (
                        <p className="text-[11px] text-zinc-500">
                          From <span className="font-semibold">{log.fromStatus}</span> →{' '}
                          <span className="font-semibold">{log.toStatus}</span>
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-zinc-100 dark:border-zinc-800">
                          {log.notes}
                        </p>
                      )}
                      {log.reason && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 italic">
                          Reason: {log.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No transition history logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
