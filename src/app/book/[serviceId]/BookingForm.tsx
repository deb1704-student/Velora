"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  User,
} from "lucide-react";
import { createBookingAction } from "@/app/actions/booking";

type Service = {
  id: string;
  service_name: string;
  description: string | null;
  duration_minutes: number;
  base_price: number;
};

type Salon = {
  id: string;
  business_name: string;
  location: string;
};

type Props = {
  service: Service;
  salons: Salon[];
  userEmail: string | null;
};

export default function BookingForm({ service, salons, userEmail }: Props) {
  const router = useRouter();

  // Generate next 7 dates starting tomorrow
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString("en-IN", { weekday: "short" }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
    };
  });

  const timeSlots = [
    { label: "10:00 AM", time: "10:00:00" },
    { label: "11:30 AM", time: "11:30:00" },
    { label: "01:00 PM", time: "13:00:00" },
    { label: "02:30 PM", time: "14:30:00" },
    { label: "04:00 PM", time: "16:00:00" },
    { label: "05:30 PM", time: "17:30:00" },
    { label: "07:00 PM", time: "19:00:00" },
  ];

  const [selectedSalonId, setSelectedSalonId] = useState<string>(
    salons[0]?.id ?? ""
  );
  const [selectedDate, setSelectedDate] = useState<string>(dates[0].iso);
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Price calculations
  const basePrice = Number(service.base_price);
  const gst = Math.round(basePrice * 0.18);
  const platformFee = 50;
  const grandTotal = basePrice + gst + platformFee;

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  // Calculate end time
  function computeEndTime(startTimeStr: string, durationMinutes: number) {
    const [h, m] = startTimeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + durationMinutes, 0, 0);
    return date.toTimeString().slice(0, 8);
  }

  async function handleConfirmBooking() {
    if (!userEmail) {
      router.push(`/login?returnUrl=/book/${service.id}`);
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const endTime = computeEndTime(
      selectedSlot.time,
      service.duration_minutes
    );

    const result = await createBookingAction({
      serviceId: service.id,
      salonId: selectedSalonId || null,
      appointmentDate: selectedDate,
      startTime: selectedSlot.time,
      endTime: endTime,
    });

    setSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error ?? "Failed to reserve appointment.");
      return;
    }

    setBookingSuccess(true);
  }

  if (bookingSuccess) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EBD9D9] text-[#722F37]">
          <CheckCircle2 size={36} />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#722F37]">
          Appointment Confirmed
        </p>
        <h2 className="mt-2 font-serif text-3xl text-[#302326]">
          We look forward to welcoming you
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          Your reservation for{" "}
          <strong className="text-[#722F37]">{service.service_name}</strong> has
          been recorded.
        </p>

        <div className="mt-8 rounded-2xl bg-[#F8F4E7] p-6 text-left text-sm text-[#302326]">
          <div className="flex justify-between border-b border-[#722F37]/10 pb-3">
            <span className="text-gray-500">Date</span>
            <span className="font-semibold">{selectedDate}</span>
          </div>
          <div className="flex justify-between border-b border-[#722F37]/10 py-3">
            <span className="text-gray-500">Time</span>
            <span className="font-semibold">{selectedSlot.label}</span>
          </div>
          <div className="flex justify-between border-b border-[#722F37]/10 py-3">
            <span className="text-gray-500">Duration</span>
            <span className="font-semibold">{service.duration_minutes} mins</span>
          </div>
          <div className="flex justify-between pt-3 font-semibold text-[#722F37]">
            <span>Total Payable at Salon</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="rounded-full bg-[#722F37] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#57232B]"
          >
            Go to My Dashboard
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-[#722F37] px-8 py-3.5 text-sm font-semibold text-[#722F37] transition hover:bg-[#722F37]/5"
          >
            Explore More Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* Left Column: Booking Options */}
      <div className="space-y-8 lg:col-span-7">
        {/* Salon Selection */}
        <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-center gap-2.5 text-[#722F37]">
            <MapPin size={20} />
            <h3 className="font-serif text-xl">Select Location</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {salons.map((salon) => (
              <button
                key={salon.id}
                type="button"
                onClick={() => setSelectedSalonId(salon.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedSalonId === salon.id
                    ? "border-[#722F37] bg-[#722F37]/5 ring-2 ring-[#722F37]/20"
                    : "border-gray-200 hover:border-[#722F37]/40"
                }`}
              >
                <p className="font-semibold text-[#302326]">{salon.business_name}</p>
                <p className="mt-1 text-xs text-gray-500">{salon.location}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Date Selection */}
        <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-center gap-2.5 text-[#722F37]">
            <Calendar size={20} />
            <h3 className="font-serif text-xl">Choose Date</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
            {dates.map((d) => (
              <button
                key={d.iso}
                type="button"
                onClick={() => setSelectedDate(d.iso)}
                className={`flex flex-col items-center rounded-xl border py-3 transition ${
                  selectedDate === d.iso
                    ? "border-[#722F37] bg-[#722F37] text-white shadow-md"
                    : "border-gray-200 text-[#302326] hover:border-[#722F37]/40 hover:bg-[#F8F4E7]/40"
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider opacity-80">
                  {d.dayName}
                </span>
                <span className="mt-1 font-serif text-xl font-semibold">
                  {d.dayNumber}
                </span>
                <span className="text-[10px] opacity-75">{d.month}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Time Slot Selection */}
        <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <div className="mb-5 flex items-center gap-2.5 text-[#722F37]">
            <Clock size={20} />
            <h3 className="font-serif text-xl">Select Time Slot</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-xl border py-3 text-center text-sm font-medium transition ${
                  selectedSlot.time === slot.time
                    ? "border-[#722F37] bg-[#722F37] text-white shadow-md"
                    : "border-gray-200 text-[#302326] hover:border-[#722F37]/40 hover:bg-[#F8F4E7]/40"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Right Column: Order Summary & Checkout */}
      <div className="lg:col-span-5">
        <div className="sticky top-28 rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#722F37]">
            Reservation Summary
          </p>
          <h3 className="mt-2 font-serif text-2xl text-[#302326]">
            {service.service_name}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {service.description || "Experience bespoke luxury care."}
          </p>

          <div className="mt-6 flex items-center gap-4 border-y border-[#F0E5E3] py-4 text-xs text-[#302326]">
            <div className="flex items-center gap-1.5">
              <Clock size={15} className="text-[#722F37]" />
              <span>{service.duration_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles size={15} className="text-[#722F37]" />
              <span>Sanitized Suite</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#722F37]" />
              <span>Expert Stylist</span>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Service Charge</span>
              <span>{formatPrice(basePrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST & Taxes (18%)</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Hygiene & Platform Fee</span>
              <span>{formatPrice(platformFee)}</span>
            </div>
            <div className="flex justify-between border-t border-[#F0E5E3] pt-3 text-base font-semibold text-[#722F37]">
              <span>Grand Total</span>
              <span className="font-serif text-2xl">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#F8F4E7] p-4 text-xs leading-5 text-[#655650]">
            💳 <strong>Payment Method:</strong> Pay on arrival at the salon via Cash,
            UPI, or Card. No advance charge required.
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="mt-6">
            {userEmail ? (
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmBooking}
                className="w-full rounded-full bg-[#722F37] py-4 text-sm font-semibold tracking-wider text-white shadow-md transition hover:bg-[#57232B] disabled:opacity-50"
              >
                {submitting ? "CONFIRMING RESERVATION..." : "CONFIRM & RESERVE"}
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/login?returnUrl=/book/${service.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#722F37] py-4 text-sm font-semibold tracking-wider text-white transition hover:bg-[#57232B]"
                >
                  <User size={16} />
                  SIGN IN TO COMPLETE BOOKING
                </Link>
                <p className="text-center text-xs text-gray-500">
                  New client?{" "}
                  <Link
                    href={`/register?returnUrl=/book/${service.id}`}
                    className="font-semibold text-[#722F37] underline"
                  >
                    Create account
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
