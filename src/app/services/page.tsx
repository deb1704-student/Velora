import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ServicesCatalog from "./ServicesCatalog";

const FALLBACK_CATEGORIES = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    category_name: "Hair Styling & Care",
    description: "Cuts, custom colour, balayage & luxury styling rituals",
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    category_name: "Skin & Facial Rituals",
    description: "Deep cleansing, organic hydra-facials & revitalising peels",
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    category_name: "Nails & Manicure",
    description: "Artisanal manicures, pedicures, and signature gel nail art",
  },
  {
    id: "c1000000-0000-0000-0000-000000000004",
    category_name: "Wellness & Spa",
    description: "Holistic aromatherapy, Swedish massage & tension relief",
  },
];

const FALLBACK_SERVICES = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    category_id: "c1000000-0000-0000-0000-000000000001",
    service_name: "Signature Silk Blowout",
    description: "Wash, deep conditioning masque, and bespoke blowout with silky finish.",
    duration_minutes: 45,
    base_price: 1499,
  },
  {
    id: "e1000000-0000-0000-0000-000000000002",
    category_id: "c1000000-0000-0000-0000-000000000001",
    service_name: "Balayage & Gloss Finish",
    description: "Hand-painted dimensional highlights paired with a nourishing tone gloss.",
    duration_minutes: 120,
    base_price: 4999,
  },
  {
    id: "e1000000-0000-0000-0000-000000000003",
    category_id: "c1000000-0000-0000-0000-000000000002",
    service_name: "Radiance Hydra-Facial",
    description: "Multi-step facial infusing botanical serums, gentle extraction & lymphatic drainage.",
    duration_minutes: 60,
    base_price: 2999,
  },
  {
    id: "e1000000-0000-0000-0000-000000000004",
    category_id: "c1000000-0000-0000-0000-000000000002",
    service_name: "Collagen Glow Skin Ritual",
    description: "Firming peptide massage followed by a cooling algae mask for supple glow.",
    duration_minutes: 75,
    base_price: 3799,
  },
  {
    id: "e1000000-0000-0000-0000-000000000005",
    category_id: "c1000000-0000-0000-0000-000000000003",
    service_name: "Artisan Gel Manicure",
    description: "Precision cuticle care, botanical exfoliation, and chip-free gel application.",
    duration_minutes: 50,
    base_price: 1799,
  },
  {
    id: "e1000000-0000-0000-0000-000000000006",
    category_id: "c1000000-0000-0000-0000-000000000003",
    service_name: "Rose Petal Spa Pedicure",
    description: "Warm mineral soak, Himalayan salt scrub, hot stone massage, and polish.",
    duration_minutes: 60,
    base_price: 2199,
  },
  {
    id: "e1000000-0000-0000-0000-000000000007",
    category_id: "c1000000-0000-0000-0000-000000000004",
    service_name: "Aromatherapy Deep Relax Massage",
    description: "Full body Swedish massage utilizing essential oils to soothe muscular tension.",
    duration_minutes: 60,
    base_price: 3499,
  },
  {
    id: "e1000000-0000-0000-0000-000000000008",
    category_id: "c1000000-0000-0000-0000-000000000004",
    service_name: "Hot Stone Harmony Ritual",
    description: "Heated volcanic stones placed along meridian points for deep tranquility.",
    duration_minutes: 75,
    base_price: 4299,
  },
];

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8F4E7] px-6 py-24 text-center">
          <p className="text-[#722F37]">Loading our services...</p>
        </main>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}

async function ServicesContent() {
  const supabase = await createClient();

  const [{ data: categories }, { data: services }] = await Promise.all([
    supabase
      .from("service_categories")
      .select("id, category_name, description")
      .eq("is_active", true)
      .order("category_name"),

    supabase
      .from("services")
      .select(
        "id, category_id, service_name, description, duration_minutes, base_price"
      )
      .eq("service_status", "active")
      .order("service_name"),
  ]);

  const resolvedCategories =
    categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const resolvedServices =
    services && services.length > 0 ? services : FALLBACK_SERVICES;

  return (
    <ServicesCatalog
      categories={resolvedCategories}
      services={resolvedServices}
    />
  );
}
