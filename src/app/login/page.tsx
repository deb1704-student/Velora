"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push(returnUrl);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md border border-[#722F37]/20 bg-white p-8 sm:p-10">
      <div className="mb-6 flex items-center justify-between border-b border-[#722F37]/15 pb-3 font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-[#722F37]">
        <span>CLIENT ACCESS</span>
        <span>ÉLAN STUDIOS</span>
      </div>

      <h1 className="text-3xl font-black uppercase tracking-tight text-[#492E2D]">
        WELCOME BACK.
      </h1>

      <p className="mt-2 text-xs leading-relaxed text-[#776760]">
        Sign in to view your appointments, explore signature rituals, and manage your profile.
      </p>

      <form onSubmit={handleLogin} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-[#302326]">
            EMAIL ADDRESS
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-[#722F37]/25 bg-white px-4 py-3 font-mono text-xs text-[#302326] outline-none transition focus:border-[#722F37]"
            placeholder="name@domain.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-[#302326]">
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-[#722F37]/25 bg-white px-4 py-3 font-mono text-xs text-[#302326] outline-none transition focus:border-[#722F37]"
            placeholder="••••••••••••"
          />
        </div>

        {message && (
          <p className="border border-red-300 bg-red-50 p-3 font-mono text-xs text-red-700 uppercase">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-[#722F37] bg-[#722F37] py-4 font-mono text-xs font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#57232B] disabled:opacity-50"
        >
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>

      <div className="mt-8 border-t border-[#722F37]/15 pt-5 text-center font-mono text-xs text-[#776760]">
        NEW CLIENT?{" "}
        <Link
          href={`/register${returnUrl !== "/" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`}
          className="font-bold text-[#722F37] underline"
        >
          REGISTER CREDENTIALS
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F4E7] px-4 py-12">
      <Suspense fallback={<p className="font-mono text-xs text-[#722F37]">INITIALIZING...</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
