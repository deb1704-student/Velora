-- =========================================================
-- SALON SERVICE MANAGEMENT SYSTEM
-- Migration: 0003_booking_enhancements.sql
-- 1. Seed Categories and Services
-- 2. Make provider_id optional at booking creation
-- 3. Add Customer Booking Policies and RPC
-- =========================================================

-- 1. Allow booking creation before provider assignment (SRS 1.22)
ALTER TABLE public.bookings 
ALTER COLUMN provider_id DROP NOT NULL;

-- 2. Allow customers to insert bookings for their own profile
CREATE POLICY "Customers can create bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customer_profiles c
    WHERE c.id = bookings.customer_id
      AND c.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Customers can cancel own pending bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.customer_profiles c
    WHERE c.id = bookings.customer_id
      AND c.user_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customer_profiles c
    WHERE c.id = bookings.customer_id
      AND c.user_id = (SELECT auth.uid())
  )
);

GRANT INSERT, UPDATE ON public.bookings TO authenticated;

-- 3. Deterministic Seed Data for Categories
INSERT INTO public.service_categories (id, category_name, description, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Hair Styling & Care', 'Cuts, custom colour, balayage & luxury styling rituals', TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Skin & Facial Rituals', 'Deep cleansing, organic hydra-facials & revitalising peels', TRUE),
  ('c1000000-0000-0000-0000-000000000003', 'Nails & Manicure', 'Artisanal manicures, pedicures, and signature gel nail art', TRUE),
  ('c1000000-0000-0000-0000-000000000004', 'Wellness & Spa', 'Holistic aromatherapy, Swedish massage & tension relief', TRUE)
ON CONFLICT (category_name) DO UPDATE 
SET description = EXCLUDED.description, is_active = EXCLUDED.is_active;

-- 4. Seed Subcategories
INSERT INTO public.service_subcategories (id, category_id, subcategory_name, description, is_active)
VALUES
  ('s1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Haircuts & Blowdry', 'Precision cuts and salon-finish blowouts', TRUE),
  ('s1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Colour & Highlights', 'Balayage, glossing, and bespoke coloring', TRUE),
  ('s1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Facial Therapies', 'Hydration and anti-aging treatments', TRUE),
  ('s1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000003', 'Signature Nails', 'Manicures and gel polish', TRUE),
  ('s1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000004', 'Body Therapies', 'Relaxation and revitalisation massages', TRUE)
ON CONFLICT (category_id, subcategory_name) DO NOTHING;

-- 5. Seed Services Catalog
INSERT INTO public.services (id, category_id, subcategory_id, service_name, description, duration_minutes, base_price, service_status)
VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    's1000000-0000-0000-0000-000000000001',
    'Signature Silk Blowout',
    'Wash, deep conditioning masque, and bespoke blowout with silky finish.',
    45,
    1499.00,
    'active'
  ),
  (
    'e1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    's1000000-0000-0000-0000-000000000002',
    'Balayage & Gloss Finish',
    'Hand-painted dimensional highlights paired with a nourishing tone gloss.',
    120,
    4999.00,
    'active'
  ),
  (
    'e1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000002',
    's1000000-0000-0000-0000-000000000003',
    'Radiance Hydra-Facial',
    'Multi-step facial infusing botanical serums, gentle extraction & lymphatic drainage.',
    60,
    2999.00,
    'active'
  ),
  (
    'e1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000002',
    's1000000-0000-0000-0000-000000000003',
    'Collagen Glow Skin Ritual',
    'Firming peptide massage followed by a cooling algae mask for supple glow.',
    75,
    3799.00,
    'active'
  ),
  (
    'e1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000003',
    's1000000-0000-0000-0000-000000000004',
    'Artisan Gel Manicure',
    'Precision cuticle care, botanical exfoliation, and chip-free gel application.',
    50,
    1799.00,
    'active'
  ),
  (
    'e1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000003',
    's1000000-0000-0000-0000-000000000004',
    'Rose Petal Spa Pedicure',
    'Warm mineral soak, Himalayan salt scrub, hot stone massage, and polish.',
    60,
    2199.00,
    'active'
  ),
  (
    'e1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000004',
    's1000000-0000-0000-0000-000000000005',
    'Aromatherapy Deep Relax Massage',
    'Full body Swedish massage utilizing essential oils to soothe muscular tension.',
    60,
    3499.00,
    'active'
  ),
  (
    'e1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000004',
    's1000000-0000-0000-0000-000000000005',
    'Hot Stone Harmony Ritual',
    'Heated volcanic stones placed along meridian points for deep tranquility.',
    75,
    4299.00,
    'active'
  )
ON CONFLICT (id) DO UPDATE
SET 
  service_name = EXCLUDED.service_name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  base_price = EXCLUDED.base_price,
  service_status = EXCLUDED.service_status;

-- 6. Safe RPC Function for Booking Creation
CREATE OR REPLACE FUNCTION public.create_appointment_booking(
  p_service_id UUID,
  p_salon_id UUID,
  p_appointment_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_address_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_customer_id UUID;
  v_base_price NUMERIC(10,2);
  v_tax NUMERIC(10,2);
  v_platform_fee NUMERIC(10,2) := 50.00;
  v_total NUMERIC(10,2);
  v_booking_id UUID;
BEGIN
  -- Authenticate caller
  v_user_id := (SELECT auth.uid());
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a booking.';
  END IF;

  -- Ensure customer profile exists
  SELECT id INTO v_customer_id
  FROM public.customer_profiles
  WHERE user_id = v_user_id
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    -- Auto-heal if trigger was skipped
    INSERT INTO public.customer_profiles (user_id)
    VALUES (v_user_id)
    RETURNING id INTO v_customer_id;
  END IF;

  -- Verify service
  SELECT base_price INTO v_base_price
  FROM public.services
  WHERE id = p_service_id AND service_status = 'active';

  IF v_base_price IS NULL THEN
    RAISE EXCEPTION 'Selected service is unavailable or inactive.';
  END IF;

  -- Calculations
  v_tax := ROUND(v_base_price * 0.18, 2);
  v_total := v_base_price + v_tax + v_platform_fee;

  -- Insert booking
  INSERT INTO public.bookings (
    customer_id,
    service_id,
    salon_id,
    address_id,
    appointment_date,
    start_time,
    end_time,
    base_amount,
    discount,
    tax,
    platform_fee,
    total_amount,
    booking_status,
    payment_status
  )
  VALUES (
    v_customer_id,
    p_service_id,
    p_salon_id,
    p_address_id,
    p_appointment_date,
    p_start_time,
    p_end_time,
    v_base_price,
    0,
    v_tax,
    v_platform_fee,
    v_total,
    'confirmed',
    'pending'
  )
  RETURNING id INTO v_booking_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'booking_id', v_booking_id,
    'total_amount', v_total
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_appointment_booking(
  UUID, UUID, DATE, TIME, TIME, UUID
) TO authenticated;
