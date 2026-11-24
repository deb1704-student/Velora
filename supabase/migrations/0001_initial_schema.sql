
-- =========================================================
-- SALON SERVICE MANAGEMENT SYSTEM
-- Migration: 0001_initial_schema
-- SRS Data Stores: D1, D2, D3, D4, D17
-- =========================================================

-- 1. Application roles (D1)
CREATE TYPE public.app_role AS ENUM (
  'customer',
  'provider',
  'salon',
  'administrator'
);

-- 2. User profiles (D1)
-- Authentication credentials are managed by Supabase Auth.
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  mobile_number TEXT UNIQUE,
  role public.app_role NOT NULL DEFAULT 'customer',
  account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'inactive', 'suspended', 'pending')),
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Customer profiles (D2)
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE
    REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  favourite_service_ids UUID[] NOT NULL DEFAULT '{}',
  favourite_provider_ids UUID[] NOT NULL DEFAULT '{}',
  preferred_address_id UUID,
  membership_id UUID,
  loyalty_balance INTEGER NOT NULL DEFAULT 0
    CHECK (loyalty_balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Provider profiles (D3)
CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE
    REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience_years NUMERIC(4,1) NOT NULL DEFAULT 0
    CHECK (experience_years >= 0),
  service_ids UUID[] NOT NULL DEFAULT '{}',
  kyc_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  provider_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (provider_status IN ('pending', 'active', 'inactive', 'suspended')),
  service_radius_km NUMERIC(6,2)
    CHECK (service_radius_km IS NULL OR service_radius_km >= 0),
  rating NUMERIC(3,2) NOT NULL DEFAULT 0
    CHECK (rating BETWEEN 0 AND 5),
  earnings NUMERIC(12,2) NOT NULL DEFAULT 0
    CHECK (earnings >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Salon records (D4)
CREATE TABLE public.salons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL
    REFERENCES public.user_profiles(id),
  business_name TEXT NOT NULL,
  operating_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  holidays JSONB NOT NULL DEFAULT '[]'::jsonb,
  capacity INTEGER NOT NULL DEFAULT 1
    CHECK (capacity > 0),
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  salon_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (salon_status IN ('pending', 'active', 'inactive', 'suspended')),
  staff_information JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Location and address records (D17)
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  address_line TEXT NOT NULL,
  locality TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address_type TEXT NOT NULL DEFAULT 'other',
  is_preferred BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT address_owner_required
    CHECK (user_id IS NOT NULL OR salon_id IS NOT NULL),

  CONSTRAINT valid_latitude
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),

  CONSTRAINT valid_longitude
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

-- Link customer preferred address to D17
ALTER TABLE public.customer_profiles
ADD CONSTRAINT customer_preferred_address_fk
FOREIGN KEY (preferred_address_id)
REFERENCES public.addresses(id)
ON DELETE SET NULL;

-- 7. Basic indexes
CREATE INDEX idx_user_profiles_role
  ON public.user_profiles(role);

CREATE INDEX idx_user_profiles_account_status
  ON public.user_profiles(account_status);

CREATE INDEX idx_provider_profiles_status
  ON public.provider_profiles(provider_status);

CREATE INDEX idx_salons_status
  ON public.salons(salon_status);

CREATE INDEX idx_addresses_user_id
  ON public.addresses(user_id);

CREATE INDEX idx_addresses_salon_id
  ON public.addresses(salon_id);



-- =========================================================
-- SRS DATA STORES: D5 - SERVICE CATALOG
--                  D6 - AVAILABILITY
-- =========================================================

-- 8. Service categories (D5)
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Service subcategories (D5)
CREATE TABLE public.service_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL
    REFERENCES public.service_categories(id) ON DELETE CASCADE,
  subcategory_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, subcategory_name)
);

-- 10. Salon service catalog (D5)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL
    REFERENCES public.service_categories(id),
  subcategory_id UUID
    REFERENCES public.service_subcategories(id),
  service_name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL
    CHECK (duration_minutes > 0),
  base_price NUMERIC(10,2) NOT NULL
    CHECK (base_price >= 0),
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  package_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  add_on_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  service_status TEXT NOT NULL DEFAULT 'active'
    CHECK (service_status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Services offered by salons
CREATE TABLE public.salon_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL
    REFERENCES public.salons(id) ON DELETE CASCADE,
  service_id UUID NOT NULL
    REFERENCES public.services(id) ON DELETE CASCADE,
  price NUMERIC(10,2)
    CHECK (price IS NULL OR price >= 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (salon_id, service_id)
);

-- 12. Services assigned to providers
CREATE TABLE public.provider_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL
    REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL
    REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider_id, service_id)
);

