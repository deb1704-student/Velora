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
  EmptyState,
} from '@velora/ui';
import { CalendarDays, Filter } from 'lucide-react';
import { BookingStatus } from '@velora/types';

interface BookingMonitorItem {
  id: string;
  reference: string;
  customerName: string;
  serviceName: string;
  deliveryType: 'SALON' | 'HOME';
  providerOrSalon: string;
  appointmentDate: string;
  appointmentTime: string;
  totalAmount: number;
  status: BookingStatus;
}

const SAMPLE_BOOKINGS: BookingMonitorItem[] = [
  {
    id: 'b-01',
    reference: 'VEL-2026-1001',
    customerName: 'Aarav Mehta',
    serviceName: 'Precision Haircut & Blowdry',
    deliveryType: 'SALON',
    providerOrSalon: 'Aura Studio & Lounge',
    appointmentDate: '2026-10-04',
    appointmentTime: '11:00',
    totalAmount: 599,
    status: BookingStatus.CONFIRMED,
  },
  {
    id: 'b-02',
    reference: 'VEL-2026-1002',
    customerName: 'Sneha Rao',
    serviceName: 'Deep Hydrating Radiance Facial',
    deliveryType: 'HOME',
    providerOrSalon: 'Priya Mukherjee (Specialist)',
    appointmentDate: '2026-10-04',
    appointmentTime: '14:30',
    totalAmount: 1499,
    status: BookingStatus.PROVIDER_ACCEPTED,
  },
  {
    id: 'b-03',
    reference: 'VEL-2026-1003',
    customerName: 'Rohan Deshmukh',
    serviceName: 'Deluxe Spa Pedicure',
    deliveryType: 'SALON',
    providerOrSalon: 'Kroma Atelier',
    appointmentDate: '2026-10-03',
    appointmentTime: '16:00',
    totalAmount: 899,
    status: BookingStatus.SERVICE_COMPLETED,
  },
  {
    id: 'b-04',
    reference: 'VEL-2026-1004',
    customerName: 'Meera Iyer',
    serviceName: 'Full Body Aromatherapy Massage',
    deliveryType: 'HOME',
    providerOrSalon: 'Pending Assignment',
    appointmentDate: '2026-10-05',
    appointmentTime: '10:00',
    totalAmount: 2299,
    status: BookingStatus.PENDING_ASSIGNMENT,
  },
];

export default function BookingsMonitorPage() {
  const [selectedStatus, setSelectedStatus] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    return SAMPLE_BOOKINGS.filter((b) => {
      const matchesStatus =
        selectedStatus === 'ALL' || b.status === selectedStatus;
      const matchesSearch =
        b.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [selectedStatus, searchQuery]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Authoritative Booking Lifecycle Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of in-salon and home appointments across the 11 canonical workflow stages.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row gap-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex-1">
          <Input
            placeholder="Search by booking reference (e.g. VEL-2026), customer, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
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
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service & Mode</TableHead>
              <TableHead>Assigned Entity</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Lifecycle Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                  {item.reference}
                </TableCell>
                <TableCell>{item.customerName}</TableCell>
                <TableCell>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {item.serviceName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {item.deliveryType === 'SALON' ? 'Salon Appointment' : 'Home-Service Visit'}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-300">
                  {item.providerOrSalon}
                </TableCell>
                <TableCell>
                  <div className="font-mono text-slate-800 dark:text-slate-200">
                    {item.appointmentDate}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {item.appointmentTime}
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-slate-900 dark:text-white">
                  ₹{item.totalAmount.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={item.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    </div>
  );
}
