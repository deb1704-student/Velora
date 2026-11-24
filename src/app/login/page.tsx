"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#722F37]">
        ÉLAN Salon & Beauty
      </p>

      <h1 className="mb-2 text-3xl font-semibold text-[#302326]">
        Welcome back
      </h1>

      <p className="mb-8 text-sm text-gray-600">
        Sign in to manage and complete your salon bookings.
      </p>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#722F37]"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#722F37]"
            placeholder="Enter your password"
          />
        </div>

        {message && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#722F37] py-3 font-semibold text-white transition hover:bg-[#57232B] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Do not have an account?{" "}
        <Link
          href={`/register${returnUrl !== "/" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`}
          className="font-semibold text-[#722F37] underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F4E7] px-4 py-12">
      <Suspense fallback={<p className="text-[#722F37]">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
