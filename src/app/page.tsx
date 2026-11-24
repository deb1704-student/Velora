
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const services = [
  {
    number: "01",
    name: "Hair",
    detail: "Cuts, colour & styling",
    image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "02",
    name: "Skin",
    detail: "Facials & skin rituals",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "03",
    name: "Nails",
    detail: "Manicures & nail art",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "04",
    name: "Wellness",
    detail: "Massage & relaxation",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85",
  },
];

const salons = [
  {
    name: "The Rose Atelier",
    location: "Bandra West, Mumbai",
    category: "HAIR & BEAUTY",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85",
  },
  {
    name: "Maison de Beauté",
    location: "Indiranagar, Bengaluru",
    category: "SKIN & WELLNESS",
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1000&q=85",
  },
  {
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
      {/* Announcement */}
      <div className="bg-[#722F37] px-4 py-2 text-center text-[10px] tracking-[0.2em] text-[#F8F4E7] sm:text-xs">
        A LITTLE TIME FOR YOURSELF. A BEAUTIFUL DIFFERENCE.
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#722F37]/10 bg-[#F8F4E7]/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="text-2xl font-serif tracking-[0.16em] text-[#722F37]">
            ÉLAN
            <span className="ml-2 block text-[8px] tracking-[0.35em] text-[#8D7770]">
              SALON & BEAUTY
            </span>
          </Link>

          <div className="hidden items-center gap-9 text-[10px] tracking-[0.18em] md:flex">
            <a href="#services" className="transition hover:text-[#A85C69]">SERVICES</a>
            <a href="#salons" className="transition hover:text-[#A85C69]">FIND A SALON</a>
            <a href="#about" className="transition hover:text-[#A85C69]">OUR PHILOSOPHY</a>
          </div>

          <div className="flex items-center gap-3">
            {!authLoading && userEmail ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden text-[10px] tracking-[0.15em] sm:block"
                >
                  MY ACCOUNT
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="border border-[#722F37] px-4 py-3 text-[9px] tracking-[0.14em] text-[#722F37] transition hover:bg-[#722F37] hover:text-white disabled:opacity-50"
                >
                  {signingOut ? "SIGNING OUT..." : "SIGN OUT"}
                </button>
              </>
            ) : !authLoading ? (
              <>
                <Link
                  href="/login"
                  className="hidden text-[10px] tracking-[0.15em] sm:block"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/register"
                  className="bg-[#722F37] px-4 py-3 text-[9px] tracking-[0.14em] text-white transition hover:bg-[#57232B] sm:px-6"
                >
                  CREATE ACCOUNT
                </Link>
              </>
            ) : (
              <span className="text-[9px] tracking-[0.15em] text-[#8D7770]">
                LOADING...
              </span>
            )}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative isolate min-h-[570px] overflow-hidden sm:min-h-[650px]">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1633681926022-84c23e8cb2d5?auto=format&fit=crop&w=2000&q=90')",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#F8F4E7]/95 via-[#F8F4E7]/75 to-[#F8F4E7]/10" />

        <div className="mx-auto flex min-h-[570px] max-w-7xl items-center px-6 py-20 sm:min-h-[650px] sm:px-12">
          <div className="max-w-xl">
            <p className="mb-7 text-[10px] tracking-[0.32em] text-[#722F37]">
              YOUR MOMENT. YOUR BEAUTY. YOUR WAY.
            </p>
            <h1 className="font-serif text-5xl leading-[1.08] tracking-tight text-[#492E2D] sm:text-7xl">
              Beauty is
              <br />
              an art.
              <br />
              <span className="italic text-[#A66D76]">Make it yours.</span>
            </h1>
            <p className="mt-7 max-w-md text-sm leading-7 text-[#655650]">
              Discover exceptional salons, talented professionals and
              thoughtful beauty experiences—all in one place.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                href="/services"
                className="bg-[#722F37] px-8 py-4 text-[10px] tracking-[0.2em] text-white transition hover:bg-[#57232B]"
              >
                EXPLORE SERVICES <span className="ml-3">→</span>
              </Link>
              <a
                href="#about"
                className="border-b border-[#722F37] pb-2 text-[10px] tracking-[0.16em] text-[#722F37]"
              >
                DISCOVER ÉLAN
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 right-8 hidden text-right text-[9px] tracking-[0.2em] text-[#722F37] sm:block">
          <span className="block text-2xl font-serif">01 / 03</span>
          THE BEAUTY EDIT
        </div>
      </section>

      {/* Brand values */}
      <section className="grid grid-cols-1 border-y border-[#722F37]/10 bg-[#F1E8DC] sm:grid-cols-3">
        {[
          ["✧", "CURATED EXPERIENCES", "Discover services worth making time for."],
          ["♡", "TALENTED PROFESSIONALS", "Find the right expert for your needs."],
          ["✳", "EFFORTLESS BOOKING", "Your next appointment, made simple."],
        ].map(([icon, title, detail]) => (
          <div
            key={title}
            className="flex items-center gap-4 border-b border-[#722F37]/10 px-7 py-6 sm:justify-center sm:border-b-0 sm:border-r last:border-r-0"
          >
            <span className="text-2xl text-[#A66D76]">{icon}</span>
            <div>
              <h2 className="text-[9px] tracking-[0.18em] text-[#722F37]">{title}</h2>
              <p className="mt-1 text-xs text-[#776760]">{detail}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-[9px] tracking-[0.28em] text-[#A66D76]">
              A WORLD OF SELF-CARE
            </p>
            <h2 className="font-serif text-4xl text-[#492E2D] sm:text-5xl">
              Find your ritual.
            </h2>
          </div>
          <Link href="/services" className="border-b border-[#722F37] pb-2 text-[9px] tracking-[0.15em] text-[#722F37]">
            VIEW ALL SERVICES →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {services.map((service) => (
            <Link href="/services" key={service.name} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#D7A7B1]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${service.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute left-4 top-4 text-xs text-white/80">{service.number}</span>
                <div className="absolute bottom-5 left-5 text-white">
                  <h3 className="font-serif text-2xl sm:text-3xl">{service.name}</h3>
                  <p className="mt-1 text-[10px] tracking-wide text-white/80">{service.detail}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial banner */}
      <section id="about" className="grid bg-[#722F37] md:grid-cols-2">
        <div className="flex items-center px-8 py-16 text-[#F8F4E7] sm:px-16 sm:py-24">
          <div className="max-w-lg">
            <p className="mb-5 text-[9px] tracking-[0.3em] text-[#D7A7B1]">
              THE ÉLAN PHILOSOPHY
            </p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">
              A little luxury.
              <br />
              <span className="italic text-[#D7A7B1]">A lot of you.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#F8F4E7]/75">
              We believe self-care should feel personal. Find a place,
              professional and experience that makes you feel your best.
            </p>
            <Link
              href="/services"
              className="mt-8 inline-block border border-[#D7A7B1]/70 px-7 py-4 text-[9px] tracking-[0.2em] transition hover:bg-[#F8F4E7] hover:text-[#722F37]"
            >
              FIND YOUR EXPERIENCE →
            </Link>
          </div>
        </div>
        <div
          className="min-h-[320px] bg-cover bg-center md:min-h-[480px]"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1200&q=85')",
          }}
        />
      </section>

      {/* Featured salons */}
      <section id="salons" className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[9px] tracking-[0.28em] text-[#A66D76]">
            PLACES TO FEEL BEAUTIFUL
          </p>
          <h2 className="font-serif text-4xl text-[#492E2D] sm:text-5xl">
            Discover beautiful spaces.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#776760]">
            Explore our selection of salons and beauty professionals.
          </p>
        </div>

        <div className="grid gap-7 sm:grid-cols-3">
          {salons.map((salon) => (
            <article key={salon.name} className="group">
              <div className="aspect-[5/4] overflow-hidden bg-[#D7A7B1]">
                <div
                  className="h-full w-full bg-cover bg-center transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${salon.image}')` }}
                />
              </div>
              <div className="flex items-center justify-between pt-5">
                <p className="text-[9px] tracking-[0.18em] text-[#A66D76]">{salon.category}</p>
                <span className="text-xs text-[#A66D76]">✧</span>
              </div>
              <h3 className="mt-2 font-serif text-2xl text-[#492E2D]">{salon.name}</h3>
              <p className="mt-2 text-xs text-[#776760]">{salon.location}</p>
              <Link href="/services" className="mt-4 inline-block border-b border-[#722F37]/50 pb-1 text-[9px] tracking-[0.15em] text-[#722F37]">
                EXPLORE SALON →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Booking CTA */}
      <section className="bg-[#D7A7B1] px-6 py-20 text-center sm:py-24">
        <p className="mb-4 text-[9px] tracking-[0.28em] text-[#722F37]">
          YOUR NEXT CHAPTER OF SELF-CARE
        </p>
        <h2 className="font-serif text-4xl leading-tight text-[#492E2D] sm:text-6xl">
          Make time for you.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-[#594442]">
          Your perfect salon experience is just a few steps away.
        </p>
        <Link
          href="/services"
          className="mt-8 inline-block bg-[#722F37] px-9 py-4 text-[10px] tracking-[0.2em] text-white transition hover:bg-[#57232B]"
        >
          START EXPLORING →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-[#492E2D] px-6 py-12 text-[#F8F4E7] sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-3">
          <div>
            <h2 className="font-serif text-3xl tracking-[0.15em]">ÉLAN</h2>
            <p className="mt-3 max-w-xs text-xs leading-6 text-white/60">
              A thoughtful destination for salons, beauty professionals and
              people who value a little time for themselves.
            </p>
          </div>
          <div>
            <h3 className="text-[9px] tracking-[0.2em] text-[#D7A7B1]">EXPLORE</h3>
            <div className="mt-4 flex flex-col gap-3 text-xs text-white/75">
              <Link href="/services">Services</Link>
              <Link href="/salons">Find a salon</Link>
              <Link href="/login">Sign in</Link>
              <Link href="/register">Create an account</Link>
            </div>
          </div>
          <div>
            <h3 className="text-[9px] tracking-[0.2em] text-[#D7A7B1]">YOUR EXPERIENCE</h3>
            <p className="mt-4 text-xs leading-6 text-white/65">
              Discover. Choose. Book. Enjoy.
              <br />
              Your beauty journey begins here.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-7xl border-t border-white/15 pt-6 text-[9px] tracking-[0.12em] text-white/45">
          © 2026 ÉLAN SALON & BEAUTY. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </main>
  );
}
