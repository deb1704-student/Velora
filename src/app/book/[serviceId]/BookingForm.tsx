"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
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

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase(),
      dayNumber: String(d.getDate()).padStart(2, "0"),
      month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
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
      <div className="mx-auto max-w-xl border border-[#722F37]/20 bg-white p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[#722F37] bg-[#722F37] text-white">
          <CheckCircle2 size={32} />
        </div>
        <p className="mt-6 font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#722F37]">
          [ CONFIRMATION #ELAN-BOOKING ]
        </p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-[#492E2D]">
          APPOINTMENT CONFIRMED.
        </h2>
        <p className="mt-3 text-xs leading-relaxed text-[#776760]">
          Your appointment for{" "}
          <strong className="text-[#722F37] uppercase">{service.service_name}</strong> has
          been reserved. We look forward to welcoming you to the atelier.
        </p>

        <div className="mt-8 border border-[#722F37]/15 bg-[#F8F4E7] p-6 text-left font-mono text-xs text-[#302326]">
          <div className="flex justify-between border-b border-[#722F37]/10 pb-3">
            <span className="text-[#776760] uppercase">APPOINTMENT DATE</span>
            <span className="font-bold">{selectedDate}</span>
          </div>
          <div className="flex justify-between border-b border-[#722F37]/10 py-3">
            <span className="text-[#776760] uppercase">TIME</span>
            <span className="font-bold">{selectedSlot.label}</span>
          </div>
          <div className="flex justify-between border-b border-[#722F37]/10 py-3">
            <span className="text-[#776760] uppercase">DURATION</span>
            <span className="font-bold">{service.duration_minutes} MIN</span>
          </div>
          <div className="flex justify-between pt-3 font-bold text-[#722F37]">
            <span className="uppercase">TOTAL PAYABLE AT SALON</span>
            <span className="text-sm font-bold">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center font-mono">
          <Link
            href="/dashboard"
            className="border border-[#722F37] bg-[#722F37] px-8 py-3.5 text-xs font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#57232B]"
          >
            VIEW MY APPOINTMENTS
          </Link>
          <Link
            href="/services"
            className="border border-[#722F37]/30 px-8 py-3.5 text-xs font-bold tracking-[0.2em] uppercase text-[#722F37] transition hover:border-[#722F37]"
          >
            EXPLORE MORE TREATMENTS
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
        <section className="border border-[#722F37]/20 bg-white p-7 sm:p-9">
          <div className="mb-6 flex items-center justify-between border-b border-[#722F37]/10 pb-3">
            <h3 className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-[#722F37]">
              [ 01 ] SELECT ATELIER
            </h3>
            <MapPin size={16} className="text-[#722F37]" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {salons.map((salon) => (
              <button
                key={salon.id}
                type="button"
                onClick={() => setSelectedSalonId(salon.id)}
                className={`border p-4 text-left transition ${
                  selectedSalonId === salon.id
                    ? "border-[#722F37] bg-[#722F37]/5 ring-1 ring-[#722F37]"
                    : "border-gray-200 hover:border-[#722F37]/40"
                }`}
              >
                <p className="font-bold text-[#302326]">{salon.business_name}</p>
                <p className="mt-1 font-mono text-[11px] text-[#776760]">{salon.location}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Date Selection */}
        <section className="border border-[#722F37]/20 bg-white p-7 sm:p-9">
          <div className="mb-6 flex items-center justify-between border-b border-[#722F37]/10 pb-3">
            <h3 className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-[#722F37]">
              [ 02 ] SELECT YOUR PREFERRED DATE
            </h3>
            <Calendar size={16} className="text-[#722F37]" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
            {dates.map((d) => (
              <button
                key={d.iso}
                type="button"
                onClick={() => setSelectedDate(d.iso)}
                className={`flex flex-col items-center border py-3.5 transition ${
                  selectedDate === d.iso
                    ? "border-[#722F37] bg-[#722F37] text-white"
                    : "border-gray-200 text-[#302326] hover:border-[#722F37]"
                }`}
              >
                <span className="font-mono text-[10px] font-semibold tracking-wider opacity-75">
                  {d.dayName}
                </span>
                <span className="mt-1 font-mono text-xl font-black">
                  {d.dayNumber}
                </span>
                <span className="font-mono text-[9px] opacity-75">{d.month}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Time Slot Selection */}
        <section className="border border-[#722F37]/20 bg-white p-7 sm:p-9">
          <div className="mb-6 flex items-center justify-between border-b border-[#722F37]/10 pb-3">
            <h3 className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-[#722F37]">
              [ 03 ] PREFERRED TIME
            </h3>
            <Clock size={16} className="text-[#722F37]" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`border py-3 text-center text-xs font-bold tracking-wider transition ${
                  selectedSlot.time === slot.time
                    ? "border-[#722F37] bg-[#722F37] text-white"
                    : "border-gray-200 text-[#302326] hover:border-[#722F37]"
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
        <div className="sticky top-28 border border-[#722F37]/20 bg-white p-7 sm:p-8">
          <div className="flex items-center justify-between border-b border-[#722F37]/15 pb-3 font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-[#722F37]">
            <span>APPOINTMENT SUMMARY</span>
            <span>THE 2026 COLLECTION</span>
          </div>

          <h3 className="mt-4 text-2xl font-black uppercase tracking-tight text-[#492E2D]">
            {service.service_name}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[#776760]">
            {service.description || "Luxury coiffure & bespoke aesthetic treatment."}
          </p>

          <div className="mt-6 flex items-center gap-4 border-y border-[#722F37]/10 py-3.5 font-mono text-xs text-[#302326]">
            <div className="flex items-center gap-1.5 font-semibold">
              <Clock size={14} className="text-[#722F37]" />
              <span>{service.duration_minutes} MIN</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck size={14} className="text-[#722F37]" />
              <span>PRIVATE LUXURY SUITE</span>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="mt-6 space-y-3 font-mono text-xs">
            <div className="flex justify-between text-[#776760]">
              <span className="uppercase">TREATMENT RATE</span>
              <span className="font-bold text-[#302326]">{formatPrice(basePrice)}</span>
            </div>
            <div className="flex justify-between text-[#776760]">
              <span className="uppercase">TAX & GST (18%)</span>
              <span className="font-bold text-[#302326]">{formatPrice(gst)}</span>
            </div>
            <div className="flex justify-between text-[#776760]">
              <span className="uppercase">CONCIERGE & AMENITIES</span>
              <span className="font-bold text-[#302326]">{formatPrice(platformFee)}</span>
            </div>
            <div className="flex justify-between border-t border-[#722F37]/20 pt-4 text-sm font-bold text-[#722F37]">
              <span className="uppercase">TOTAL PAYABLE AT SALON</span>
              <span className="text-xl font-black">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="mt-6 border border-[#722F37]/15 bg-[#F8F4E7] p-3.5 font-mono text-[11px] leading-relaxed text-[#655650]">
            PAYMENT: AT THE ATELIER DESK AFTER YOUR SESSION VIA CARD, UPI, OR CASH. NO ADVANCE DEPOSIT REQUIRED.
          </div>

          {errorMsg && (
            <div className="mt-4 border border-red-300 bg-red-50 p-3 font-mono text-xs text-red-700 uppercase">
              {errorMsg}
            </div>
          )}

          <div className="mt-6 font-mono">
            {userEmail ? (
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmBooking}
                className="w-full border border-[#722F37] bg-[#722F37] py-4 text-xs font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#57232B] disabled:opacity-50"
              >
                {submitting ? "CONFIRMING..." : "CONFIRM APPOINTMENT"}
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/login?returnUrl=/book/${service.id}`}
                  className="flex w-full items-center justify-center gap-2 border border-[#722F37] bg-[#722F37] py-4 text-xs font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#57232B]"
                >
                  <User size={15} />
                  SIGN IN TO BOOK
                </Link>
                <p className="text-center font-mono text-[11px] text-[#776760]">
                  NEW CLIENT?{" "}
                  <Link
                    href={`/register?returnUrl=/book/${service.id}`}
                    className="font-bold text-[#722F37] underline"
                  >
                    REGISTER ACCOUNT
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
