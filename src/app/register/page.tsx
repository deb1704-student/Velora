"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data?.session) {
      router.push(returnUrl);
      router.refresh();
      return;
    }

    setIsSuccess(true);
    setMessage(
      "Account registered. Check your email inbox to verify before sign in."
    );
  }

  return (
    <div className="w-full max-w-md border border-[#722F37]/20 bg-white p-8 sm:p-10">
      <div className="mb-6 flex items-center justify-between border-b border-[#722F37]/15 pb-3 font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-[#722F37]">
        <span>REGISTRATION</span>
        <span>ONBOARD / 02</span>
      </div>

      <h1 className="text-3xl font-black uppercase tracking-tight text-[#492E2D]">
        CREATE ACCOUNT.
      </h1>

      <p className="mt-2 text-xs leading-relaxed text-[#776760]">
        Establish client identity to unlock instant scheduling and private ledger records.
      </p>

      <form onSubmit={handleRegister} className="mt-8 space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-[#302326]">
            FULL NAME / IDENTITY
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full border border-[#722F37]/25 bg-white px-4 py-3 font-mono text-xs text-[#302326] outline-none transition focus:border-[#722F37]"
            placeholder="Firstname Lastname"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-[#302326]">
            PRIMARY EMAIL
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-[#722F37]/25 bg-white px-4 py-3 font-mono text-xs text-[#302326] outline-none transition focus:border-[#722F37]"
            placeholder="client@domain.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-[#302326]">
            SECURITY KEY (MIN 8 CHARACTERS)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-[#722F37]/25 bg-white px-4 py-3 font-mono text-xs text-[#302326] outline-none transition focus:border-[#722F37]"
            placeholder="••••••••••••"
          />
        </div>

        {message && (
          <p
            className={`border p-3 font-mono text-xs uppercase ${
              isSuccess
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full border border-[#722F37] bg-[#722F37] py-4 font-mono text-xs font-bold tracking-[0.2em] uppercase text-white transition hover:bg-[#57232B] disabled:opacity-50"
        >
          {loading ? "INITIALIZING..." : "CONFIRM REGISTRATION"}
        </button>
      </form>

      <div className="mt-8 border-t border-[#722F37]/15 pt-5 text-center font-mono text-xs text-[#776760]">
        EXISTING ACCOUNT?{" "}
        <Link
          href={`/login${returnUrl !== "/" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`}
          className="font-bold text-[#722F37] underline"
        >
          SIGN IN
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F4E7] px-4 py-12">
      <Suspense fallback={<p className="font-mono text-xs text-[#722F37]">INITIALIZING...</p>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
