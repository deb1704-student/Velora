"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import Hero3DVideo from "./components/Hero3DVideo";



const services = [
  {
    number: "01",
    name: "HAIR",
    detail: "Precision cuts, bespoke colour, balayage & architectural blowout rituals",
    image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=85",
    tags: ["BALAYAGE", "BLOWOUT", "REPAIR"],
  },
  {
    number: "02",
    name: "SKIN",
    detail: "Clinical hydra-facials, barrier repair, glycolic peel & collagen infusions",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
    tags: ["HYDRA-FACIAL", "COLLAGEN", "PEELS"],
  },
  {
    number: "03",
    name: "NAILS",
    detail: "Artisanal manicures, structural gel overlays & signature nail architecture",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
    tags: ["GEL ART", "MANICURE", "MINERAL SPA"],
  },
  {
    number: "04",
    name: "WELLNESS",
    detail: "Targeted aromatherapy, hot stone therapy, Swedish tension release & calm",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85",
    tags: ["SWEDISH", "HOT STONE", "AROMA"],
  },
];

const salons = [
  {
    code: "LOC_01",
    name: "The Rose Atelier",
    city: "Mumbai",
    address: "Waterfield Road, Bandra West",
    category: "HAIR, BESPOKE COLOUR & MAKEUP",
    hours: "10:00 — 20:30 · TUE TO SUN",
    capacity: "8 PRIVATE SUITES",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85",
  },
  {
    code: "LOC_02",
    name: "Maison de Beauté",
    city: "Bengaluru",
    address: "100ft Road, Indiranagar",
    category: "CLINICAL SKIN & HOLISTIC WELLNESS",
    hours: "09:30 — 21:00 · DAILY",
    capacity: "12 TREATMENT SUITES",
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=85",
  },
  {
    code: "LOC_03",
    name: "The Pink Room",
    city: "New Delhi",
    address: "Block M, South Extension II",
    category: "NAIL ARTISANS & LUXURY CARE",
    hours: "10:00 — 20:00 · TUE TO SUN",
    capacity: "6 SPECIALIST STATIONS",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=85",
  },
];

const protocols = [
  {
    id: "01",
    title: "BESPOKE CONSULTATION & EXPERT ARTISTRY",
    summary: "Every appointment begins with a personal consultation to understand your hair texture, skin needs, and personal style.",
    detail: "Your dedicated master colorist or aesthetic specialist tailors custom formulations and treatments designed to accentuate your natural beauty and lifestyle.",
  },
  {
    id: "02",
    title: "SERENE SUITES & CLEAN BOTANICAL FORMULAS",
    summary: "Impeccably sanitized private suites, calming aromatherapy, and clean luxury botanicals free of harsh sulfates or parabens.",
    detail: "We cultivate a tranquil haven with unhurried appointments, European organic hair and skin lines, and hospitality-grade cleanliness for complete peace of mind.",
  },
  {
    id: "03",
    title: "HONEST LUXURY & TRANSPARENT PRICING",
    summary: "All-inclusive pricing with complete transparency—no hidden service fees, unexpected surcharges, or forced gratuity.",
    detail: "The rate you see is the rate you settle upon completion at the atelier via UPI, Card, or Cash. Enjoy flexible scheduling with complimentary cancellations up to 2 hours prior.",
  },
];

