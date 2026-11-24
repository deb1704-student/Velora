
-- =========================================================
-- SALON SERVICE MANAGEMENT SYSTEM
-- Migration: 0002_rls_policies
-- SECTION 1: SECURITY HELPER FUNCTIONS
-- =========================================================

-- Get the application role of the currently logged-in user.
-- SECURITY DEFINER allows this function to read the role
-- without causing recursive RLS checks on user_profiles.

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.user_profiles
  WHERE id = (SELECT auth.uid())
  LIMIT 1;
$$;

-- Check whether the currently logged-in user is an administrator.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    public.current_app_role() = 'administrator'::public.app_role,
    FALSE
  );
$$;

-- Restrict helper-function execution to authenticated users.

REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- =========================================================
-- SECTION 2: USER PROFILE POLICIES (D1)
-- =========================================================

-- Users can view their own profile.
-- Administrators can view all user profiles.

CREATE POLICY "Users can view own profile or admin can view all"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  id = (SELECT auth.uid())
  OR (SELECT public.is_admin())
);


-- =========================================================
-- SECTION 3: CUSTOMER PROFILE POLICIES (D2)
-- =========================================================

-- Customers can view their own customer profile.
-- Administrators can view all customer profiles.

CREATE POLICY "Customers can view own profile or admin can view all"
ON public.customer_profiles
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (SELECT public.is_admin())
);

-- Customers can update only their own permitted preference fields.
-- Loyalty and membership values are not client-editable.

CREATE POLICY "Customers can update own preferences"
ON public.customer_profiles
FOR UPDATE
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (SELECT public.is_admin())
)
WITH CHECK (
  user_id = (SELECT auth.uid())
  OR (SELECT public.is_admin())
);

-- Restrict which customer profile columns authenticated
-- clients are allowed to update.

REVOKE UPDATE ON public.customer_profiles
FROM anon, authenticated;

GRANT UPDATE (
  preferences,
  favourite_service_ids,
  favourite_provider_ids
)
ON public.customer_profiles
TO authenticated;

-- Allow authenticated users to read permitted profile records.

GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.customer_profiles TO authenticated;


-- =========================================================
-- SECTION 4: PROVIDER PROFILE POLICIES (D3)
-- =========================================================

-- Providers can view their own profile.
-- Administrators can view all provider profiles.

CREATE POLICY "Providers can view own profile or admin can view all"
ON public.provider_profiles
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (SELECT public.is_admin())
);

-- Providers can update only their professional information.
-- KYC, status, rating and earnings remain protected.

CREATE POLICY "Providers can update own professional details"
ON public.provider_profiles
FOR UPDATE
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  AND (SELECT public.current_app_role()) = 'provider'::public.app_role
)
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND (SELECT public.current_app_role()) = 'provider'::public.app_role
);

REVOKE UPDATE ON public.provider_profiles
FROM anon, authenticated;

GRANT UPDATE (
  skills,
  experience_years,
  service_radius_km
)
ON public.provider_profiles
TO authenticated;

GRANT SELECT ON public.provider_profiles TO authenticated;


-- =========================================================
-- SECTION 5: SALON POLICIES (D4)
-- =========================================================

-- Salon owners can view their own salon.
-- Administrators can view all salons.

CREATE POLICY "Salon owners can view own salon or admin can view all"
ON public.salons
FOR SELECT
TO authenticated
USING (
  owner_user_id = (SELECT auth.uid())
  OR (SELECT public.is_admin())
);

-- Salon owners can update their own business information.
-- Verification and approval status are not client-editable.

CREATE POLICY "Salon owners can update own salon details"
ON public.salons
FOR UPDATE
TO authenticated
USING (
  owner_user_id = (SELECT auth.uid())
  AND (SELECT public.current_app_role()) = 'salon'::public.app_role
)
WITH CHECK (
  owner_user_id = (SELECT auth.uid())
  AND (SELECT public.current_app_role()) = 'salon'::public.app_role
);

REVOKE UPDATE ON public.salons
FROM anon, authenticated;

GRANT UPDATE (
  business_name,
  operating_hours,
  holidays,
  capacity,
  staff_information
)
ON public.salons
TO authenticated;

GRANT SELECT ON public.salons TO authenticated;


-- =========================================================
-- SECTION 6: PUBLIC SERVICE CATALOG POLICIES (D5)
-- =========================================================

-- Anyone can view active service categories.

CREATE POLICY "Anyone can view active service categories"
ON public.service_categories
FOR SELECT
TO anon, authenticated
USING (is_active = TRUE);

-- Anyone can view active subcategories.

CREATE POLICY "Anyone can view active service subcategories"
ON public.service_subcategories
FOR SELECT
TO anon, authenticated
USING (is_active = TRUE);

-- Anyone can view active services.

CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
TO anon, authenticated
USING (service_status = 'active');

-- Salon owners can view and manage their own salon service listings.

CREATE POLICY "Salon owners can view own salon services"
ON public.salon_services
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = salon_services.salon_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

