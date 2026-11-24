"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowUpRight, ArrowRight } from "lucide-react";

const services = [
  {
    number: "01",
    name: "HAIR",
    detail: "Precision cuts, bespoke colour & structural styling",
    image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "02",
    name: "SKIN",
    detail: "Clinical hydra-facials, barrier repair & active rituals",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "03",
    name: "NAILS",
    detail: "Artisanal manicures, structural gel & architectural art",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "04",
    name: "WELLNESS",
    detail: "Targeted aromatherapy, deep tension release & rest",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85",
  },
];

const salons = [
  {
    code: "LOC_01",
    name: "The Rose Atelier",
    location: "Bandra West, Mumbai",
    category: "HAIR & BEAUTY",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85",
  },
  {
    code: "LOC_02",
    name: "Maison de Beauté",
    location: "Indiranagar, Bengaluru",
    category: "SKIN & WELLNESS",
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1000&q=85",
  },
  {
    code: "LOC_03",
    name: "The Pink Room",
    location: "South Delhi, New Delhi",
    category: "NAILS & BEAUTY",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=85",
  },
];

export default function Home() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email ?? null);
      setAuthLoading(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    setSigningOut(false);

    if (error) {
      alert(error.message);
      return;
    }

    setUserEmail(null);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#F8F4E7] text-[#342925]">
      {/* Top Banner / Ticker */}
      <div className="border-b border-[#722F37]/15 bg-[#722F37] px-4 py-2.5 text-center font-mono text-[11px] font-medium tracking-[0.22em] text-[#F8F4E7] uppercase">
        PRECISION CARE · CURATED SALONS · BESPOKE APPOINTMENTS
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-[#722F37]/15 bg-[#F8F4E7]/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4.5 sm:px-10">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="text-2xl font-black tracking-[-0.04em] text-[#722F37]">
              ÉLAN
            </span>
            <span className="font-mono text-[10px] font-semibold tracking-[0.25em] text-[#776760] uppercase">
              STUDIOS / 2026
            </span>
          </Link>

          <div className="hidden items-center gap-10 font-mono text-[11px] font-semibold tracking-[0.2em] text-[#492E2D] uppercase md:flex">
            <a href="#services" className="transition hover:text-[#722F37]">
              SERVICES
            </a>
            <a href="#salons" className="transition hover:text-[#722F37]">
              DIRECTORY
            </a>
            <a href="#about" className="transition hover:text-[#722F37]">
              MANIFESTO
            </a>
          </div>

          <div className="flex items-center gap-3">
            {!authLoading && userEmail ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden border border-[#722F37]/25 px-4 py-2.5 font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-[#722F37] transition hover:border-[#722F37] sm:block"
                >
                  DASHBOARD
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="bg-[#722F37] px-4 py-2.5 font-mono text-[11px] font-semibold tracking-[0.16em] uppercase text-white transition hover:bg-[#57232B] disabled:opacity-50"
                >
                  {signingOut ? "SIGNING OUT" : "SIGN OUT"}
                </button>
              </>
            ) : !authLoading ? (
              <>
                <Link
                  href="/login"
                  className="hidden px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[#722F37] transition hover:text-[#492E2D] sm:block"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/register"
                  className="border border-[#722F37] bg-[#722F37] px-5 py-2.5 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-white transition hover:bg-[#57232B]"
                >
                  REGISTER
                </Link>
              </>
            ) : (
              <span className="font-mono text-[11px] tracking-[0.18em] text-[#776760]">
                ...
              </span>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section — Strict Swiss Poster Layout */}
      <section className="relative isolate border-b border-[#722F37]/15">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-28">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            {/* Left Asymmetric Title Block */}
            <div className="lg:col-span-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-2 w-2 bg-[#722F37]" />
                <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#722F37]">
                  SYSTEM SPECIFICATION / 01
                </p>
              </div>

              <h1 className="text-5xl font-black tracking-[-0.04em] uppercase text-[#492E2D] sm:text-7xl lg:text-8xl leading-[0.92]">
                BEAUTY AS
                <br />
                ARCHITECTURE.
                <br />
                <span className="text-[#722F37]">PRECISION CARE.</span>
              </h1>

              <p className="mt-8 max-w-xl text-base font-normal leading-relaxed text-[#655650] sm:text-lg">
                A structured management network linking refined salons, verified
                specialists, and discerning clients. Pure form, zero friction,
                and meticulous execution.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/services"
                  className="group flex items-center gap-3 border border-[#722F37] bg-[#722F37] px-8 py-4 font-mono text-xs font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#57232B]"
                >
                  VIEW CATALOGUE
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </Link>
                <a
                  href="#about"
                  className="border border-[#722F37]/30 px-7 py-4 font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#722F37] transition hover:border-[#722F37] hover:bg-white/40"
                >
                  SYSTEM PHILOSOPHY
                </a>
              </div>
            </div>

            {/* Right Asymmetrical Visual Block */}
            <div className="lg:col-span-4">
              <div className="relative border border-[#722F37]/20 bg-[#F1E8DC] p-3">
                <div
                  className="aspect-[3/4] w-full bg-cover bg-center grayscale contrast-125 transition duration-500 hover:grayscale-0"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1633681926022-84c23e8cb2d5?auto=format&fit=crop&w=1200&q=90')",
                  }}
                />
                <div className="mt-3 flex items-center justify-between border-t border-[#722F37]/15 pt-2.5 font-mono text-[10px] tracking-[0.2em] uppercase text-[#722F37]">
                  <span>FIG. 01 — FORM & TEXTURE</span>
                  <span>EST. 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structural Data Grid (3-Columns) */}
      <section className="grid grid-cols-1 border-b border-[#722F37]/15 bg-[#F1E8DC] sm:grid-cols-3">
        {[
          ["01", "CURATED STANDARDS", "Strict salon audit and verified service criteria."],
          ["02", "VERIFIED MASTERY", "Tiered practitioners matched to specific client rituals."],
          ["03", "DIRECT RESERVATION", "Instant slot scheduling with transparent pricing models."],
        ].map(([index, title, detail]) => (
          <div
            key={title}
            className="flex flex-col justify-between border-b border-[#722F37]/15 p-8 sm:border-b-0 sm:border-r last:border-r-0"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#722F37]">
              <span>[ {index} ]</span>
              <span className="text-[10px] tracking-[0.2em] uppercase opacity-60">CRITERION</span>
            </div>
            <div className="mt-8">
              <h3 className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#722F37]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#776760]">
                {detail}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Disciplines / Categories */}
      <section id="services" className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
        <div className="mb-12 flex flex-col justify-between gap-4 border-b border-[#722F37]/20 pb-6 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#722F37]">
              DISCIPLINES / 02
            </span>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.03em] uppercase text-[#492E2D] sm:text-5xl">
              CURATED RITUALS.
            </h2>
          </div>
          <Link
            href="/services"
            className="group flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#722F37] hover:text-[#492E2D]"
          >
            ALL SERVICES [ 08 ]
            <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              href="/services"
              key={service.name}
              className="group flex flex-col border border-[#722F37]/20 bg-white transition hover:border-[#722F37]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#D7A7B1]">
                <div
                  className="h-full w-full bg-cover bg-center grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  style={{ backgroundImage: `url('${service.image}')` }}
                />
                <div className="absolute left-3 top-3 bg-[#722F37] px-2.5 py-1 font-mono text-[10px] font-bold text-white">
                  {service.number}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight text-[#492E2D]">
                    {service.name}
                  </h3>
                  <ArrowRight
                    size={16}
                    className="text-[#722F37] opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#776760]">
                  {service.detail}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Manifesto / Philosophy (High-Contrast Burgundy Block) */}
      <section id="about" className="border-y border-[#722F37]/15 bg-[#722F37] text-[#F8F4E7]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#D7A7B1]">
                MANIFESTO / 03
              </span>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] uppercase text-white sm:text-6xl leading-[0.94]">
                ORDER. FORM.
                <br />
                ELEVATION.
              </h2>
              <p className="mt-8 max-w-2xl text-base font-normal leading-relaxed text-[#F8F4E7]/80 sm:text-lg">
                Self-care is not indulgence; it is structural balance. We reject
                ornamental noise in favor of high-performing professionals,
                intentional formulas, and uncompromised precision in every single ritual.
              </p>
              <div className="mt-10">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-3 border border-white bg-white px-8 py-4 font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#722F37] transition hover:bg-[#F8F4E7]"
                >
                  EXPLORE THE DIRECTORY
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-4 font-mono text-xs border-t lg:border-t-0 lg:border-l border-white/20 pt-8 lg:pt-0 lg:pl-10">
              <div className="border-b border-white/15 pb-4">
                <p className="text-[10px] tracking-[0.25em] text-[#D7A7B1] uppercase">LOCATION SCOPE</p>
                <p className="mt-1 text-sm font-semibold">METROPOLITAN HUBS</p>
              </div>
              <div className="border-b border-white/15 pb-4">
                <p className="text-[10px] tracking-[0.25em] text-[#D7A7B1] uppercase">VERIFIED PARTNERS</p>
                <p className="mt-1 text-sm font-semibold">SELECTED ATELIERS</p>
              </div>
              <div className="pb-2">
                <p className="text-[10px] tracking-[0.25em] text-[#D7A7B1] uppercase">PROTOCOL</p>
                <p className="mt-1 text-sm font-semibold">SCHEDULED RESERVATION</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Salons Directory Grid */}
      <section id="salons" className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
        <div className="mb-12 flex flex-col justify-between gap-4 border-b border-[#722F37]/20 pb-6 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#722F37]">
              SPATIAL ATELIERS / 04
            </span>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.03em] uppercase text-[#492E2D] sm:text-5xl">
              LOCATIONS.
            </h2>
          </div>
          <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#776760]">
            CURRENT AVAILABILITY: MUMBAI · BENGALURU · DELHI
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {salons.map((salon) => (
            <article
              key={salon.name}
              className="group border border-[#722F37]/20 bg-white transition hover:border-[#722F37]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#D7A7B1]">
                <div
                  className="h-full w-full bg-cover bg-center grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  style={{ backgroundImage: `url('${salon.image}')` }}
                />
                <div className="absolute right-3 top-3 bg-black/75 px-2.5 py-1 font-mono text-[9px] font-bold text-white uppercase tracking-wider">
                  {salon.code}
                </div>
              </div>
              <div className="p-6">
                <p className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[#A66D76]">
                  {salon.category}
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#492E2D]">
                  {salon.name}
                </h3>
                <p className="mt-1 font-mono text-xs text-[#776760]">
                  {salon.location}
                </p>
                <Link
                  href="/services"
                  className="mt-6 flex items-center justify-between border-t border-[#722F37]/15 pt-4 font-mono text-xs font-bold tracking-[0.16em] uppercase text-[#722F37] transition hover:text-[#492E2D]"
                >
                  <span>RESERVE ATELIER</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Structured Minimalist Footer */}
      <footer className="border-t border-[#722F37]/20 bg-[#492E2D] px-6 py-16 text-[#F8F4E7] sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <h2 className="text-3xl font-black tracking-[-0.04em]">ÉLAN</h2>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#F8F4E7]/70">
              Swiss-engineered salon management and booking framework. Designed
              with strict typographic harmony, structural clarity, and purposeful luxury.
            </p>
            <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-[#D7A7B1] uppercase">
              VERSION 2.4.0 — PRODUCTION
            </p>
          </div>

          <div>
            <h3 className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#D7A7B1] uppercase">
              NAVIGATION
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 font-mono text-xs text-[#F8F4E7]/80">
              <Link href="/services" className="hover:text-white">SERVICES</Link>
              <Link href="/services" className="hover:text-white">ATELIERS</Link>
              <Link href="/dashboard" className="hover:text-white">DASHBOARD</Link>
              <Link href="/login" className="hover:text-white">SIGN IN</Link>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#D7A7B1] uppercase">
              LEGAL & AUDIT
            </h3>
            <p className="mt-4 font-mono text-xs leading-relaxed text-[#F8F4E7]/70">
              SRS REFERENCE: SSMS-2026
              <br />
              DATA STORES: D01–D19
              <br />
              SECURITY: POSTGRES RLS
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-7xl flex-col justify-between border-t border-white/10 pt-6 font-mono text-[10px] tracking-[0.16em] uppercase text-white/40 sm:flex-row">
          <span>© 2026 ÉLAN STUDIOS. ALL RIGHTS RESERVED.</span>
          <span>SWISS TYPOGRAPHY & DESIGN SYSTEM</span>
        </div>
      </footer>
    </main>
  );
}
