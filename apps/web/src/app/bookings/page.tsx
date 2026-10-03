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
  ChevronRight,
  Receipt,
  Phone,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-4">
        <div className="h-6 bg-[#f0ece1] rounded-[4px] w-1/4 animate-pulse" />
        <div className="h-44 bg-[#f8f6f0] border border-[#e5e0d4] rounded-[6px] animate-pulse" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-12 h-12 rounded-[5px] bg-[#f0ece1] border border-[#ded8cb] flex items-center justify-center mx-auto text-[#1a1816]">
          <User className="w-5 h-5" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-[#1a1816]">
            Sign in to view your reservations
          </h2>
          <p className="text-xs text-[#736b63] leading-relaxed max-w-md mx-auto">
            Manage your verified appointments, track arrival statuses, review snapshotted invoices, or reschedule confirmed treatment slots.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="primary" className="h-10 px-6 text-xs uppercase tracking-wider font-semibold">
              Sign In to Velora
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e5e0d4] pb-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8c827a] block mb-1">
            Client Portal & Tracking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#1a1816]">
            Appointments & Reservations
          </h1>
          <p className="text-xs text-[#736b63] mt-1.5 max-w-xl">
            Real-time tracking across Velora&apos;s 11-stage canonical service lifecycle with cryptographic audit trails and price snapshot guarantees.
          </p>
        </div>
        <Link href="/services">
          <Button variant="outline" className="flex items-center gap-1.5 text-xs h-9">
            <Sparkles className="w-3.5 h-3.5 text-[#b3592c]" />
            <span>Reserve New Treatment</span>
          </Button>
        </Link>
      </div>

      {/* Action Alerts */}
      {actionSuccess && (
        <div className="p-3.5 rounded-[5px] bg-[#f2f7f3] border border-[#cadbc9] flex items-center justify-between text-xs text-[#274c3a]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#274c3a] shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-[11px] underline text-[#274c3a] hover:opacity-75 transition-opacity"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-[5px] bg-[#fdf5f4] border border-[#f1d0ce] flex items-center justify-between text-xs text-[#a0382b]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#a0382b] shrink-0" />
            <span className="font-medium">{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[11px] underline text-[#a0382b] hover:opacity-75 transition-opacity"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-[#e5e0d4] overflow-x-auto">
        {[
          { key: 'ALL', label: 'All Appointments', count: bookings.length },
          {
            key: 'ACTIVE',
            label: 'Active & Upcoming',
            count: bookings.filter((b) =>
              [
                BookingStatus.REQUESTED,
                BookingStatus.PENDING_ASSIGNMENT,
                BookingStatus.ASSIGNED,
                BookingStatus.PROVIDER_ACCEPTED,
                BookingStatus.CONFIRMED,
                BookingStatus.PROVIDER_EN_ROUTE,
                BookingStatus.PROVIDER_ARRIVED,
                BookingStatus.SERVICE_STARTED,
              ].includes(b.status)
            ).length,
          },
          {
            key: 'COMPLETED',
            label: 'Completed',
            count: bookings.filter((b) =>
              [
                BookingStatus.SERVICE_COMPLETED,
                BookingStatus.PAYMENT_COMPLETED,
                BookingStatus.CLOSED,
              ].includes(b.status)
            ).length,
          },
          {
            key: 'CANCELLED',
            label: 'Cancelled / Archived',
            count: bookings.filter((b) =>
              [
                BookingStatus.CANCELLED,
                BookingStatus.REJECTED,
                BookingStatus.FAILED,
                BookingStatus.NO_SHOW,
                BookingStatus.RESCHEDULED,
                BookingStatus.DISPUTED,
                BookingStatus.REFUNDED,
              ].includes(b.status)
            ).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterTab(tab.key as any)}
            className={`pb-3 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === tab.key
                ? 'border-[#1a1816] text-[#1a1816] font-semibold'
                : 'border-transparent text-[#736b63] hover:text-[#1a1816]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-[3px] ${
              filterTab === tab.key ? 'bg-[#1a1816] text-white' : 'bg-[#ede9df] text-[#736b63]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-[6px] bg-[#f8f6f0] border border-[#e5e0d4] animate-pulse"
            />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Appointments in this View"
          description={
            filterTab === 'ALL'
              ? 'You have not reserved any appointments yet. Explore curated salon treatments and in-home specialist services.'
              : `No appointments currently found in the "${filterTab.toLowerCase()}" filter.`
          }
          actionLabel="Explore Available Treatments"
          onAction={() => {
            window.location.href = '/services';
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const appointmentDateFormatted = new Date(b.appointmentDate)
              .toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
            const cancellable = isCancellable(b.status);

            return (
              <div
                key={b.id}
                className="rounded-[6px] border border-[#ded8cb] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-[#b8b0a2] transition-colors space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0ece1]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#1a1816] bg-[#f5f2eb] px-2 py-0.5 rounded-[3px] border border-[#e5e0d4]">
                      {b.bookingReference}
                    </span>
                    <BookingStatusBadge status={b.status} />
                    <Badge variant={b.deliveryType === 'HOME' ? 'warning' : 'outline'}>
                      {b.deliveryType === 'HOME' ? (
                        <span className="flex items-center gap-1">
                          <Home className="w-2.5 h-2.5" />
                          In-Home Specialist
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5" />
                          Atelier Studio
                        </span>
                      )}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#59524c] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#8c827a]" />
                    <span>{appointmentDateFormatted}</span>
                    <span className="text-[#ded8cb]">•</span>
                    <Clock className="w-3.5 h-3.5 text-[#8c827a]" />
                    <span className="font-mono font-medium">
                      {b.startTime} – {b.endTime}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                  {/* Service & Addons */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#8c827a] font-semibold">
                      Treatment Specification
                    </span>
                    <h4 className="font-serif text-base font-normal text-[#1a1816]">
                      {b.service?.name || b.package?.name || 'Selected Treatment'}
                    </h4>
                    {b.selectedAddons && b.selectedAddons.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-[#8c827a] block">Configured Enhancements:</span>
                        {b.selectedAddons.map((ba: any) => (
                          <div
                            key={ba.id}
                            className="text-[11px] text-[#59524c] flex items-center gap-1.5"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#b3592c]" />
                            <span>
                              {ba.addon?.name} (+₹{ba.priceSnapshot})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Specialist & Venue */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-[#8c827a] font-semibold">
                      Assigned Professional & Location
                    </span>
                    <div className="font-medium text-[#1a1816] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#8c827a]" />
                      <span>
                        {b.provider?.user
                          ? `${b.provider.user.firstName} ${b.provider.user.lastName}`
                          : 'Pending Specialist Dispatch'}
                      </span>
                    </div>
                    {b.salon && (
                      <p className="text-[11px] text-[#59524c] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#8c827a] shrink-0" />
                        <span>{b.salon.name}</span>
                      </p>
                    )}
                    {b.address && (
                      <p className="text-[11px] text-[#59524c] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#8c827a] shrink-0" />
                        <span>
                          {b.address.streetLine1}, {b.address.city}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Price Snapshot */}
                  <div className="space-y-1.5 bg-[#fbf9f5] p-3 rounded-[5px] border border-[#e5e0d4]">
                    <div className="flex items-center justify-between pb-1 border-b border-[#e5e0d4]">
                      <span className="text-[10px] uppercase tracking-wider text-[#8c827a] font-semibold flex items-center gap-1">
                        <Receipt className="w-3 h-3 text-[#8c827a]" />
                        Snapshotted Invoice
                      </span>
                      <span className="text-[9px] font-mono text-[#8c827a]">LOCKED</span>
                    </div>
                    <div className="space-y-1 text-[#59524c] text-[11px] pt-1">
                      <div className="flex justify-between">
                        <span>Base Procedure:</span>
                        <span className="font-mono">₹{Number(b.baseAmount).toLocaleString('en-IN')}</span>
                      </div>
                      {Number(b.addonsAmount) > 0 && (
                        <div className="flex justify-between">
                          <span>Enhancements:</span>
                          <span className="font-mono">+₹{Number(b.addonsAmount).toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Platform & Tax:</span>
                        <span className="font-mono">₹{Number(b.taxAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#1a1816] pt-1 border-t border-[#ded8cb] text-xs">
                        <span>Total Due:</span>
                        <span className="font-mono">₹{Number(b.totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation notice if cancelled */}
                {b.cancellationReason && (
                  <div className="p-3 rounded-[5px] bg-[#fdf5f4] border border-[#f1d0ce] text-[11px] text-[#a0382b]">
                    <span className="font-semibold">Cancellation Record: </span>
                    <span>{b.cancellationReason}</span>
                  </div>
                )}

                {/* Footer Controls */}
                <div className="pt-3 border-t border-[#f0ece1] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setAuditLogBooking(b)}
                    className="text-xs text-[#736b63] hover:text-[#1a1816] flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <History className="w-3.5 h-3.5 text-[#b3592c]" />
                    <span>View Lifecycle Audit Trail ({b.statusHistory?.length || 1} transitions)</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {cancellable && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReschedule(b)}
                          className="flex items-center gap-1 text-xs h-8 px-3"
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
                          className="flex items-center gap-1 text-xs h-8 px-3"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1816]/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white border border-[#ded8cb] rounded-[6px] shadow-2xl p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#a0382b] font-semibold">
                Lifecycle Action
              </span>
              <h3 className="font-serif text-xl font-normal text-[#1a1816]">
                Cancel Reservation
              </h3>
              <p className="text-xs text-[#736b63]">
                Confirm cancellation of appointment{' '}
                <span className="font-mono font-semibold text-[#1a1816]">
                  {cancellingBooking.bookingReference}
                </span>
                . Associated workstation/specialist slots will be released immediately.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#3d3834]">
                Reason for Cancellation <span className="text-[#a0382b]">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Please describe why this appointment is being cancelled..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-[5px] border border-[#ded8cb] bg-[#faf8f5] text-[#1a1816] focus:outline-none focus:border-[#1a1816]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0ece1]">
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
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1816]/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white border border-[#ded8cb] rounded-[6px] shadow-2xl p-6 space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#b3592c] font-semibold">
                Slot Reallocation
              </span>
              <h3 className="font-serif text-xl font-normal text-[#1a1816]">
                Reschedule Appointment
              </h3>
              <p className="text-xs text-[#736b63]">
                Select a new verified slot for {reschedulingBooking.bookingReference}.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#3d3834] block mb-1">
                  New Appointment Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleRescheduleDateChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-[5px] border border-[#ded8cb] bg-[#faf8f5] text-[#1a1816] focus:outline-none focus:border-[#1a1816]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3d3834] block mb-1.5">
                  Available Verified Slots
                </label>
                {isLoadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-10 rounded-[4px] bg-[#f5f2eb] animate-pulse"
                      />
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 rounded-[4px] border border-dashed border-[#ded8cb] text-center text-xs text-[#736b63]">
                    No available verified slots on this date. Please select an alternate date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto p-0.5">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?.startTime === slot.startTime;
                      return (
                        <button
                          key={`${slot.startTime}-${slot.providerId}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2 rounded-[4px] text-xs text-left border transition-all ${
                            isSelected
                              ? 'border-[#1a1816] bg-[#1a1816] text-white font-semibold'
                              : 'border-[#ded8cb] bg-white hover:border-[#8c827a] text-[#1a1816]'
                          }`}
                        >
                          <div className="font-mono font-medium">
                            {slot.startTime} – {slot.endTime}
                          </div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-[#736b63]'}`}>
                            {slot.providerName}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#3d3834] block mb-1">
                  Reason for Rescheduling
                </label>
                <input
                  type="text"
                  placeholder="e.g. Client schedule shift"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-[5px] border border-[#ded8cb] bg-[#faf8f5] text-[#1a1816] focus:outline-none focus:border-[#1a1816]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0ece1]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1816]/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl bg-white border border-[#ded8cb] rounded-[6px] shadow-2xl p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0ece1] pb-3">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#1a1816] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#274c3a]" />
                  <span>Canonical Lifecycle Audit Record</span>
                </h3>
                <p className="text-[11px] text-[#736b63] font-mono">
                  {auditLogBooking.bookingReference}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuditLogBooking(null)}
                className="text-xs text-[#736b63] hover:text-[#1a1816] px-2 py-1 rounded-[3px] border border-[#ded8cb]"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {auditLogBooking.statusHistory && auditLogBooking.statusHistory.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-[#e5e0d4] space-y-6">
                  {auditLogBooking.statusHistory.map((log: any, idx: number) => (
                    <div key={log.id || idx} className="relative space-y-1">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#1a1816] ring-4 ring-white" />
                      <div className="flex items-center gap-2">
                        <BookingStatusBadge status={log.toStatus} />
                        <span className="text-[10px] font-mono text-[#8c827a]">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      {log.fromStatus && (
                        <p className="text-[11px] text-[#736b63]">
                          State shifted from <span className="font-semibold text-[#1a1816]">{log.fromStatus}</span> →{' '}
                          <span className="font-semibold text-[#1a1816]">{log.toStatus}</span>
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-xs text-[#3d3834] bg-[#faf8f5] p-2.5 rounded-[4px] border border-[#ded8cb]">
                          {log.notes}
                        </p>
                      )}
                      {log.reason && (
                        <p className="text-[11px] text-[#a0382b] italic">
                          Reason: {log.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#736b63]">No transition history logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