CREATE POLICY "Salon owners can add own salon services"
ON public.salon_services
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = salon_services.salon_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  AND (SELECT public.current_app_role()) = 'salon'::public.app_role
);

CREATE POLICY "Salon owners can update own salon services"
ON public.salon_services
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = salon_services.salon_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  AND (SELECT public.current_app_role()) = 'salon'::public.app_role
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = salon_services.salon_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  AND (SELECT public.current_app_role()) = 'salon'::public.app_role
);

GRANT SELECT ON public.service_categories,
  public.service_subcategories,
  public.services
TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.salon_services
TO authenticated;


-- =========================================================
-- PROVIDER SERVICE ASSIGNMENT POLICIES
-- =========================================================

CREATE POLICY "Providers can view own service assignments"
ON public.provider_services
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.provider_profiles p
    WHERE p.id = provider_services.provider_id
      AND p.user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

CREATE POLICY "Providers can add own service assignments"
ON public.provider_services
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.provider_profiles p
    WHERE p.id = provider_services.provider_id
      AND p.user_id = (SELECT auth.uid())
  )
  AND (SELECT public.current_app_role()) = 'provider'::public.app_role
);

GRANT SELECT, INSERT ON public.provider_services TO authenticated;


-- =========================================================
-- SECTION 7: AVAILABILITY POLICIES (D6)
-- =========================================================

-- Providers can view their own availability.
-- Salon owners can view availability for their salons.
-- Administrators can view all availability.

CREATE POLICY "Authorized users can view availability"
ON public.availability
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles p
    WHERE p.id = availability.provider_id
      AND p.user_id = (SELECT auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = availability.salon_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

-- Providers can manage their own availability.

CREATE POLICY "Providers can insert own availability"
ON public.availability
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.provider_profiles p
    WHERE p.id = availability.provider_id
      AND p.user_id = (SELECT auth.uid())
  )
  AND (SELECT public.current_app_role()) = 'provider'::public.app_role
);

CREATE POLICY "Providers can update own availability"
ON public.availability
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles p
    WHERE p.id = availability.provider_id
      AND p.user_id = (SELECT auth.uid())
  )
  AND (SELECT public.current_app_role()) = 'provider'::public.app_role
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.provider_profiles p
    WHERE p.id = availability.provider_id
      AND p.user_id = (SELECT auth.uid())
  )
  AND (SELECT public.current_app_role()) = 'provider'::public.app_role
);

GRANT SELECT, INSERT, UPDATE ON public.availability
TO authenticated;


-- =========================================================
-- SECTION 8: BOOKING POLICIES (D7)
-- =========================================================

-- Customers, assigned providers, salon owners and administrators
-- can view relevant bookings.

