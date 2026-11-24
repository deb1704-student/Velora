
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ServicesCatalog from "./ServicesCatalog";

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

  const [{ data: categories, error: categoryError }, { data: services, error: serviceError }] =
    await Promise.all([
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

  if (categoryError || serviceError) {
    return (
      <main className="min-h-screen bg-[#F8F4E7] px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold text-[#722F37]">
          Services are temporarily unavailable
        </h1>
        <p className="mt-4 text-gray-600">
          Please try again in a moment.
        </p>
      </main>
    );
  }

  return (
    <ServicesCatalog
      categories={categories ?? []}
      services={services ?? []}
    />
  );
}
