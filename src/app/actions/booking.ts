"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CreateBookingInput = {
  serviceId: string;
  salonId?: string | null;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM:SS
  endTime: string; // HH:MM:SS
  notes?: string;
};

export async function createBookingAction(input: CreateBookingInput) {
  try {
    const supabase = await createClient();

    // 1. Verify Authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Please sign in to confirm your appointment.",
      };
    }

    // 2. Attempt via SQL RPC function
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "create_appointment_booking",
      {
        p_service_id: input.serviceId,
        p_salon_id: input.salonId || null,
        p_appointment_date: input.appointmentDate,
        p_start_time: input.startTime,
        p_end_time: input.endTime,
      }
    );

    if (!rpcError && rpcData?.success) {
      revalidatePath("/dashboard");
      return {
        success: true,
        bookingId: rpcData.booking_id,
        totalAmount: rpcData.total_amount,
      };
    }

    // 3. Fallback: Direct table operations if RPC is not yet executed in Supabase
    // A. Resolve Customer Profile
    let customerId: string | null = null;
    const { data: customerProfile } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerProfile) {
      customerId = customerProfile.id;
    } else {
      const { data: newCustomer, error: createCustError } = await supabase
        .from("customer_profiles")
        .insert({ user_id: user.id })
        .select("id")
        .single();

      if (createCustError || !newCustomer) {
        return {
          success: false,
          error: "Unable to retrieve customer account details.",
        };
      }
      customerId = newCustomer.id;
    }

    // B. Fetch service pricing
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("base_price, duration_minutes")
      .eq("id", input.serviceId)
      .single();

    if (serviceError || !service) {
      return {
        success: false,
        error: "Selected service could not be located or is inactive.",
      };
    }

    const baseAmount = Number(service.base_price);
    const tax = Math.round(baseAmount * 0.18 * 100) / 100;
    const platformFee = 50.0;
    const totalAmount = baseAmount + tax + platformFee;

    // C. Insert booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_id: customerId,
        service_id: input.serviceId,
        salon_id: input.salonId || null,
        appointment_date: input.appointmentDate,
        start_time: input.startTime,
        end_time: input.endTime,
        base_amount: baseAmount,
        discount: 0,
        tax: tax,
        platform_fee: platformFee,
        total_amount: totalAmount,
        booking_status: "confirmed",
        payment_status: "pending",
      })
      .select("id")
      .single();

    if (bookingError) {
      return {
        success: false,
        error: bookingError.message || "Failed to create booking reservation.",
      };
    }

    revalidatePath("/dashboard");
    return {
      success: true,
      bookingId: booking.id,
      totalAmount,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected server error.";
    return {
      success: false,
      error: message,
    };
  }
}

export async function cancelBookingAction(bookingId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const { error } = await supabase
      .from("bookings")
      .update({
        booking_status: "cancelled",
        cancellation_reason: "Cancelled by customer via dashboard",
      })
      .eq("id", bookingId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    return { success: false, error: message };
  }
}