-- 13. Provider availability schedules (D6)
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL
    REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  salon_id UUID
    REFERENCES public.salons(id) ON DELETE CASCADE,
  availability_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  breaks JSONB NOT NULL DEFAULT '[]'::jsonb,
  holiday_flag BOOLEAN NOT NULL DEFAULT FALSE,
  slot_status TEXT NOT NULL DEFAULT 'available'
    CHECK (slot_status IN ('available', 'unavailable', 'booked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_availability_time
    CHECK (end_time > start_time)
);

-- 14. Indexes for D5 and D6
CREATE INDEX idx_services_category
  ON public.services(category_id);

CREATE INDEX idx_services_status
  ON public.services(service_status);

CREATE INDEX idx_salon_services_salon
  ON public.salon_services(salon_id);

CREATE INDEX idx_provider_services_provider
  ON public.provider_services(provider_id);

CREATE INDEX idx_availability_provider_date
  ON public.availability(provider_id, availability_date);

CREATE INDEX idx_availability_salon_date
  ON public.availability(salon_id, availability_date);

CREATE INDEX idx_availability_status
  ON public.availability(slot_status);


-- =========================================================
-- SRS DATA STORE: D7 - BOOKING DATA
-- =========================================================

-- 15. Customer bookings (D7)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id UUID NOT NULL
    REFERENCES public.customer_profiles(id),

  service_id UUID NOT NULL
    REFERENCES public.services(id),

  provider_id UUID NOT NULL
    REFERENCES public.provider_profiles(id),

  salon_id UUID
    REFERENCES public.salons(id),

  address_id UUID
    REFERENCES public.addresses(id),

  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  base_amount NUMERIC(10,2) NOT NULL
    CHECK (base_amount >= 0),

  discount NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (discount >= 0),

  tax NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (tax >= 0),

  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (platform_fee >= 0),

  total_amount NUMERIC(10,2) NOT NULL
    CHECK (total_amount >= 0),

  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      payment_status IN (
        'pending',
        'paid',
        'failed',
        'refunded',
        'partially_refunded'
      )
    ),

  booking_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      booking_status IN (
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'rejected',
        'no_show'
      )
    ),

  cancellation_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_booking_time
    CHECK (end_time > start_time),

  CONSTRAINT valid_booking_amounts
    CHECK (total_amount = base_amount - discount + tax + platform_fee)
);

-- 16. Indexes for booking searches
CREATE INDEX idx_bookings_customer
  ON public.bookings(customer_id);

CREATE INDEX idx_bookings_provider_date
  ON public.bookings(provider_id, appointment_date);

CREATE INDEX idx_bookings_salon_date
  ON public.bookings(salon_id, appointment_date);

CREATE INDEX idx_bookings_status
  ON public.bookings(booking_status);

CREATE INDEX idx_bookings_payment_status
  ON public.bookings(payment_status);

CREATE INDEX idx_bookings_appointment_date
  ON public.bookings(appointment_date);


-- =========================================================
-- SRS DATA STORES: D8 - PAYMENT DATA
--                  D9 - FINANCIAL / SETTLEMENT DATA
-- =========================================================

-- 17. Payment transactions (D8)
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  booking_id UUID NOT NULL
    REFERENCES public.bookings(id),

  customer_id UUID NOT NULL
    REFERENCES public.customer_profiles(id),

  amount NUMERIC(10,2) NOT NULL
    CHECK (amount >= 0),

  payment_method TEXT NOT NULL
    CHECK (
      payment_method IN (
        'card',
        'upi',
        'net_banking',
        'wallet',
        'cash',
        'other'
      )
    ),

  transaction_id TEXT UNIQUE,

  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      payment_status IN (
        'pending',
        'successful',
        'failed',
        'cancelled'
      )
    ),

  refund_status TEXT NOT NULL DEFAULT 'not_applicable'
    CHECK (
      refund_status IN (
        'not_applicable',
        'pending',
        'processed',
        'failed',
        'partially_refunded'
      )
    ),

  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Financial settlements and provider payouts (D9)
