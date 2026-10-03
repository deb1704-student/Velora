import * as React from 'react';
import { Badge, type BadgeProps } from './badge';
import { BookingStatus, PaymentStatus } from '@velora/types';

interface BookingStatusBadgeProps {
  status: BookingStatus | string;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  let variant: BadgeProps['variant'] = 'neutral';
  let label = String(status).replace(/_/g, ' ');

  switch (status) {
    case BookingStatus.REQUESTED:
      variant = 'neutral';
      label = 'Requested';
      break;
    case BookingStatus.PENDING_ASSIGNMENT:
      variant = 'warning';
      label = 'Pending Assignment';
      break;
    case BookingStatus.ASSIGNED:
      variant = 'warning';
      label = 'Assigned';
      break;
    case BookingStatus.PROVIDER_ACCEPTED:
      variant = 'success';
      label = 'Provider Accepted';
      break;
    case BookingStatus.CONFIRMED:
      variant = 'success';
      label = 'Confirmed';
      break;
    case BookingStatus.PROVIDER_EN_ROUTE:
      variant = 'warning';
      label = 'En Route';
      break;
    case BookingStatus.PROVIDER_ARRIVED:
      variant = 'neutral';
      label = 'Arrived';
      break;
    case BookingStatus.SERVICE_STARTED:
      variant = 'neutral';
      label = 'Service In Progress';
      break;
    case BookingStatus.SERVICE_COMPLETED:
      variant = 'success';
      label = 'Service Completed';
      break;
    case BookingStatus.PAYMENT_COMPLETED:
      variant = 'success';
      label = 'Payment Completed';
      break;
    case BookingStatus.CLOSED:
      variant = 'neutral';
      label = 'Closed';
      break;
    case BookingStatus.CANCELLED:
      variant = 'destructive';
      label = 'Cancelled';
      break;
    case BookingStatus.REJECTED:
      variant = 'destructive';
      label = 'Rejected';
      break;
    case BookingStatus.FAILED:
      variant = 'destructive';
      label = 'Failed';
      break;
    case BookingStatus.NO_SHOW:
      variant = 'destructive';
      label = 'No Show';
      break;
    case BookingStatus.RESCHEDULED:
      variant = 'warning';
      label = 'Rescheduled';
      break;
    case BookingStatus.DISPUTED:
      variant = 'destructive';
      label = 'Disputed';
      break;
    case BookingStatus.REFUNDED:
      variant = 'neutral';
      label = 'Refunded';
      break;
  }

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  let variant: BadgeProps['variant'] = 'neutral';
  let label = String(status).replace(/_/g, ' ');

  switch (status) {
    case PaymentStatus.PAYMENT_PENDING:
      variant = 'warning';
      label = 'Pending';
      break;
    case PaymentStatus.PAYMENT_INITIATED:
      variant = 'warning';
      label = 'Initiated';
      break;
    case PaymentStatus.AUTHORIZED:
      variant = 'neutral';
      label = 'Authorized';
      break;
    case PaymentStatus.SUCCESSFUL:
      variant = 'success';
      label = 'Successful';
      break;
    case PaymentStatus.FAILED:
      variant = 'destructive';
      label = 'Failed';
      break;
    case PaymentStatus.REFUND_REQUESTED:
      variant = 'warning';
      label = 'Refund Requested';
      break;
    case PaymentStatus.PARTIALLY_REFUNDED:
      variant = 'warning';
      label = 'Partially Refunded';
      break;
    case PaymentStatus.REFUNDED:
      variant = 'neutral';
      label = 'Refunded';
      break;
    case PaymentStatus.SETTLEMENT_PENDING:
      variant = 'warning';
      label = 'Settlement Pending';
      break;
    case PaymentStatus.SETTLED:
      variant = 'success';
      label = 'Settled';
      break;
  }

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
