import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import BookingForm from "./BookingForm";

// Fallback services in case Supabase table has not yet been seeded
const FALLBACK_SERVICES: Record<
  string,
  {
    id: string;
    service_name: string;
    description: string;
    duration_minutes: number;
    base_price: number;
  }
> = {
  "e1000000-0000-0000-0000-000000000001": {
    id: "e1000000-0000-0000-0000-000000000001",
    service_name: "Signature Silk Blowout",
    description: "Wash, deep conditioning masque, and bespoke blowout with silky finish.",
    duration_minutes: 45,
    base_price: 1499,
  },
  "e1000000-0000-0000-0000-000000000002": {
    id: "e1000000-0000-0000-0000-000000000002",
    service_name: "Balayage & Gloss Finish",
    description: "Hand-painted dimensional highlights paired with a nourishing tone gloss.",
    duration_minutes: 120,
    base_price: 4999,
  },
  "e1000000-0000-0000-0000-000000000003": {
    id: "e1000000-0000-0000-0000-000000000003",
    service_name: "Radiance Hydra-Facial",
    description: "Multi-step facial infusing botanical serums, gentle extraction & lymphatic drainage.",
    duration_minutes: 60,
    base_price: 2999,
  },
  "e1000000-0000-0000-0000-000000000004": {
    id: "e1000000-0000-0000-0000-000000000004",
    service_name: "Collagen Glow Skin Ritual",
    description: "Firming peptide massage followed by a cooling algae mask for supple glow.",
    duration_minutes: 75,
    base_price: 3799,
  },
  "e1000000-0000-0000-0000-000000000005": {
    id: "e1000000-0000-0000-0000-000000000005",
    service_name: "Artisan Gel Manicure",
    description: "Precision cuticle care, botanical exfoliation, and chip-free gel application.",
    duration_minutes: 50,
    base_price: 1799,
  },
  "e1000000-0000-0000-0000-000000000006": {
    id: "e1000000-0000-0000-0000-000000000006",
    service_name: "Rose Petal Spa Pedicure",
    description: "Warm mineral soak, Himalayan salt scrub, hot stone massage, and polish.",
    duration_minutes: 60,
    base_price: 2199,
  },
  "e1000000-0000-0000-0000-000000000007": {
    id: "e1000000-0000-0000-0000-000000000007",
    service_name: "Aromatherapy Deep Relax Massage",
    description: "Full body Swedish massage utilizing essential oils to soothe muscular tension.",
    duration_minutes: 60,
    base_price: 3499,
  },
  "e1000000-0000-0000-0000-000000000008": {
    id: "e1000000-0000-0000-0000-000000000008",
    service_name: "Hot Stone Harmony Ritual",
    description: "Heated volcanic stones placed along meridian points for deep tranquility.",
    duration_minutes: 75,
    base_price: 4299,
  },
};

const DEFAULT_SALONS = [
  {
    id: "b1000000-0000-0000-0000-000000000001",
    business_name: "The Rose Atelier",
    location: "Bandra West, Mumbai",
  },
  {
    id: "b1000000-0000-0000-0000-000000000002",
    business_name: "Maison de Beauté",
    location: "Indiranagar, Bengaluru",
  },
  {
    id: "b1000000-0000-0000-0000-000000000003",
    business_name: "The Pink Room",
    location: "South Extension, New Delhi",
  },
];

export default function BookingPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8F4E7] px-6 py-24 text-center">
          <p className="text-[#722F37]">Preparing your reservation...</p>
        </main>
      }
    >
      <BookingContent params={params} />
    </Suspense>
  );
}

async function BookingContent({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  const supabase = await createClient();

  // 1. Fetch user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch service details from DB
  const { data: dbService } = await supabase
    .from("services")
    .select("id, service_name, description, duration_minutes, base_price")
    .eq("id", serviceId)
    .maybeSingle();

  const service = dbService || FALLBACK_SERVICES[serviceId];

  if (!service) {
    notFound();
  }

  // 3. Fetch salons from DB
  const { data: dbSalons } = await supabase
    .from("salons")
    .select("id, business_name")
    .limit(5);

  const salons =
    dbSalons && dbSalons.length > 0
      ? dbSalons.map((s) => ({
          id: s.id,
          business_name: s.business_name,
          location: "Partner Salon",
        }))
      : DEFAULT_SALONS;

  return (
    <main className="min-h-screen bg-[#F8F4E7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header navigation */}
        <div className="mb-8 flex items-center justify-between border-b border-[#722F37]/15 pb-4">
          <Link
            href="/services"
            className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-[#722F37] transition hover:text-[#57232B]"
          >
            <ArrowLeft size={14} />
            BACK TO RITUALS
          </Link>
          <span className="font-mono text-[10px] font-bold tracking-[0.25em] uppercase text-[#776760]">
            BESPOKE RESERVATION · 2026
          </span>
        </div>

        <BookingForm
          service={service}
          salons={salons}
          userEmail={user?.email ?? null}
        />
      </div>
    </main>
  );
}
