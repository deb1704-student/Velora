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
      "Registration successful! Please check your email to verify your account or sign in."
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#722F37]">
        ÉLAN Salon & Beauty
      </p>

      <h1 className="mb-2 text-3xl font-semibold text-[#302326]">
        Create your account
      </h1>

      <p className="mb-8 text-sm text-gray-600">
        Join us to discover and book bespoke salon services.
      </p>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#722F37]"
            placeholder="Enter your full name"
          />
        </div>

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
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#722F37]"
            placeholder="At least 8 characters"
          />
        </div>

        {message && (
          <p
            className={`rounded-lg p-3 text-sm ${
              isSuccess ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#722F37] py-3 font-semibold text-white transition hover:bg-[#57232B] disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href={`/login${returnUrl !== "/" ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`}
          className="font-semibold text-[#722F37] underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F4E7] px-4 py-12">
      <Suspense fallback={<p className="text-[#722F37]">Loading...</p>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
