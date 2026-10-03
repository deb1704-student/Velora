/**
 * Velora System Common Types and Domain Models
 * Traceable directly to the Comprehensive Functional Requirements Specification (D1 - D19).
 */

// ==========================================
// 1. IDENTITY, ROLES & ACCESS (D1)
// ==========================================

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  SALON_OWNER = 'SALON_OWNER',
  SALON_MANAGER = 'SALON_MANAGER',
  SALON_STAFF = 'SALON_STAFF',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DEACTIVATED = 'DEACTIVATED',
}

export interface UserSummary {
  id: string;
  email: string;
  phoneNumber?: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. CUSTOMER DOMAIN (D2)
// ==========================================

export interface CustomerProfile {
  id: string;
  userId: string;
  user: UserSummary;
  dateOfBirth?: string | null;
  gender?: string | null;
  preferredLanguage?: string | null;
  walletBalance: number;
  loyaltyPoints: number;
  activeMembershipId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. PROVIDER & SPECIALIST DOMAIN (D3)
// ==========================================

export enum ProviderVerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ProviderProfile {
  id: string;
  userId: string;
  user: UserSummary;
  salonId?: string | null;
  bio?: string | null;
  experienceYears: number;
  ratingAverage: number;
  ratingCount: number;
  verificationStatus: ProviderVerificationStatus;
  rejectionReason?: string | null;
  serviceRadiusKm: number;
  isHomeServiceAvailable: boolean;
  isSalonServiceAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. SALON MANAGEMENT DOMAIN (D4)
// ==========================================

export enum SalonVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface Salon {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description?: string | null;
  addressId: string;
  phoneNumber: string;
  email: string;
  verificationStatus: SalonVerificationStatus;
  isActive: boolean;
  capacity: number;
  openingTime: string; // HH:mm format
  closingTime: string; // HH:mm format
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. SERVICE CATALOG (D5)
// ==========================================

export enum ServiceDeliveryType {
  SALON = 'SALON',
  HOME = 'HOME',
  BOTH = 'BOTH',
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  durationMinutes: number;
  basePrice: number; // Stored in smallest currency unit / cents / paise
  currency: string;
  deliveryType: ServiceDeliveryType;
  isActive: boolean;
  requirements?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAddon {
  id: string;
  serviceId: string;
  name: string;
  description?: string | null;
  extraDurationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  discountPercentage?: number | null;
  durationMinutes: number;
  imageUrl?: string | null;
  isActive: boolean;
  items?: ServicePackageItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackageItem {
  id: string;
  packageId: string;
  serviceId: string;
  sortOrder: number;
  service?: ServiceItem;
}

export interface SalonService {
  id: string;
  salonId: string;
  serviceId: string;
  customPrice?: number | null;
  customDuration?: number | null;
  isActive: boolean;
  createdAt: string;
  service?: ServiceItem;
}

export interface ProviderService {
  id: string;
  providerId: string;
  serviceId: string;
  isCertified: boolean;
  createdAt: string;
  service?: ServiceItem;
}

export interface BookingAddon {
  id: string;
  bookingId: string;
  addonId: string;
  price: number;
  addon?: ServiceAddon;
}

// ==========================================
// 6. AVAILABILITY & SCHEDULING (D6)
// ==========================================

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface ProviderSchedule {
  id: string;
  providerId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  isActive: boolean;
}

export interface TimeSlot {
  startTime: string; // ISO 8601 or HH:mm
  endTime: string;   // ISO 8601 or HH:mm
  isAvailable: boolean;
  providerId?: string;
  salonId?: string;
}

export interface ProviderTimeOff {
  id: string;
  providerId: string;
  startDate: string;
  endDate: string;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
  createdAt: string;
}

export interface AvailableSlot {
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  providerId?: string;
  providerName?: string;
  salonId?: string;
  salonName?: string;
  deliveryType: ServiceDeliveryType;
  availableChairs?: number;
}

// ==========================================
// 7. BOOKING LIFECYCLE & STATE MACHINE (D7)
// ==========================================

export enum BookingStatus {
  REQUESTED = 'REQUESTED',
  PENDING_ASSIGNMENT = 'PENDING_ASSIGNMENT',
  ASSIGNED = 'ASSIGNED',
  PROVIDER_ACCEPTED = 'PROVIDER_ACCEPTED',
  CONFIRMED = 'CONFIRMED',
  PROVIDER_EN_ROUTE = 'PROVIDER_EN_ROUTE',
  PROVIDER_ARRIVED = 'PROVIDER_ARRIVED',
  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  CLOSED = 'CLOSED',
  // Terminal / Exception States
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
}

export interface Booking {
  id: string;
  bookingReference: string;
  customerId: string;
  serviceId?: string | null;
  packageId?: string | null;
  salonId?: string | null;
  providerId?: string | null;
  deliveryType: ServiceDeliveryType;
  addressId?: string | null;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: BookingStatus;
  baseAmount: number;
  addonsAmount: number;
  discountAmount: number;
  taxAmount: number;
  platformFee: number;
  totalAmount: number;
  currency: string;
  cancellationReason?: string | null;
  customerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  service?: ServiceItem | null;
  package?: ServicePackage | null;
  salon?: Salon | null;
  provider?: ProviderProfile | null;
  customer?: CustomerProfile | null;
  address?: Address | null;
  selectedAddons?: BookingAddon[];
  statusHistory?: BookingStatusLog[];
}

export interface BookingStatusLog {
  id: string;
  bookingId: string;
  fromStatus?: BookingStatus | null;
  toStatus: BookingStatus;
  changedBy?: string | null;
  notes?: string | null;
  reason?: string | null;
  metadata?: any | null;
  createdAt: string;
}

// ==========================================
// 8. PAYMENT & FINANCIAL LIFECYCLE (D8, D9)
// ==========================================

export enum PaymentStatus {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  AUTHORIZED = 'AUTHORIZED',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  REFUNDED = 'REFUNDED',
  SETTLEMENT_PENDING = 'SETTLEMENT_PENDING',
  SETTLED = 'SETTLED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  ONLINE_BANKING = 'ONLINE_BANKING',
  UPI = 'UPI',
  WALLET = 'WALLET',
  CASH = 'CASH',
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayTransactionId?: string | null;
  gatewayResponse?: Record<string, unknown> | null;
  refundedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderSettlement {
  id: string;
  providerId?: string | null;
  salonId?: string | null;
  bookingId: string;
  grossAmount: number;
  platformCommission: number;
  taxDeducted: number;
  netPayoutAmount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  settledAt?: string | null;
  createdAt: string;
}

// ==========================================
// 9. REVIEWS & RATINGS (D10)
// ==========================================

export enum ReviewModerationStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId?: string | null;
  salonId?: string | null;
  serviceId: string;
  rating: number; // 1 to 5
  comment: string;
  moderationStatus: ReviewModerationStatus;
  providerResponse?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 10. NOTIFICATIONS (D11)
// ==========================================

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  isRead: boolean;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  createdAt: string;
}

// ==========================================
// 11. PROMOTIONS, MEMBERSHIPS & LOYALTY (D12, D13, D14)
// ==========================================

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minBookingAmount?: number | null;
  maxDiscountAmount?: number | null;
  validFrom: string;
  validTo: string;
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
}

// ==========================================
// 12. SUPPORT & DISPUTES (D15)
// ==========================================

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  bookingId?: string | null;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: DisputeStatus;
  resolutionNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 13. LOCATION & ADDRESS (D17)
// ==========================================

export interface Address {
  id: string;
  userId?: string | null;
  salonId?: string | null;
  label?: string | null; // 'Home', 'Work', 'Main Branch'
  streetLine1: string;
  streetLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

// ==========================================
// 14. API COMMON RESPONSE STRUCTURES
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