export default function Home() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Interactive state
  const [activeSalonIndex, setActiveSalonIndex] = useState(0);
  const [openProtocolIndex, setOpenProtocolIndex] = useState<number | null>(0);

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
    <main className="min-h-screen bg-[#F8F4E7] text-[#342925] overflow-x-hidden">
      {/* Interactive Continuous Motion Ticker */}
      <div className="overflow-hidden border-b border-[#722F37]/20 bg-[#722F37] py-2.5 font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-[#F8F4E7]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          <span className="flex items-center gap-8 px-4">
            <span>HAUTE COIFFURE</span>
            <span>·</span>
            <span>BESPOKE BEAUTY RITUALS</span>
            <span>·</span>
            <span>CURATED ATELIERS</span>
            <span>·</span>
            <span>SIGNATURE STYLING</span>
            <span>·</span>
            <span>EFFORTLESS BOOKING</span>
            <span>·</span>
            <span>TIMELESS ELEGANCE</span>
            <span>·</span>
          </span>
          <span className="flex items-center gap-8 px-4">
            <span>HAUTE COIFFURE</span>
            <span>·</span>
            <span>BESPOKE BEAUTY RITUALS</span>
            <span>·</span>
            <span>CURATED ATELIERS</span>
            <span>·</span>
            <span>SIGNATURE STYLING</span>
            <span>·</span>
            <span>EFFORTLESS BOOKING</span>
            <span>·</span>
            <span>TIMELESS ELEGANCE</span>
            <span>·</span>
          </span>
        </motion.div>
      </div>

      {/* Main Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#722F37]/15 bg-[#F8F4E7]/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="text-2xl font-black tracking-[-0.04em] text-[#722F37]">
              ÉLAN
            </span>
            <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#776760] uppercase">
              STUDIOS / 2026
            </span>
          </Link>

          <div className="hidden items-center gap-10 font-mono text-[11px] font-bold tracking-[0.2em] text-[#492E2D] uppercase md:flex">
            <a href="#services" className="transition hover:text-[#722F37]">
              SERVICES
            </a>
            <a href="#ateliers" className="transition hover:text-[#722F37]">
              ATELIERS
            </a>
            <a href="#protocols" className="transition hover:text-[#722F37]">
              PROMISE
            </a>
            <a href="#manifesto" className="transition hover:text-[#722F37]">
              PHILOSOPHY
            </a>
          </div>

          <div className="flex items-center gap-3">
            {!authLoading && userEmail ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden border border-[#722F37]/25 px-4 py-2.5 font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-[#722F37] transition hover:border-[#722F37] sm:block"
                >
                  DASHBOARD
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="bg-[#722F37] px-4 py-2.5 font-mono text-[11px] font-bold tracking-[0.16em] uppercase text-white transition hover:bg-[#57232B] disabled:opacity-50"
                >
                  {signingOut ? "..." : "SIGN OUT"}
                </button>
              </>
            ) : !authLoading ? (
              <>
                <Link
                  href="/login"
                  className="hidden px-3 py-2 font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-[#722F37] transition hover:text-[#492E2D] sm:block"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/register"
                  className="border border-[#722F37] bg-[#722F37] px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-white transition hover:bg-[#57232B]"
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

      {/* Hero Section — Strict Swiss Grid with Motion Stagger */}
      <section className="relative isolate border-b border-[#722F37]/15">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
            {/* Left Column: Asymmetrical Typography */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="h-2 w-2 bg-[#722F37]" />
                <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#722F37]">
                  THE 2026 COLLECTION / 01
                </p>
              </div>

              <h1 className="text-5xl font-black tracking-[-0.04em] uppercase text-[#492E2D] sm:text-7xl lg:text-8xl leading-[0.92]">
                HAUTE COIFFURE.
                <br />
                TIMELESS BEAUTY.
                <br />
                <span className="text-[#722F37]">BESPOKE CARE.</span>
              </h1>

              <p className="mt-8 max-w-lg text-base font-normal leading-relaxed text-[#655650] sm:text-lg">
                A curated sanctuary of master stylists, bespoke colorists, and
                rejuvenating aesthetic rituals. Designed for discerning clients
                seeking effortless elegance and transformative care.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/services"
                    className="group flex items-center gap-3 border border-[#722F37] bg-[#722F37] px-8 py-4 font-mono text-xs font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#57232B]"
                  >
                    EXPLORE RITUALS
                    <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#ateliers"
                  className="border border-[#722F37]/30 px-7 py-4 font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#722F37] transition hover:border-[#722F37] hover:bg-white/40"
                >
                  OUR ATELIERS
                </motion.a>
              </div>
            </motion.div>

            {/* Right Column: Hero Visual with 3D Video Viewfinder & Motion Experience */}
            <div className="lg:col-span-5">
              <Hero3DVideo />
            </div>
          </div>
        </div>
      </section>

      {/* Structural Data Grid (3-Columns) */}
      <section className="grid grid-cols-1 border-b border-[#722F37]/15 bg-[#F1E8DC] sm:grid-cols-3">
        {[
          ["01", "CURATED EXCELLENCE", "Handpicked luxury ateliers selected for exceptional artistry, serene ambiance, and unparalleled hospitality."],
          ["02", "MASTER ARTISANS", "Direct access to leading master colorists, clinical facialists, and restorative wellness practitioners."],
          ["03", "EFFORTLESS RESERVATIONS", "Instant calendar scheduling with guaranteed appointments, zero wait times, and transparent pricing."],
        ].map(([index, title, detail]) => (
          <motion.div
            key={title}
            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.4)" }}
            transition={{ duration: 0.2 }}
            className="flex flex-col justify-between border-b border-[#722F37]/15 p-8 sm:border-b-0 sm:border-r last:border-r-0 cursor-default"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#722F37]">
              <span>[ {index} ]</span>
              <span className="text-[10px] tracking-[0.2em] uppercase opacity-60">
                PILLAR
              </span>
            </div>
            <div className="mt-8">
              <h3 className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#722F37]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#776760]">
                {detail}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Disciplines Section with Interactive Card Hover */}
      <section id="services" className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
        <div className="mb-12 flex flex-col justify-between gap-4 border-b border-[#722F37]/20 pb-6 md:flex-row md:items-end">
          <div>
            <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#722F37]">
              SIGNATURE SERVICES / 02
            </span>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.03em] uppercase text-[#492E2D] sm:text-5xl">
              THE BEAUTY COLLECTION.
            </h2>
          </div>
          <Link
            href="/services"
            className="group flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#722F37] hover:text-[#492E2D]"
          >
            <span>EXPLORE FULL MENU [ 08 RITUALS ]</span>
            <ArrowUpRight
              size={16}
              className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <motion.div
              key={service.name}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Link
                href="/services"
                className="group flex flex-col h-full border border-[#722F37]/20 bg-white transition hover:border-[#722F37] hover:shadow-md"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#302326]">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="absolute inset-0 h-full w-full object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                  <div className="absolute left-3 top-3 bg-[#722F37] px-2.5 py-1 font-mono text-[10px] font-bold text-white">
                    {service.number}
                  </div>
                </div>
                <div className="flex flex-col justify-between flex-1 p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black tracking-tight text-[#492E2D]">
                        {service.name}
                      </h3>
                      <ArrowRight
                        size={16}
                        className="text-[#722F37] opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </div>
                    <p className="mt-2.5 text-xs leading-relaxed text-[#776760]">
                      {service.detail}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5 pt-4 border-t border-[#722F37]/10 font-mono text-[9px] uppercase text-[#722F37]">
                    {service.tags.map((tag) => (
                      <span key={tag} className="border border-[#722F37]/20 px-1.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive Atelier Showcase (Interactive Tabs) */}
      <section id="ateliers" className="border-y border-[#722F37]/15 bg-[#F1E8DC] py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-[#722F37]/20 pb-6 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#722F37]">
                OUR SANCTUARIES / 03
              </span>
              <h2 className="mt-2 text-4xl font-black tracking-[-0.03em] uppercase text-[#492E2D] sm:text-5xl">
                PREMIER ATELIERS.
              </h2>
            </div>
            {/* Interactive City Selector Pills */}
            <div className="flex gap-2">
              {salons.map((salon, idx) => (
                <button
                  key={salon.code}
                  onClick={() => setActiveSalonIndex(idx)}
                  className={`border px-4 py-2 font-mono text-xs font-bold tracking-[0.15em] uppercase transition ${
                    activeSalonIndex === idx
                      ? "border-[#722F37] bg-[#722F37] text-white"
                      : "border-[#722F37]/20 bg-white text-[#492E2D] hover:border-[#722F37]"
                  }`}
                >
                  {salon.city}
                </button>
              ))}
            </div>
          </div>

          {/* Active Atelier Detailed Display */}
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12">
            <div className="border border-[#722F37]/20 bg-white p-8 lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#722F37]/10 pb-3 font-mono text-xs font-bold text-[#722F37]">
                  <span>[ {salons[activeSalonIndex].code} ]</span>
                  <span>{salons[activeSalonIndex].city.toUpperCase()}</span>
                </div>

                <h3 className="mt-6 text-3xl font-black uppercase tracking-tight text-[#492E2D] sm:text-4xl">
                  {salons[activeSalonIndex].name}
                </h3>

                <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-[#722F37]">
                  {salons[activeSalonIndex].category}
                </p>

                <div className="mt-8 space-y-4 font-mono text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-[#722F37] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#776760] uppercase">ATELIER LOCATION</p>
                      <p className="font-bold text-[#302326]">{salons[activeSalonIndex].address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-[#722F37] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#776760] uppercase">OPENING HOURS</p>
                      <p className="font-bold text-[#302326]">{salons[activeSalonIndex].hours}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck size={16} className="text-[#722F37] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#776760] uppercase">SUITE AMENITIES</p>
                      <p className="font-bold text-[#302326]">{salons[activeSalonIndex].capacity}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-[#722F37]/10">
                <Link
                  href="/services"
                  className="flex items-center justify-center gap-3 border border-[#722F37] bg-[#722F37] py-4 text-center font-mono text-xs font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#57232B]"
                >
                  RESERVE AT {salons[activeSalonIndex].name.toUpperCase()}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Atelier Photography with AnimatePresence */}
            <div className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto overflow-hidden border border-[#722F37]/20 bg-[#302326]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={salons[activeSalonIndex].image}
                  src={salons[activeSalonIndex].image}
                  alt={salons[activeSalonIndex].name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0 h-full w-full object-cover grayscale contrast-125 transition duration-700 hover:grayscale-0"
                />
              </AnimatePresence>
              <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                ATELIER INTERIOR
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive System Protocols Accordion */}
      <section id="protocols" className="mx-auto max-w-7xl px-6 py-24 sm:px-10">
        <div className="mb-12 border-b border-[#722F37]/20 pb-6">
          <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#722F37]">
            THE ÉLAN STANDARD / 04
          </span>
          <h2 className="mt-2 text-4xl font-black tracking-[-0.03em] uppercase text-[#492E2D] sm:text-5xl">
            OUR GUEST PROMISE.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#776760]">
            Click any promise to learn how we personalize every detail of your salon journey.
          </p>
        </div>

        <div className="border-t border-[#722F37]/20">
          {protocols.map((protocol, index) => {
            const isOpen = openProtocolIndex === index;
            return (
              <div
                key={protocol.id}
                className="border-b border-[#722F37]/20 transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenProtocolIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between py-6 text-left"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-xs font-bold text-[#722F37]">
                      [ {protocol.id} ]
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#492E2D] sm:text-2xl">
                      {protocol.title}
                    </h3>
                  </div>
                  <div className="ml-4 shrink-0 border border-[#722F37]/30 p-2 text-[#722F37] transition hover:border-[#722F37]">
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden pb-6"
                    >
                      <div className="border-l-2 border-[#722F37] pl-6 text-sm text-[#655650] max-w-3xl">
                        <p className="font-semibold text-[#302326]">
                          {protocol.summary}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-[#776760]">
                          {protocol.detail}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Manifesto / Philosophy Section (Burgundy with High-Contrast Button) */}
      <section id="manifesto" className="border-y border-[#722F37]/15 bg-[#722F37] text-[#F8F4E7]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-[#D7A7B1]">
                OUR PHILOSOPHY / 05
              </span>
              <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] uppercase text-white sm:text-6xl leading-[0.94]">
                PURPOSEFUL LUXURY.
                <br />
                UNHURRIED BEAUTY.
              </h2>
              <p className="mt-8 max-w-2xl text-base font-normal leading-relaxed text-[#F8F4E7]/80 sm:text-lg">
                True beauty is an intentional ritual of restoration. We reject
                hurried appointments and impersonal salons in favor of master craftsmanship,
                quiet luxury, and extraordinary care in every touch.
              </p>
              <div className="mt-10">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-3 border-2 border-[#F8F4E7] bg-[#F8F4E7] px-8 py-4 font-mono text-xs font-black tracking-[0.2em] uppercase transition hover:bg-transparent hover:!text-[#F8F4E7]"
                    style={{ color: "#492E2D" }}
                  >
                    <span className="font-black text-[#492E2D]">DISCOVER OUR SERVICES</span>
                    <ArrowRight size={16} className="text-[#492E2D]" />
                  </Link>
                </motion.div>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-4 font-mono text-xs border-t lg:border-t-0 lg:border-l border-white/20 pt-8 lg:pt-0 lg:pl-10">
              <div className="border-b border-white/15 pb-4">
                <p className="text-[10px] tracking-[0.25em] text-[#D7A7B1] uppercase">PREMIER DESTINATIONS</p>
                <p className="mt-1 text-sm font-semibold">METROPOLITAN HUBS</p>
              </div>
              <div className="border-b border-white/15 pb-4">
                <p className="text-[10px] tracking-[0.25em] text-[#D7A7B1] uppercase">HANDPICKED SALONS</p>
                <p className="mt-1 text-sm font-semibold">BOUTIQUE ATELIERS</p>
              </div>
              <div className="pb-2">
                <p className="text-[10px] tracking-[0.25em] text-[#D7A7B1] uppercase">EXPERIENCE</p>
                <p className="mt-1 text-sm font-semibold">BESPOKE VIP SESSIONS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Minimalist Footer */}
      <footer className="border-t border-[#722F37]/20 bg-[#492E2D] px-6 py-16 text-[#F8F4E7] sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <h2 className="text-3xl font-black tracking-[-0.04em]">ÉLAN</h2>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#F8F4E7]/70">
              A curated luxury coiffure and aesthetic wellness destination. Unhurried
              treatments, master practitioners, and effortless salon reservations.
            </p>
            <p className="mt-6 font-mono text-[10px] tracking-[0.2em] text-[#D7A7B1] uppercase">
              HAUTE COIFFURE & LUXURY SALONS · 2026
            </p>
          </div>

          <div>
            <h3 className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#D7A7B1] uppercase">
              EXPERIENCES
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 font-mono text-xs text-[#F8F4E7]/80">
              <Link href="/services" className="hover:text-white">SIGNATURE SERVICES</Link>
              <Link href="/#ateliers" className="hover:text-white">OUR ATELIERS</Link>
              <Link href="/dashboard" className="hover:text-white">MY APPOINTMENTS</Link>
              <Link href="/login" className="hover:text-white">SIGN IN</Link>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-[10px] font-bold tracking-[0.25em] text-[#D7A7B1] uppercase">
              GUEST CONCIERGE
            </h3>
            <p className="mt-4 font-mono text-xs leading-relaxed text-[#F8F4E7]/70">
              OPENING HOURS: 09:30 — 20:30
              <br />
              CONCIERGE@ELANSTUDIOS.COM
              <br />
              PRIVATE SESSIONS AVAILABLE
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-7xl flex-col justify-between border-t border-white/10 pt-6 font-mono text-[10px] tracking-[0.16em] uppercase text-white/40 sm:flex-row">
          <span>© 2026 ÉLAN STUDIOS. ALL RIGHTS RESERVED.</span>
          <span>HAUTE BEAUTÉ & WELLNESS</span>
        </div>
      </footer>
    </main>
  );
}