CREATE TABLE public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  provider_id UUID NOT NULL
    REFERENCES public.provider_profiles(id),

  salon_id UUID
    REFERENCES public.salons(id),

  booking_id UUID NOT NULL
    REFERENCES public.bookings(id),

  gross_amount NUMERIC(10,2) NOT NULL
    CHECK (gross_amount >= 0),

  commission NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (commission >= 0),

  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (platform_fee >= 0),

  adjustments NUMERIC(10,2) NOT NULL DEFAULT 0,

  net_amount NUMERIC(10,2) NOT NULL,

  settlement_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      settlement_status IN (
        'pending',
        'processing',
        'paid',
        'failed',
        'on_hold'
      )
    ),

  payout_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_settlement_amount
    CHECK (
      net_amount = gross_amount - commission - platform_fee + adjustments
    )
);

-- 19. Indexes for D8 and D9
CREATE INDEX idx_payments_booking
  ON public.payments(booking_id);

CREATE INDEX idx_payments_customer
  ON public.payments(customer_id);

CREATE INDEX idx_payments_status
  ON public.payments(payment_status);

CREATE INDEX idx_payments_transaction_date
  ON public.payments(transaction_date);

CREATE INDEX idx_settlements_provider
  ON public.settlements(provider_id);

CREATE INDEX idx_settlements_salon
  ON public.settlements(salon_id);

CREATE INDEX idx_settlements_status
  ON public.settlements(settlement_status);

CREATE INDEX idx_settlements_payout_date
  ON public.settlements(payout_date);


-- =========================================================
-- SRS DATA STORES: D10 - REVIEW & FEEDBACK DATA
--                  D11 - NOTIFICATION DATA
-- =========================================================

-- 20. Customer reviews and feedback (D10)
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  booking_id UUID NOT NULL
    REFERENCES public.bookings(id),

  customer_id UUID NOT NULL
    REFERENCES public.customer_profiles(id),

  provider_id UUID
    REFERENCES public.provider_profiles(id),

  salon_id UUID
    REFERENCES public.salons(id),

  service_id UUID NOT NULL
    REFERENCES public.services(id),

  rating INTEGER NOT NULL
    CHECK (rating BETWEEN 1 AND 5),

  review_text TEXT,

  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      review_status IN (
        'pending',
        'published',
        'rejected',
        'hidden'
      )
    ),

  review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (booking_id, customer_id)
);

-- 21. User notifications (D11)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  notification_type TEXT NOT NULL,

  related_booking_id UUID
    REFERENCES public.bookings(id) ON DELETE SET NULL,

  related_transaction_id UUID,

  message TEXT NOT NULL,

  channel TEXT NOT NULL DEFAULT 'in_app'
    CHECK (
      channel IN (
        'in_app',
        'email',
        'sms',
        'push'
      )
    ),

  delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      delivery_status IN (
        'pending',
        'sent',
        'delivered',
        'failed',
        'read'
      )
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. Indexes for D10 and D11
CREATE INDEX idx_reviews_booking
  ON public.reviews(booking_id);

CREATE INDEX idx_reviews_provider
  ON public.reviews(provider_id);

CREATE INDEX idx_reviews_salon
  ON public.reviews(salon_id);

CREATE INDEX idx_reviews_status
  ON public.reviews(review_status);

CREATE INDEX idx_notifications_user
  ON public.notifications(user_id);

CREATE INDEX idx_notifications_status
  ON public.notifications(delivery_status);

CREATE INDEX idx_notifications_created
  ON public.notifications(created_at DESC);


-- =========================================================
-- SRS DATA STORES: D12 - COUPON & PROMOTION DATA
--                  D13 - MEMBERSHIP DATA
-- =========================================================

-- 23. Promotional campaigns (D12)
CREATE TABLE public.promotion_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  campaign_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (
      campaign_status IN (
        'draft',
        'active',
        'paused',
        'completed',
        'cancelled'
      )
    ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_campaign_dates
    CHECK (end_date > start_date)
);

-- 24. Coupons and promotion rules (D12)
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  campaign_id UUID
    REFERENCES public.promotion_campaigns(id) ON DELETE SET NULL,

  code TEXT NOT NULL UNIQUE,

  discount_type TEXT NOT NULL
    CHECK (discount_type IN ('percentage', 'fixed')),

  discount_value NUMERIC(10,2) NOT NULL
    CHECK (discount_value > 0),

  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ NOT NULL,

  usage_limit INTEGER
    CHECK (usage_limit IS NULL OR usage_limit > 0),

  eligibility_rules JSONB NOT NULL DEFAULT '{}'::jsonb,

  usage_count INTEGER NOT NULL DEFAULT 0
    CHECK (usage_count >= 0),

  coupon_status TEXT NOT NULL DEFAULT 'active'
    CHECK (
      coupon_status IN ('active', 'inactive', 'expired')
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_coupon_dates
    CHECK (valid_to > valid_from)
);