CREATE POLICY "Participants can view relevant bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customer_profiles c
    WHERE c.id = bookings.customer_id
      AND c.user_id = (SELECT auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.provider_profiles p
    WHERE p.id = bookings.provider_id
      AND p.user_id = (SELECT auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM public.salons s
    WHERE s.id = bookings.salon_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

-- Booking creation is intentionally not granted to browser clients.
-- Create bookings through a server-side route or validated database function.

GRANT SELECT ON public.bookings TO authenticated;


-- =========================================================
-- SECTION 9: PAYMENT POLICIES (D8)
-- =========================================================

-- Customers can view their own payment records.
-- Administrators can view all payment records.

CREATE POLICY "Customers can view own payments or admin can view all"
ON public.payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customer_profiles c
    WHERE c.id = payments.customer_id
      AND c.user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

GRANT SELECT ON public.payments TO authenticated;


-- =========================================================
-- SECTION 10: SETTLEMENT POLICIES (D9)
-- =========================================================

-- Providers can view their own settlements.
-- Salon owners can view their salon settlements.
-- Administrators can view all settlements.

CREATE POLICY "Authorized users can view settlements"
ON public.settlements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.provider_profiles p
    WHERE p.id = settlements.provider_id
      AND p.user_id = (SELECT auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM public.salons s
    WHERE s.id = settlements.salon_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

GRANT SELECT ON public.settlements TO authenticated;


-- =========================================================
-- SECTION 11: REVIEW POLICIES (D10)
-- =========================================================

-- Anyone can view published reviews.

CREATE POLICY "Anyone can view published reviews"
ON public.reviews
FOR SELECT
TO anon, authenticated
USING (
  review_status = 'published'
);

-- Review insertion is intentionally not granted to browser clients.
-- Add a validated server-side operation that checks booking ownership and completion.

-- Customers can view their own reviews.
-- Administrators can view all reviews.

CREATE POLICY "Customers can view own reviews or admin can view all"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customer_profiles c
    WHERE c.id = reviews.customer_id
      AND c.user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

GRANT SELECT ON public.reviews TO anon, authenticated;


-- =========================================================
-- SECTION 12: NOTIFICATION POLICIES (D11)
-- =========================================================

-- Users can view their own notifications.

CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (SELECT public.is_admin())
);

-- Notifications are read-only to browser clients.
-- delivery_status is an operational field and must be updated server-side.

REVOKE UPDATE ON public.notifications FROM anon, authenticated;
GRANT SELECT ON public.notifications TO authenticated;


-- =========================================================
-- SECTION 13: COUPON AND PROMOTION POLICIES (D12)
-- =========================================================

-- Users can view active coupons.

CREATE POLICY "Users can view active coupons"
ON public.coupons
FOR SELECT
TO anon, authenticated
USING (
  coupon_status = 'active'
  AND valid_from <= NOW()
  AND valid_to > NOW()
);

-- Users can view active campaigns.

CREATE POLICY "Users can view active campaigns"
ON public.promotion_campaigns
FOR SELECT
TO anon, authenticated
USING (
  campaign_status = 'active'
  AND start_date <= NOW()
  AND end_date > NOW()
);

GRANT SELECT ON public.coupons,
  public.promotion_campaigns
TO anon, authenticated;


-- =========================================================
-- SECTION 14: MEMBERSHIP POLICIES (D13)
-- =========================================================

-- Anyone can view active membership plans.

CREATE POLICY "Anyone can view active membership plans"
ON public.membership_plans
FOR SELECT
TO anon, authenticated
USING (is_active = TRUE);

-- Customers can view their own memberships.

CREATE POLICY "Customers can view own memberships"
ON public.memberships
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customer_profiles c
    WHERE c.id = memberships.customer_id
      AND c.user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

GRANT SELECT ON public.membership_plans TO anon, authenticated;
GRANT SELECT ON public.memberships TO authenticated;


-- =========================================================
-- SECTION 15: LOYALTY POLICIES (D14)
-- =========================================================

-- Customers can view their own loyalty transactions.

CREATE POLICY "Customers can view own loyalty transactions"
ON public.loyalty_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.customer_profiles c
    WHERE c.id = loyalty_transactions.customer_id
      AND c.user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

GRANT SELECT ON public.loyalty_transactions TO authenticated;


-- =========================================================
-- SECTION 16: SUPPORT TICKET POLICIES (D15)
-- =========================================================

-- Users can view their own support tickets.
-- Administrators can view all tickets.

CREATE POLICY "Users can view own support tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR (SELECT public.is_admin())
);

-- Authenticated users can create tickets for themselves.

CREATE POLICY "Users can create own support tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
);

GRANT SELECT ON public.support_tickets TO authenticated;
GRANT INSERT (user_id, issue_type, description)
ON public.support_tickets TO authenticated;


-- =========================================================
-- SECTION 17: INVENTORY POLICIES (D16)
-- =========================================================

-- Salon owners can view inventory belonging to their salons.
-- Administrators can view all inventory.

CREATE POLICY "Salon owners can view own inventory products"
ON public.inventory_products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.salons s
    WHERE s.id = inventory_products.salon_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

CREATE POLICY "Salon owners can view own inventory transactions"
ON public.inventory_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.inventory_products p
    JOIN public.salons s ON s.id = p.salon_id
    WHERE p.id = inventory_transactions.product_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

-- Salon owners can view inventory categories and suppliers
-- when authenticated.

CREATE POLICY "Authenticated users can view inventory categories"
ON public.inventory_categories
FOR SELECT
TO authenticated
USING (TRUE);

-- Supplier contact details are restricted to server-side/admin workflows.
-- Do not grant browser clients direct access to inventory_suppliers.

GRANT SELECT ON public.inventory_products,
  public.inventory_transactions,
  public.inventory_categories
TO authenticated;


-- =========================================================
-- SECTION 18: ADDRESS POLICIES (D17)
-- =========================================================

-- Users can view their own addresses.
-- Salon owners can view their salon addresses.
-- Administrators can view all addresses.

CREATE POLICY "Users can view authorized addresses"
ON public.addresses
FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.salons s
    WHERE s.id = addresses.salon_id
      AND s.owner_user_id = (SELECT auth.uid())
  )
  OR (SELECT public.is_admin())
);

-- Users can create personal addresses.

CREATE POLICY "Users can create own addresses"
ON public.addresses
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND salon_id IS NULL
);

-- Users can update their own personal addresses.

CREATE POLICY "Users can update own addresses"
ON public.addresses
FOR UPDATE
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  AND salon_id IS NULL
)
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND salon_id IS NULL
);

GRANT SELECT, INSERT, UPDATE ON public.addresses
TO authenticated;


-- =========================================================
-- SECTION 19: AUDIT LOG AND REPORT POLICIES (D18, D19)
-- =========================================================

-- Only administrators can read audit logs.

CREATE POLICY "Administrators can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  (SELECT public.is_admin())
);

-- Only administrators can read reports.

CREATE POLICY "Administrators can view reports"
ON public.reports
FOR SELECT
TO authenticated
USING (
  (SELECT public.is_admin())
);

GRANT SELECT ON public.audit_logs,
  public.reports
TO authenticated;
