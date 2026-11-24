
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Search, Sparkles } from "lucide-react";

type Category = {
  id: string;
  category_name: string;
  description: string | null;
};

type Service = {
  id: string;
  category_id: string;
  service_name: string;
  description: string | null;
  duration_minutes: number;
  base_price: number;
};

type Props = {
  categories: Category[];
  services: Service[];
};

export default function ServicesCatalog({
  categories,
  services,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === "all" ||
        service.category_id === selectedCategory;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        service.service_name.toLowerCase().includes(searchText) ||
        (service.description ?? "").toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, search]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(price));

  return (
    <main className="min-h-screen bg-[#F8F4E7]">
      <section className="bg-[#722F37] px-6 py-20 text-center text-[#F8F4E7]">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#D7A7B1]">
            The ÉLAN Experience
          </p>

          <h1 className="font-serif text-5xl md:text-6xl">
            Our Services
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#F8F4E7]/80">
            Discover beauty and wellness experiences designed
            to help you look and feel your best.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#722F37]">
              Find your experience
            </p>
            <h2 className="font-serif text-3xl text-[#722F37]">
              Explore the collection
            </h2>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services..."
              className="w-full rounded-full border border-[#D7A7B1] bg-white py-3 pl-11 pr-5 text-sm outline-none transition focus:border-[#722F37] focus:ring-2 focus:ring-[#722F37]/10"
            />
          </div>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full border px-5 py-2.5 text-sm transition ${
              selectedCategory === "all"
                ? "border-[#722F37] bg-[#722F37] text-white"
                : "border-[#D7A7B1] text-[#722F37] hover:bg-[#D7A7B1]/20"
            }`}
          >
            All services
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full border px-5 py-2.5 text-sm transition ${
                selectedCategory === category.id
                  ? "border-[#722F37] bg-[#722F37] text-white"
                  : "border-[#D7A7B1] text-[#722F37] hover:bg-[#D7A7B1]/20"
              }`}
            >
              {category.category_name}
            </button>
          ))}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredServices.length} services found
          </p>
          <Sparkles size={20} className="text-[#722F37]" />
        </div>

        {filteredServices.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const category = categories.find(
                (item) => item.id === service.category_id
              );

              return (
                <article
                  key={service.id}
                  className="group rounded-2xl border border-[#D7A7B1]/50 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#A36A75]">
                    {category?.category_name ?? "Beauty service"}
                  </p>

                  <h3 className="font-serif text-2xl text-[#722F37]">
                    {service.service_name}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">
                    {service.description ||
                      "Discover this professional salon service."}
                  </p>

                  <div className="mt-7 flex items-center justify-between border-t border-[#F0E5E3] pt-5">
                    <div>
                      <p className="text-xs text-gray-500">Starting from</p>
                      <p className="mt-1 text-xl font-semibold text-[#722F37]">
                        {formatPrice(service.base_price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock size={16} />
                      {service.duration_minutes} min
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#D7A7B1] bg-white/60 px-6 py-16 text-center">
            <Search className="mx-auto mb-4 text-[#722F37]" size={30} />
            <h3 className="font-serif text-2xl text-[#722F37]">
              No services found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try another search or select a different category.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-5 text-sm font-semibold text-[#722F37] underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <section className="bg-[#EBD9D9] px-6 py-14 text-center">
        <h2 className="font-serif text-3xl text-[#722F37]">
          Your beauty journey starts here.
        </h2>
        <p className="mt-3 text-sm text-[#722F37]/80">
          Explore our salon experiences and find the right service for you.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-[#722F37] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#542129]"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