-- 25. Membership plans (D13)
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  plan_name TEXT NOT NULL UNIQUE,

  description TEXT,

  price NUMERIC(10,2) NOT NULL
    CHECK (price >= 0),

  duration_days INTEGER NOT NULL
    CHECK (duration_days > 0),

  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. Customer membership subscriptions (D13)
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  plan_id UUID NOT NULL
    REFERENCES public.membership_plans(id),

  customer_id UUID NOT NULL
    REFERENCES public.customer_profiles(id),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,

  subscription_status TEXT NOT NULL DEFAULT 'active'
    CHECK (
      subscription_status IN (
        'active',
        'expired',
        'cancelled',
        'pending'
      )
    ),

  renewal_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_membership_dates
    CHECK (end_date >= start_date)
);

-- 27. Connect customer profiles to membership records
ALTER TABLE public.customer_profiles
ADD CONSTRAINT customer_membership_fk
FOREIGN KEY (membership_id)
REFERENCES public.memberships(id)
ON DELETE SET NULL;

-- 28. Indexes for D12 and D13
CREATE INDEX idx_campaigns_status
  ON public.promotion_campaigns(campaign_status);

CREATE INDEX idx_coupons_code
  ON public.coupons(code);

CREATE INDEX idx_coupons_campaign
  ON public.coupons(campaign_id);

CREATE INDEX idx_coupons_status
  ON public.coupons(coupon_status);

CREATE INDEX idx_memberships_customer
  ON public.memberships(customer_id);

CREATE INDEX idx_memberships_plan
  ON public.memberships(plan_id);

CREATE INDEX idx_memberships_status
  ON public.memberships(subscription_status);


-- =========================================================
-- SRS DATA STORES: D14 - LOYALTY & REFERRAL DATA
--                  D15 - SUPPORT & DISPUTE DATA
-- =========================================================

-- 29. Loyalty and referral transactions (D14)
CREATE TABLE public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_id UUID NOT NULL
    REFERENCES public.customer_profiles(id),

  booking_id UUID
    REFERENCES public.bookings(id) ON DELETE SET NULL,

  points_earned INTEGER NOT NULL DEFAULT 0
    CHECK (points_earned >= 0),

  points_redeemed INTEGER NOT NULL DEFAULT 0
    CHECK (points_redeemed >= 0),

  points_expired INTEGER NOT NULL DEFAULT 0
    CHECK (points_expired >= 0),

  referral_code TEXT,

  referred_customer_id UUID
    REFERENCES public.customer_profiles(id) ON DELETE SET NULL,

  reward_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      reward_status IN (
        'pending',
        'earned',
        'redeemed',
        'expired',
        'cancelled'
      )
    ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 30. Support and dispute tickets (D15)
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES public.user_profiles(id),

  booking_id UUID
    REFERENCES public.bookings(id) ON DELETE SET NULL,

  payment_id UUID
    REFERENCES public.payments(id) ON DELETE SET NULL,

  issue_type TEXT NOT NULL,

  description TEXT NOT NULL,

  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (
      priority IN ('low', 'medium', 'high', 'urgent')
    ),

  assigned_to UUID
    REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  ticket_status TEXT NOT NULL DEFAULT 'open'
    CHECK (
      ticket_status IN (
        'open',
        'in_progress',
        'waiting_for_user',
        'resolved',
        'closed',
        'escalated'
      )
    ),

  resolution TEXT,

  escalation BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  closed_at TIMESTAMPTZ
);

-- 31. Indexes for D14 and D15
CREATE INDEX idx_loyalty_customer
  ON public.loyalty_transactions(customer_id);

CREATE INDEX idx_loyalty_booking
  ON public.loyalty_transactions(booking_id);

CREATE INDEX idx_loyalty_referral_code
  ON public.loyalty_transactions(referral_code);

CREATE INDEX idx_support_user
  ON public.support_tickets(user_id);

CREATE INDEX idx_support_status
  ON public.support_tickets(ticket_status);

CREATE INDEX idx_support_priority
  ON public.support_tickets(priority);

CREATE INDEX idx_support_assigned_to
  ON public.support_tickets(assigned_to);

