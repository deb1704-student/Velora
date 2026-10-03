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
  Search,
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
          text: `Booking state transitioned to ${targetStatus.replace(/_/g, ' ')}.`,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#64748b] block mb-1">
            Authoritative Dispatch Engine
          </span>
          <h1 className="text-xl font-bold tracking-tight text-[#090d16]">
            Booking Lifecycle Monitor
          </h1>
          <p className="text-xs text-[#64748b] mt-0.5">
            Strict transactional governance across Velora&apos;s 11-stage canonical lifecycle.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchBookings}
          disabled={isLoading}
          className="flex items-center gap-1.5 self-start sm:self-auto h-8 px-3 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Bookings</span>
        </Button>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-[4px] border text-xs flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'
              : 'bg-[#fff1f2] border-[#fecdd3] text-[#9f1239]'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#e11d48] shrink-0" />
            )}
            <span className="font-medium">{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-[#64748b] hover:text-[#090d16]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3.5 rounded-[4px] border border-[#e2e8f0] bg-white flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
          <Input
            placeholder="Search by reference (VEL-...), customer name, or treatment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>
        <div className="sm:w-64">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 w-full rounded-[4px] border border-[#cbd5e1] bg-white px-3 text-xs font-medium text-[#090d16] focus:outline-none focus:border-[#090d16]"
          >
            <option value="ALL">All Lifecycle States ({bookings.length})</option>
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
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-[4px] bg-[#f1f5f9] animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="rounded-[4px] border border-[#e2e8f0] overflow-hidden bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Reference</TableHead>
                <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Customer</TableHead>
                <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Service & Mode</TableHead>
                <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Specialist / Salon</TableHead>
                <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Date & Time</TableHead>
                <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Price Snapshot</TableHead>
                <TableHead className="text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Lifecycle Stage</TableHead>
                <TableHead className="text-right text-[11px] font-mono uppercase tracking-wider text-[#64748b]">Authoritative Action</TableHead>
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
                  <TableRow key={item.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]/80 transition-colors">
                    <TableCell className="font-mono font-bold text-[#090d16] text-xs">
                      {item.bookingReference}
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-xs text-[#090d16]">
                        {custName}
                      </div>
                      <div className="text-[10px] text-[#64748b] font-mono">
                        {item.customer?.user?.email}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-xs text-[#090d16]">
                        {serviceTitle}
                      </div>
                      <div className="text-[10px] text-[#64748b] flex items-center gap-1">
                        {item.deliveryType === 'SALON' ? (
                          <>
                            <Building2 className="w-3 h-3 text-[#64748b]" />
                            <span>Salon Atelier</span>
                          </>
                        ) : (
                          <>
                            <Home className="w-3 h-3 text-[#b45309]" />
                            <span className="text-[#b45309] font-medium">In-Home Specialist</span>
                          </>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-[#475569]">
                      <div>
                        {item.provider?.user
                          ? `${item.provider.user.firstName} ${item.provider.user.lastName}`
                          : item.salon?.name || 'Unassigned'}
                      </div>
                      {item.salon && item.provider && (
                        <div className="text-[10px] text-[#94a3b8]">{item.salon.name}</div>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-mono text-xs text-[#090d16]">
                        {appointmentDateStr}
                      </div>
                      <div className="text-[10px] text-[#64748b] font-mono">
                        {item.startTime} – {item.endTime}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono font-bold text-xs text-[#090d16]">
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
                            className="text-[11px] h-7 px-2.5 flex items-center gap-1 rounded-[3px]"
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
                            className="text-[11px] h-7 px-2 text-[#e11d48] hover:text-[#be123c] rounded-[3px]"
                            title="Mark No-Show"
                          >
                            <UserX className="w-3 h-3" />
                          </Button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedAuditBooking(item)}
                          className="p-1.5 rounded-[3px] hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#090d16] transition-colors border border-transparent hover:border-[#e2e8f0]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090d16]/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl bg-white border border-[#e2e8f0] rounded-[6px] shadow-2xl p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#090d16] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                  <span>State Transition Audit Trail</span>
                </h3>
                <p className="text-[11px] text-[#64748b] font-mono">
                  {selectedAuditBooking.bookingReference}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditBooking(null)}
                className="text-xs text-[#64748b] hover:text-[#090d16] px-2 py-1 rounded-[3px] border border-[#e2e8f0]"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {selectedAuditBooking.statusHistory && selectedAuditBooking.statusHistory.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-[#e2e8f0] space-y-5">
                  {selectedAuditBooking.statusHistory.map((log: any, idx: number) => (
                    <div key={log.id || idx} className="relative space-y-1">
                      <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#090d16] ring-4 ring-white" />
                      <div className="flex items-center gap-2">
                        <BookingStatusBadge status={log.toStatus} />
                        <span className="text-[10px] text-[#64748b] font-mono">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      {log.fromStatus && (
                        <p className="text-[11px] text-[#64748b]">
                          Transition: <span className="font-semibold text-[#090d16]">{log.fromStatus}</span> →{' '}
                          <span className="font-semibold text-[#090d16]">{log.toStatus}</span>
                        </p>
                      )}
                      {log.notes && (
                        <p className="text-xs text-[#090d16] bg-[#f8fafc] p-2 rounded-[3px] border border-[#e2e8f0]">
                          {log.notes}
                        </p>
                      )}
                      {log.reason && (
                        <p className="text-[11px] text-[#e11d48] italic">Reason: {log.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748b]">No transition history logged yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
