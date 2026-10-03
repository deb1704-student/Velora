'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  BookingStatusBadge,
  Input,
  Button,
  EmptyState,
  Badge,
} from '@velora/ui';
import {
  CalendarDays,
  Filter,
  RefreshCw,
  Clock,
  User,
  Building2,
  Home,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
  ChevronRight,
  X,
  Play,
  Check,
  UserX,
  XCircle,
} from 'lucide-react';
import { BookingStatus, ServiceDeliveryType } from '@velora/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export default function BookingsMonitorPage() {
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionMessage, setActionMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Booking for Audit Trail Drawer
  const [selectedAuditBooking, setSelectedAuditBooking] = React.useState<any | null>(null);

  // Transition Processing State
  const [isProcessingTransition, setIsProcessingTransition] = React.useState(false);

  // Authenticate Admin Helper
  const getAdminToken = async () => {
    let token = typeof window !== 'undefined' ? localStorage.getItem('velora_admin_token') : null;
    if (!token) {
      try {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@velora.luxury',
            password: 'AdminSecretPass123!',
          }),
        }).then((r) => r.json());
        if (loginRes.data?.tokens?.accessToken) {
          token = loginRes.data.tokens.accessToken;
          if (typeof window !== 'undefined' && token) {
            localStorage.setItem('velora_admin_token', token);
          }
        }
      } catch {
        // ignore login error
      }
    }
    return token;
  };

  // Fetch Live Bookings
  const fetchBookings = React.useCallback(async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const token = await getAdminToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/bookings?limit=50`, { headers }).then((r) => r.json());
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch {
      // Keep existing bookings or display error
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Execute State Machine Transition
  const handleTransition = async (bookingId: string, targetStatus: BookingStatus, notes?: string) => {
    setIsProcessingTransition(true);
    setActionMessage(null);
    try {
      const token = await getAdminToken();
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/transition`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: targetStatus,
          notes: notes || `Admin transitioned to ${targetStatus}`,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Booking updated to ${targetStatus.replace(/_/g, ' ')}.`,
        });
        fetchBookings();
      } else {
        setActionMessage({
          type: 'error',
          text: res.message || 'Illegal transition rejected by lifecycle state engine.',
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to update booking status.',
      });
    } finally {
      setIsProcessingTransition(false);
    }
  };

  // Mark No-Show
  const handleMarkNoShow = async (bookingId: string) => {
    setIsProcessingTransition(true);
    setActionMessage(null);
    try {
      const token = await getAdminToken();
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/no-show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: 'Customer did not show up within grace period.' }),
      }).then((r) => r.json());

      if (res.success) {
        setActionMessage({ type: 'success', text: 'Booking recorded as NO-SHOW.' });
        fetchBookings();
      } else {
        setActionMessage({ type: 'error', text: res.message || 'Failed to mark as no-show.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Error executing no-show.' });
    } finally {
      setIsProcessingTransition(false);
    }
  };

  // Filter Bookings
  const filtered = React.useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;
      const ref = b.bookingReference || '';
      const custName = b.customer?.user
        ? `${b.customer.user.firstName} ${b.customer.user.lastName}`
        : '';
      const serviceName = b.service?.name || b.package?.name || '';
      const matchesSearch =
        ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [bookings, selectedStatus, searchQuery]);

  // Determine allowed next primary action button based on canonical state machine
  const getNextAction = (booking: any) => {
    const isHome = booking.deliveryType === 'HOME';

    switch (booking.status) {
      case BookingStatus.REQUESTED:
        return { label: 'Assign Specialist', next: BookingStatus.PENDING_ASSIGNMENT };
      case BookingStatus.PENDING_ASSIGNMENT:
        return { label: 'Mark Assigned', next: BookingStatus.ASSIGNED };
      case BookingStatus.ASSIGNED:
        return { label: 'Accept as Provider', next: BookingStatus.PROVIDER_ACCEPTED };
      case BookingStatus.PROVIDER_ACCEPTED:
        return { label: 'Confirm Booking', next: BookingStatus.CONFIRMED };
      case BookingStatus.CONFIRMED:
        if (isHome) {
          return { label: 'Start En Route', next: BookingStatus.PROVIDER_EN_ROUTE };
        }
        return { label: 'Client Arrived', next: BookingStatus.PROVIDER_ARRIVED };
      case BookingStatus.PROVIDER_EN_ROUTE:
        return { label: 'Provider Arrived', next: BookingStatus.PROVIDER_ARRIVED };
      case BookingStatus.PROVIDER_ARRIVED:
        return { label: 'Start Service', next: BookingStatus.SERVICE_STARTED };
      case BookingStatus.SERVICE_STARTED:
        return { label: 'Complete Service', next: BookingStatus.SERVICE_COMPLETED };
      case BookingStatus.SERVICE_COMPLETED:
        return { label: 'Record Payment', next: BookingStatus.PAYMENT_COMPLETED };
      case BookingStatus.PAYMENT_COMPLETED:
        return { label: 'Close Lifecycle', next: BookingStatus.CLOSED };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Authoritative Booking Lifecycle Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict transactional management across Velora&apos;s 11-stage canonical workflow.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchBookings}
          disabled={isLoading}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Bookings</span>
        </Button>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row gap-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex-1">
          <Input
            placeholder="Search by reference (VEL-...), customer name, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 text-xs"
          />
        </div>
        <div className="sm:w-64">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Lifecycle States</option>
            <option value={BookingStatus.REQUESTED}>1. Requested</option>
            <option value={BookingStatus.PENDING_ASSIGNMENT}>2. Pending Assignment</option>
            <option value={BookingStatus.ASSIGNED}>3. Assigned</option>
            <option value={BookingStatus.PROVIDER_ACCEPTED}>4. Provider Accepted</option>
            <option value={BookingStatus.CONFIRMED}>5. Confirmed</option>
            <option value={BookingStatus.PROVIDER_EN_ROUTE}>6. Provider En Route</option>
            <option value={BookingStatus.PROVIDER_ARRIVED}>7. Provider Arrived</option>
            <option value={BookingStatus.SERVICE_STARTED}>8. Service Started</option>
            <option value={BookingStatus.SERVICE_COMPLETED}>9. Service Completed</option>
            <option value={BookingStatus.PAYMENT_COMPLETED}>10. Payment Completed</option>
            <option value={BookingStatus.CLOSED}>11. Closed</option>
            <option value={BookingStatus.CANCELLED}>Cancelled</option>
            <option value={BookingStatus.NO_SHOW}>No Show</option>
            <option value={BookingStatus.RESCHEDULED}>Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service & Mode</TableHead>
                <TableHead>Specialist / Salon</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Snapshot Amount</TableHead>
                <TableHead>Lifecycle Stage</TableHead>
                <TableHead className="text-right">Canonical Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const nextAction = getNextAction(item);
                const canNoShow = [BookingStatus.CONFIRMED, BookingStatus.PROVIDER_ARRIVED].includes(
                  item.status
                );
                const custName = item.customer?.user
                  ? `${item.customer.user.firstName} ${item.customer.user.lastName}`
                  : 'Customer';
                const serviceTitle = item.service?.name || item.package?.name || 'Treatment';
                const appointmentDateStr = new Date(item.appointmentDate)
                  .toISOString()
                  .split('T')[0];

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {item.bookingReference}
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-xs text-slate-900 dark:text-white">
                        {custName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.customer?.user?.email}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-xs text-slate-900 dark:text-white">
                        {serviceTitle}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        {item.deliveryType === 'SALON' ? (
                          <>
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>Salon Appointment</span>
                          </>
                        ) : (
                          <>
                            <Home className="w-3 h-3 text-amber-500" />
                            <span>Home Service</span>
                          </>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                      <div>
                        {item.provider?.user
                          ? `${item.provider.user.firstName} ${item.provider.user.lastName}`
                          : item.salon?.name || 'Unassigned'}
                      </div>
                      {item.salon && item.provider && (
                        <div className="text-[10px] text-slate-400">{item.salon.name}</div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-mono text-xs text-slate-800 dark:text-slate-200">
                        {appointmentDateStr}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.startTime} – {item.endTime}
                      </div>
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-slate-900 dark:text-white">
                      ₹{Number(item.totalAmount).toLocaleString('en-IN')}
                    </TableCell>

                    <TableCell>
                      <BookingStatusBadge status={item.status} />
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {nextAction && (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={isProcessingTransition}
                            onClick={() => handleTransition(item.id, nextAction.next)}
                            className="text-[11px] h-7 px-2.5 flex items-center gap-1"
                          >
                            <span>{nextAction.label}</span>
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        )}

                        {canNoShow && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isProcessingTransition}
                            onClick={() => handleMarkNoShow(item.id)}
                            className="text-[11px] h-7 px-2 text-rose-600 hover:text-rose-700"
                            title="Mark No-Show"
                          >
                            <UserX className="w-3 h-3" />
                          </Button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedAuditBooking(item)}
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title="View Transition History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No Bookings Found"
          description="There are currently no bookings matching the selected status or query."
          actionLabel="View All Bookings"
          onAction={() => {
            setSelectedStatus('ALL');
            setSearchQuery('');
          }}
        />
      )}

      {/* Transition History Modal */}
      {selectedAuditBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>State Transition Audit Trail</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {selectedAuditBooking.bookingReference}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditBooking(null)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {selectedAuditBooking.statusHistory && selectedAuditBooking.statusHistory.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-5">
                  {selectedAuditBooking.statusHistory.map((log: any, idx: number) => (
                    <div key={log.id || idx} className="relative space-y-1">
                      <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 dark:bg-slate-100 ring-4 ring-white dark:ring-slate-900" />
                      <div className="flex items-center gap-2">
                        <BookingStatusBadge status={log.toStatus} />
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      {log.fromStatus && (
                        <p className="text-[11px] text-slate-500">
                          Transition: <span className="font-semibold">{log.fromStatus}</span> →{' '}
                          <span className="font-semibold">{log.toStatus}</span>
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">
                          {log.notes}
                        </p>
                      )}
                      {log.reason && (
                        <p className="text-[11px] text-rose-600 italic">Reason: {log.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No transition history logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