CREATE INDEX idx_support_created
  ON public.support_tickets(created_at DESC);


-- =========================================================
-- SRS DATA STORES: D16 - INVENTORY DATA
--                  D17 - LOCATION / ADDRESS DATA
-- =========================================================

-- 32. Inventory categories (D16)
CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  category_name TEXT NOT NULL UNIQUE,

  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 33. Inventory suppliers (D16)
CREATE TABLE public.inventory_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  supplier_name TEXT NOT NULL,

  contact_person TEXT,

  phone TEXT,

  email TEXT,

  address TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 34. Salon inventory products (D16)
CREATE TABLE public.inventory_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  salon_id UUID NOT NULL
    REFERENCES public.salons(id) ON DELETE CASCADE,

  category_id UUID
    REFERENCES public.inventory_categories(id) ON DELETE SET NULL,

  supplier_id UUID
    REFERENCES public.inventory_suppliers(id) ON DELETE SET NULL,

  product_name TEXT NOT NULL,

  quantity INTEGER NOT NULL DEFAULT 0
    CHECK (quantity >= 0),

  reorder_level INTEGER NOT NULL DEFAULT 0
    CHECK (reorder_level >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 35. Inventory stock transactions (D16)
CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL
    REFERENCES public.inventory_products(id) ON DELETE CASCADE,

  transaction_type TEXT NOT NULL
    CHECK (
      transaction_type IN (
        'stock_in',
        'stock_out',
        'adjustment'
      )
    ),

  quantity INTEGER NOT NULL
    CHECK (quantity > 0),

  adjustment_reason TEXT,

  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 36. Indexes for D16 and D17
CREATE INDEX idx_inventory_products_salon
  ON public.inventory_products(salon_id);

CREATE INDEX idx_inventory_products_category
  ON public.inventory_products(category_id);

CREATE INDEX idx_inventory_products_supplier
  ON public.inventory_products(supplier_id);

CREATE INDEX idx_inventory_transactions_product
  ON public.inventory_transactions(product_id);

CREATE INDEX idx_inventory_transactions_date
  ON public.inventory_transactions(transaction_date);

CREATE INDEX idx_addresses_city
  ON public.addresses(city);

CREATE INDEX idx_addresses_postal_code
  ON public.addresses(postal_code);


-- =========================================================
-- SRS DATA STORES: D18 - AUDIT LOG DATA
--                  D19 - REPORT / ANALYTICS DATA
-- =========================================================

-- 37. System audit logs (D18)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  actor_id UUID
    REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  action_type TEXT NOT NULL,

  entity_type TEXT NOT NULL,

  entity_id UUID,

  previous_value JSONB,

  new_value JSONB,

  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  result TEXT NOT NULL DEFAULT 'success'
    CHECK (
      result IN ('success', 'failure')
    )
);

-- 38. Generated reports and analytics (D19)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  report_type TEXT NOT NULL,

  date_range JSONB NOT NULL DEFAULT '{}'::jsonb,

  filters JSONB NOT NULL DEFAULT '{}'::jsonb,

  generated_by UUID
    REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  summary_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  report_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (
      report_status IN (
        'pending',
        'processing',
        'completed',
        'failed'
      )
    ),

  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 39. Indexes for D18 and D19
CREATE INDEX idx_audit_logs_actor
  ON public.audit_logs(actor_id);

CREATE INDEX idx_audit_logs_entity
  ON public.audit_logs(entity_type, entity_id);

CREATE INDEX idx_audit_logs_timestamp
  ON public.audit_logs(event_timestamp DESC);

CREATE INDEX idx_audit_logs_action
  ON public.audit_logs(action_type);

CREATE INDEX idx_reports_type
  ON public.reports(report_type);

CREATE INDEX idx_reports_generated_by
  ON public.reports(generated_by);

CREATE INDEX idx_reports_status
  ON public.reports(report_status);

CREATE INDEX idx_reports_generated_at
  ON public.reports(generated_at DESC);


-- =========================================================
-- AUTHENTICATION INTEGRATION
-- Automatically create application profiles after signup
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    email,
    mobile_number,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      'New User'
    ),
    NEW.email,
    NEW.phone,
    'customer'
  );

  INSERT INTO public.customer_profiles (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- =========================================================
-- DATABASE SECURITY: ENABLE ROW LEVEL SECURITY
-- Apply to every table in the public schema
-- =========================================================

DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',
      table_record.tablename
    );
  END LOOP;
END;
$$;



