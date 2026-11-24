
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
  Scissors,
  UserRound,
} from "lucide-react";

type Booking = {
  id: string;
  appointment_date: string;
  start_time: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  services: { service_name: string }[] | null;
  salons: { business_name: string }[] | null;
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
      <main className="min-h-screen bg-[#F8F4E7] px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-[#722F37]">
          Profile unavailable
        </h1>
        <p className="mt-3 text-gray-600">
          We could not load your account profile. Please try signing in again.
        </p>
        <Link href="/login" className="mt-6 inline-block underline">
          Return to sign in
        </Link>
      </main>
    );
  }

  // This is the customer dashboard, not the provider or administrator area.
  if (profile.role !== "customer") {
    redirect("/");
  }

  // Load the customer's profile.
  const { data: customer, error: customerError } = await supabase
    .from("customer_profiles")
    .select("id, loyalty_balance, favourite_service_ids, favourite_provider_ids")
    .eq("user_id", user.id)
    .single();

  if (customerError || !customer) {
    return (
      <main className="min-h-screen bg-[#F8F4E7] px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold text-[#722F37]">
          Customer profile unavailable
        </h1>
        <p className="mt-3 text-gray-600">
          Your login exists, but the customer profile could not be loaded.
          Please contact the administrator.
        </p>
      </main>
    );
  }

  // Retrieve the customer's bookings. Row Level Security limits access.
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
    <main className="min-h-screen bg-[#F8F4E7] text-[#302426]">
      <header className="border-b border-[#722F37]/15 bg-[#F8F4E7]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-[0.18em] text-[#722F37]"
          >
            ÉLAN
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            <Link href="/" className="hover:text-[#722F37]">
              Home
            </Link>
            <span className="font-semibold text-[#722F37]">
              My Account
            </span>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#9A6870]">
            Customer dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[#722F37] md:text-4xl">
            Welcome, {profile.full_name}
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your appointments, preferences and account.
          </p>
          <p className="mt-1 text-sm text-gray-500">{profile.email}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarDays size={22} />}
            label="Upcoming appointments"
            value={String(upcomingBookings.length)}
          />
          <StatCard
            icon={<Clock3 size={22} />}
            label="Past appointments"
            value={String(pastBookings.length)}
          />
          <StatCard
            icon={<Heart size={22} />}
            label="Favourite items"
            value={String(favouriteCount)}
          />
          <StatCard
            icon={<Star size={22} />}
            label="Loyalty points"
            value={String(customer.loyalty_balance)}
          />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_300px]">
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#9A6870]">
                  Your activity
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#722F37]">
                  Recent appointments
                </h2>
              </div>
              <span className="text-sm text-gray-500">
                Latest 10 records
              </span>
            </div>

            {bookingsError ? (
              <div className="rounded-xl border border-red-200 bg-white p-6 text-sm text-red-700">
                Booking information could not be loaded. Check the booking
                table's customer read policy.
              </div>
            ) : bookingList.length === 0 ? (
              <div className="rounded-xl border border-[#722F37]/15 bg-white p-10 text-center">
                <CalendarDays
                  className="mx-auto text-[#9A6870]"
                  size={36}
                />
                <h3 className="mt-4 text-lg font-semibold text-[#722F37]">
                  No appointments yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Your appointments will appear here after you make a booking.
                </p>
                <Link
                  href="/services"
                  className="mt-6 inline-flex items-center gap-2 bg-[#722F37] px-6 py-3 text-sm font-semibold text-white hover:bg-[#57232A]"
                >
                  Explore services <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookingList.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-xl border border-[#722F37]/10 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-[#722F37]">
                          {booking.services?.[0]?.service_name ?? "Salon service"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {booking.salons?.[0]?.business_name ?? "Salon not specified"}
                        </p>
                        <p className="mt-3 text-sm text-gray-600">
                          {formatDate(booking.appointment_date)} ·{" "}
                          {formatTime(booking.start_time)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{Number(booking.total_amount).toFixed(2)}
                        </p>
                        <span className="mt-2 inline-block rounded-full bg-[#F8F4E7] px-3 py-1 text-xs capitalize text-[#722F37]">
                          {booking.booking_status.replace("_", " ")}
                        </span>
                        <p className="mt-2 text-xs capitalize text-gray-500">
                          Payment: {booking.payment_status.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-xl bg-[#722F37] p-6 text-white">
              <UserRound size={26} />
              <h2 className="mt-4 text-xl font-semibold">Your account</h2>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Your account details and customer preferences are managed
                securely.
              </p>
              <p className="mt-5 border-t border-white/20 pt-4 text-sm">
                Account type: Customer
              </p>
            </div>

            <div className="rounded-xl border border-[#722F37]/10 bg-white p-6">
              <Scissors size={24} className="text-[#722F37]" />
              <h2 className="mt-3 font-semibold text-[#722F37]">
                Discover ÉLAN
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Explore salon services and find your next appointment.
              </p>
              <Link
                href="/salons"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#722F37]"
              >
                Browse salons <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-[#722F37]/15 px-6 py-6 text-center text-xs text-gray-500">
        ÉLAN Salon & Beauty · Customer Dashboard · 2026
      </footer>
    </main>
  );
}
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#F8F4E7]">
          <p className="text-[#722F37]">Loading your dashboard...</p>
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#722F37]/10 bg-white p-5">
      <div className="text-[#9A6870]">{icon}</div>
      <p className="mt-4 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[#722F37]">{value}</p>
    </div>
  );
}
