"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Search, ArrowRight, ArrowLeft } from "lucide-react";

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

export default function ServicesCatalog({ categories, services }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === "all" || service.category_id === selectedCategory;

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
    <main className="min-h-screen bg-[#F8F4E7] text-[#342925]">
      {/* Top Header Banner */}
      <section className="border-b border-[#722F37]/20 bg-[#722F37] px-6 py-16 text-[#F8F4E7] sm:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-[#D7A7B1] hover:text-white"
            >
              <ArrowLeft size={14} />
              RETURN TO STUDIOS
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#D7A7B1]">
                THE 2026 COLLECTION
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.035em] uppercase sm:text-6xl lg:text-7xl leading-none">
                SIGNATURE EXPERIENCES.
              </h1>
            </div>
            <p className="max-w-md font-mono text-xs leading-relaxed text-[#F8F4E7]/80 uppercase tracking-wider">
              EXPLORE {services.length} BESPOKE TREATMENTS
              <br />
              COMPLIMENTARY CONSULTATION INCLUDED
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Controls */}
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`border px-5 py-2.5 font-mono text-xs font-bold tracking-[0.16em] uppercase transition ${
                selectedCategory === "all"
                  ? "border-[#722F37] bg-[#722F37] text-white"
                  : "border-[#722F37]/20 bg-white text-[#492E2D] hover:border-[#722F37]"
              }`}
            >
              ALL [ {services.length} ]
            </button>
            {categories.map((category) => {
              const count = services.filter(
                (s) => s.category_id === category.id
              ).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`border px-5 py-2.5 font-mono text-xs font-bold tracking-[0.16em] uppercase transition ${
                    selectedCategory === category.id
                      ? "border-[#722F37] bg-[#722F37] text-white"
                      : "border-[#722F37]/20 bg-white text-[#492E2D] hover:border-[#722F37]"
                  }`}
                >
                  {category.category_name} [ {count} ]
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#722F37]/60"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="SEARCH BY TREATMENT OR STYLE..."
              className="w-full border border-[#722F37]/25 bg-white py-3 pl-11 pr-4 font-mono text-xs uppercase tracking-wider text-[#302326] outline-none transition focus:border-[#722F37]"
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-12">
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service, index) => {
                const category = categories.find(
                  (c) => c.id === service.category_id
                );

                return (
                  <article
                    key={service.id}
                    className="flex flex-col justify-between border border-[#722F37]/20 bg-white p-7 transition hover:border-[#722F37]"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-[#722F37]/10 pb-3 font-mono text-[11px] font-bold uppercase tracking-wider text-[#722F37]">
                        <span>[ {String(index + 1).padStart(2, "0")} ]</span>
                        <span>{category?.category_name ?? "SERVICE"}</span>
                      </div>

                      <h3 className="mt-5 text-2xl font-black tracking-tight text-[#492E2D]">
                        {service.service_name}
                      </h3>

                      <p className="mt-3 text-xs leading-relaxed text-[#776760]">
                        {service.description ||
                          "An indulgent, bespoke treatment crafted for lasting radiance and vitality."}
                      </p>
                    </div>

                    <div className="mt-8 border-t border-[#722F37]/10 pt-5">
                      <div className="flex items-end justify-between font-mono">
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-[#776760]">
                            TREATMENT PRICE
                          </p>
                          <p className="mt-1 text-2xl font-bold text-[#722F37]">
                            {formatPrice(service.base_price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#776760]">
                          <Clock size={14} />
                          <span>{service.duration_minutes} MIN</span>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Link
                          href={`/book/${service.id}`}
                          className="group flex w-full items-center justify-center gap-2 border border-[#722F37] bg-[#722F37] py-3.5 text-center font-mono text-xs font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#57232B]"
                        >
                          <span>BOOK APPOINTMENT</span>
                          <ArrowRight
                            size={14}
                            className="transition group-hover:translate-x-1"
                          />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-[#722F37]/30 bg-white/50 p-16 text-center">
              <p className="font-mono text-xs font-bold tracking-[0.25em] uppercase text-[#722F37]">
                NO TREATMENTS FOUND
              </p>
              <h3 className="mt-3 text-3xl font-black uppercase text-[#492E2D]">
                TRY ANOTHER SEARCH
              </h3>
              <p className="mt-2 text-xs text-gray-500">
                Try searching for blowout, facial, balayage, or manicure.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("all");
                }}
                className="mt-6 border border-[#722F37] px-6 py-2.5 font-mono text-xs font-bold tracking-[0.18em] uppercase text-[#722F37] transition hover:bg-[#722F37] hover:text-white"
              >
                VIEW ALL TREATMENTS
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
