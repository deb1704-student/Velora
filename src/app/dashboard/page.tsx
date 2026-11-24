import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

import {
  CalendarDays,
  Heart,
  Star,
  Clock3,
  ArrowRight,
  UserRound,
} from "lucide-react";
import CancelBookingButton from "./CancelBookingButton";

type Booking = {
  id: string;
  appointment_date: string;
  start_time: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  services: any;
  salons: any;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

async function DashboardContent() {
  const supabase = await createClient();

  // Verify the current user on the server.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Load the user's application profile.
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return (
      <main className="min-h-screen bg-[#F8F4E7] px-6 py-20 text-center font-mono">
        <h1 className="text-xl font-bold uppercase text-[#722F37]">
          [ ERROR: PROFILE_UNAVAILABLE ]
        </h1>
        <p className="mt-3 text-xs text-[#776760]">
          We could not load your account profile. Please re-authenticate.
        </p>
        <Link href="/login" className="mt-6 inline-block font-bold underline">
          RETURN TO AUTHENTICATION
        </Link>
      </main>
    );
  }

  if (profile.role !== "customer") {
    redirect("/");
  }

  // Load customer profile.
  const { data: customer, error: customerError } = await supabase
    .from("customer_profiles")
    .select("id, loyalty_balance, favourite_service_ids, favourite_provider_ids")
    .eq("user_id", user.id)
    .single();

  if (customerError || !customer) {
    return (
      <main className="min-h-screen bg-[#F8F4E7] px-6 py-20 text-center font-mono">
        <h1 className="text-xl font-bold uppercase text-[#722F37]">
          [ ERROR: CUSTOMER_RECORD_NOT_INITIALIZED ]
        </h1>
        <p className="mt-3 text-xs text-[#776760]">
          Your identity exists, but customer profile data was not allocated.
        </p>
      </main>
    );
  }

  // Retrieve customer bookings.
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      id,
      appointment_date,
      start_time,
      booking_status,
      payment_status,
      total_amount,
      services ( service_name ),
      salons ( business_name )
    `)
    .eq("customer_id", customer.id)
    .order("appointment_date", { ascending: false })
    .limit(10);

  const bookingList = (bookings ?? []) as Booking[];
  const today = new Date().toISOString().slice(0, 10);

  const upcomingBookings = bookingList.filter(
    (booking) =>
      booking.appointment_date >= today &&
      !["cancelled", "rejected", "completed", "no_show"].includes(
        booking.booking_status
      )
  );

  const pastBookings = bookingList.filter(
    (booking) =>
      booking.appointment_date < today ||
      ["cancelled", "rejected", "completed", "no_show"].includes(
        booking.booking_status
      )
  );

  const favouriteCount =
    (customer.favourite_service_ids?.length ?? 0) +
    (customer.favourite_provider_ids?.length ?? 0);

  return (
    <main className="min-h-screen bg-[#F8F4E7] text-[#342925]">
      {/* Header */}
      <header className="border-b border-[#722F37]/15 bg-[#F8F4E7]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-2xl font-black tracking-[-0.04em] text-[#722F37]">
              ÉLAN
            </span>
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#776760] uppercase">
              STUDIOS / CLIENT DASHBOARD
            </span>
          </Link>

          <nav className="flex items-center gap-6 font-mono text-xs font-bold tracking-[0.16em] uppercase">
            <Link href="/" className="text-[#776760] hover:text-[#722F37]">
              HOME
            </Link>
            <Link href="/services" className="text-[#776760] hover:text-[#722F37]">
              CATALOGUE
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        <div className="mb-10 border-b border-[#722F37]/15 pb-6">
          <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#722F37]">
            CLIENT IDENTIFIER: {profile.id.slice(0, 8)}...
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-[#492E2D] sm:text-5xl">
            {profile.full_name}
          </h1>
          <p className="mt-1 font-mono text-xs text-[#776760]">{profile.email}</p>
        </div>

        {/* Swiss Stats Matrix */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono">
          <StatCard
            icon={<CalendarDays size={18} />}
            code="01"
            label="UPCOMING SESSIONS"
            value={String(upcomingBookings.length)}
          />
          <StatCard
            icon={<Clock3 size={18} />}
            code="02"
            label="HISTORICAL SESSIONS"
            value={String(pastBookings.length)}
          />
          <StatCard
            icon={<Heart size={18} />}
            code="03"
            label="SAVED RITUALS"
            value={String(favouriteCount)}
          />
          <StatCard
            icon={<Star size={18} />}
            code="04"
            label="LOYALTY BALANCE"
            value={String(customer.loyalty_balance)}
          />
        </div>

        {/* Schedule Ledger Section */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-[#722F37]/15 pb-3 font-mono">
              <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-[#722F37]">
                [ SCHEDULE LEDGER / 10 RECORDS ]
              </h2>
              <Link
                href="/services"
                className="text-xs font-bold uppercase tracking-wider text-[#722F37] underline hover:text-[#492E2D]"
              >
                + BOOK NEW SERVICE
              </Link>
            </div>

            {bookingsError ? (
              <div className="border border-red-300 bg-red-50 p-6 font-mono text-xs text-red-700 uppercase">
                ERROR RETRIEVING BOOKINGS FROM LEDGER.
              </div>
            ) : bookingList.length === 0 ? (
              <div className="border border-dashed border-[#722F37]/25 bg-white/60 p-12 text-center">
                <CalendarDays className="mx-auto text-[#722F37]" size={36} />
                <h3 className="mt-4 text-2xl font-black uppercase tracking-tight text-[#492E2D]">
                  NO ACTIVE SESSIONS
                </h3>
                <p className="mt-2 text-xs text-gray-500">
                  Your appointment history will be documented here once committed.
                </p>
                <Link
                  href="/services"
                  className="mt-6 inline-flex items-center gap-2 border border-[#722F37] bg-[#722F37] px-6 py-3 font-mono text-xs font-bold tracking-[0.2em] uppercase text-white hover:bg-[#57232B]"
                >
                  SCHEDULE SESSIONS <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingList.map((booking) => {
                  const serviceName = Array.isArray(booking.services)
                    ? booking.services[0]?.service_name
                    : booking.services?.service_name ?? "Salon service";

                  const salonName = Array.isArray(booking.salons)
                    ? booking.salons[0]?.business_name
                    : booking.salons?.business_name ?? "ÉLAN Partner Salon";

                  return (
                    <article
                      key={booking.id}
                      className="border border-[#722F37]/20 bg-white p-6 transition hover:border-[#722F37]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#722F37]">
                            [ {booking.id.slice(0, 8)} ]
                          </div>
                          <h3 className="mt-1 text-xl font-black uppercase tracking-tight text-[#492E2D]">
                            {serviceName}
                          </h3>
                          <p className="mt-1 font-mono text-xs text-[#776760]">
                            {salonName}
                          </p>
                          <p className="mt-3 font-mono text-xs font-semibold text-[#302326]">
                            {formatDate(booking.appointment_date)} ·{" "}
                            {formatTime(booking.start_time)}
                          </p>
                        </div>

                        <div className="text-right font-mono">
                          <p className="text-xl font-bold text-[#722F37]">
                            ₹{Number(booking.total_amount).toFixed(2)}
                          </p>
                          <span className="mt-2 inline-block border border-[#722F37]/25 bg-[#F8F4E7] px-2.5 py-1 text-[10px] font-bold uppercase text-[#722F37]">
                            {booking.booking_status}
                          </span>
                          <p className="mt-2 text-[10px] uppercase text-[#776760]">
                            PAYMENT: {booking.payment_status}
                          </p>
                          {["pending", "confirmed"].includes(
                            booking.booking_status
                          ) && (
                            <div>
                              <CancelBookingButton bookingId={booking.id} />
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right Sidebar Details */}
          <aside className="space-y-5">
            <div className="border border-[#722F37] bg-[#722F37] p-6 text-white font-mono">
              <UserRound size={22} className="text-[#D7A7B1]" />
              <h2 className="mt-4 text-lg font-black uppercase tracking-tight">CLIENT STATUS</h2>
              <p className="mt-2 text-xs leading-relaxed text-white/75">
                Authentication profile secured by PostgreSQL Row Level Security protocols.
              </p>
              <div className="mt-5 border-t border-white/20 pt-4 text-xs font-bold uppercase text-[#D7A7B1]">
                ACCOUNT ROLE: CUSTOMER
              </div>
            </div>

            <div className="border border-[#722F37]/20 bg-white p-6 font-mono">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-[#722F37]">
                ATELIER SUPPORT
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#776760]">
                Need custom rescheduling or special accommodation? Reach out to support.
              </p>
              <Link
                href="/services"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#722F37] underline"
              >
                OPEN DIRECTORY <ArrowRight size={13} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#722F37]/15 px-6 py-6 text-center font-mono text-[10px] uppercase tracking-wider text-[#776760]">
        ÉLAN SYSTEM DASHBOARD · PRODUCTION 2026
      </footer>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#F8F4E7] font-mono text-xs text-[#722F37]">
          LOADING DASHBOARD RECORD...
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function StatCard({
  icon,
  code,
  label,
  value,
}: {
  icon: React.ReactNode;
  code: string;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-[#722F37]/20 bg-white p-5">
      <div className="flex items-center justify-between text-[#722F37]">
        <div>{icon}</div>
        <span className="text-[10px] font-bold opacity-60">[ {code} ]</span>
      </div>
      <p className="mt-4 text-[10px] font-bold tracking-[0.16em] uppercase text-[#776760]">
        {label}
      </p>
      <p className="mt-1 text-3xl font-black text-[#722F37]">{value}</p>
    </div>
  );
}
